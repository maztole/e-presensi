import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    const now = new Date();
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    let dayName = dayNames[now.getDay()];
    let targetDateStr = now.toISOString().split("T")[0];

    let year = now.getFullYear();
    let month = now.getMonth();
    let dayDate = now.getDate();

    if (date && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      year = y;
      month = m - 1;
      dayDate = d;
      const targetDate = new Date(y, m - 1, d, 12, 0, 0);
      dayName = dayNames[targetDate.getDay()];
      targetDateStr = date;
    }

    const startOfDay = new Date(year, month, dayDate, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, dayDate, 23, 59, 59, 999);
    const dateWhere = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // 1. Fetch all attendance logs for the target date
    const attendances = await prisma.attendance.findMany({
      where: {
        ...dateWhere,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        student: {
          include: {
            branch: true,
          },
        },
        branch: true,
        tutor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const validatedAttendances = attendances.map((a) => {
      const dateObj = a.date ? new Date(a.date) : new Date();
      const dayStr = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(dateObj);
      const dateFormatted = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(dateObj);

      const branchName = a.branch?.name || a.student?.branch?.name || "";
      const tentorName = a.tutor?.name || a.recordedBy || "-";

      return {
        id: a.id,
        studentId: a.studentId,
        studentName: a.student?.name || "Siswa",
        nis: a.student?.nis || "",
        parentPhone: a.student?.parentPhone || "",
        parentName: a.student?.parentName || "",
        branchId: a.branchId || a.student?.branchId || "",
        branchName,
        tutorId: a.tutorId || "",
        tentorName,
        gradeLevel: a.student?.gradeLevel || "",
        sessionInfo: a.sessionInfo || "",
        date: a.date ? new Date(a.date).toISOString().split("T")[0] : "-",
        fullDateFormatted: `${dayStr}, ${dateFormatted}`,
        timeIn: a.timeIn ? new Date(a.timeIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-",
        status: a.status,
        notes: a.notes || "-",
        isValidated: true,
      };
    });

    // 2. Fetch active schedules - LOGIC SEDERHANA: jika days mengandung "Sabtu" langsung ambil
    // HANYA ambil jadwal yang tanggal pembuatannya (createdAt) <= targetDate (tidak muncul di masa lalu sebelum dibuat)
    const endOfTargetDay = new Date(year, month, dayDate, 23, 59, 59, 999);
    const activeSchedules = await prisma.studentSchedule.findMany({
      where: {
        isActive: true,
        createdAt: { lte: endOfTargetDay },
        days: { contains: "Sabtu", mode: "insensitive" },
      },
      include: {
        student: {
          include: { branch: true },
        },
        branch: true,
        tutor: true,
      },
    });

    // Map each scheduled student to see if they are validated or still pending
    // Cek berdasarkan studentId + tanggal hari ini agar jadwal baru/edit hari Sabtu muncul di tab BELUM_VALIDASI
    const scheduledItems = activeSchedules.map((sch) => {
      const existingAtt = validatedAttendances.find(
        (a) => a.studentId === sch.studentId && a.date === targetDateStr
      );
      return {
        id: existingAtt ? existingAtt.id : `sch-${sch.id}`,
        scheduleId: sch.id,
        studentId: sch.studentId,
        studentName: sch.student?.name || "Siswa",
        nis: sch.student?.nis || "",
        gradeLevel: sch.student?.gradeLevel || "",
        parentPhone: sch.student?.parentPhone || "",
        parentName: sch.student?.parentName || "",
        branchId: sch.branchId || sch.student?.branchId || "",
        branchName: sch.branch?.name || sch.student?.branch?.name || "Cabang Utama",
        tutorId: existingAtt ? (existingAtt.tutorId || sch.tutorId || "") : (sch.tutorId || ""),
        tentorName: existingAtt ? (existingAtt.tentorName && existingAtt.tentorName !== "-" ? existingAtt.tentorName : (sch.tutor?.name || sch.tentorName || "-")) : (sch.tutor?.name || sch.tentorName || "-"),
        sessionInfo: `${sch.startTime} - ${sch.endTime}`,
        startTime: sch.startTime,
        endTime: sch.endTime,
        date: targetDateStr,
        dayName,
        status: existingAtt ? existingAtt.status : "BELUM_VALIDASI",
        notes: existingAtt ? existingAtt.notes : "Menunggu validasi tentor",
        isValidated: !!existingAtt,
        timeIn: existingAtt ? existingAtt.timeIn : "-",
      };
    });

    return NextResponse.json({
      success: true,
      dayName,
      data: validatedAttendances,
      scheduledItems,
    });
  } catch (error: any) {
    console.error("[GET /api/attendances] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Gagal memuat presensi" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, studentName, startTime, endTime, sessionInfo, status, notes, date, tentorName, tutorId, branchId } = body;

    let targetStudentId = studentId;

    if (!targetStudentId && studentName) {
      const existing = await prisma.student.findFirst({
        where: { name: { contains: studentName, mode: "insensitive" } },
      });
      if (existing) targetStudentId = existing.id;
    }

    if (!targetStudentId) {
      const newStd = await prisma.student.create({
        data: {
          nis: `NIS-${Date.now().toString().slice(-5)}`,
          name: studentName || "Siswa Baru",
        },
      });
      targetStudentId = newStd.id;
    }

    // Resolve tutorId: by id or by name lookup
    let resolvedTutorId: string | null = tutorId || null;
    if (!resolvedTutorId && tentorName && tentorName !== "-") {
      let tutor = await prisma.tutor.findFirst({
        where: { name: { contains: tentorName, mode: "insensitive" } },
      });
      if (!tutor) {
        tutor = await prisma.tutor.create({
          data: {
            nip: `TUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: tentorName,
            phone: "081234567890",
          },
        });
      }
      resolvedTutorId = tutor.id;
    }

    // Resolve student and branchId: use provided or fall back to student's branch
    const targetStudent = targetStudentId ? await prisma.student.findUnique({ where: { id: targetStudentId } }) : null;
    let resolvedBranchId: string | null = branchId || targetStudent?.branchId || null;

    const studentGrade = targetStudent?.gradeLevel || "";
    let normGrade = "SMA";
    if (studentGrade.toUpperCase().includes("SMP")) normGrade = "SMP";
    else if (studentGrade.toUpperCase().includes("SD")) normGrade = "SD";
    else if (studentGrade.toUpperCase().includes("SMA")) normGrade = "SMA";

    let attendanceDate = new Date();
    let startOfDay = new Date();
    let endOfDay = new Date();

    if (date && typeof date === "string" && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      attendanceDate = new Date(y, m - 1, d, 12, 0, 0);
      startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
      endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
    } else {
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay.setHours(23, 59, 59, 999);
    }

    let calculatedTimeIn = new Date(attendanceDate);
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        calculatedTimeIn.setHours(hours, minutes, 0, 0);
      }
    }

    const displaySession = startTime && endTime
      ? `${startTime} - ${endTime}`
      : sessionInfo || "";

    const newAttendance = await prisma.attendance.create({
      data: {
        studentId: targetStudentId,
        branchId: resolvedBranchId,
        tutorId: resolvedTutorId,
        date: attendanceDate,
        timeIn: calculatedTimeIn,
        status: (status?.toUpperCase() === "TIDAK_HADIR" ? "TIDAK_HADIR" : status?.toUpperCase()) as any,
        sessionInfo: displaySession,
        notes: notes || null,
        recordedBy: tentorName || null,
      },
    });

    // Otomatis buat presensi tentor (60 Menit) - tentor tetap dapat honor baik siswa HADIR maupun ALPA
    // Cek duplikat berdasarkan (tutorId + date + branchId + gradeLevel):
    // Jika tentor mengajar di jam/sesi beda (misal jenjang SMP jam 16:30 dan SMA jam 17:30), maka dibuatkan record presensi terpisah!
    if (resolvedTutorId) {
      try {
        let tutorTimeIn = new Date(attendanceDate);
        let tutorTimeOut = new Date(attendanceDate);
        if (startTime) {
          const [h, m] = startTime.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) tutorTimeIn.setHours(h, m, 0, 0);
        }
        if (endTime) {
          const [h, m] = endTime.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) tutorTimeOut.setHours(h, m, 0, 0);
        } else {
          tutorTimeOut = new Date(tutorTimeIn.getTime() + 60 * 60 * 1000);
        }

        const existingTutorAtt = await prisma.tutorAttendance.findFirst({
          where: {
            tutorId: resolvedTutorId,
            date: attendanceDate,
            branchId: resolvedBranchId,
            gradeLevel: normGrade,
            timeIn: tutorTimeIn,
          },
        });

        if (!existingTutorAtt) {
          await prisma.tutorAttendance.create({
            data: {
              tutorId: resolvedTutorId,
              branchId: resolvedBranchId,
              date: attendanceDate,
              timeIn: tutorTimeIn,
              timeOut: tutorTimeOut,
              gradeLevel: normGrade,
              teachingHours: 1.0,
              status: "HADIR",
              sessionTopic: notes || `Mengajar Sesi (${displaySession || "60 Menit"})`,
              notes: notes || `Presensi otomatis dari validasi siswa (${status?.toUpperCase() || "HADIR"})`,
              recordedBy: "SISTEM_VALIDASI",
            },
          });
        }
      } catch (tutorErr) {
        console.error("[Auto Tutor Attendance POST Error]:", tutorErr);
      }
    }

    return NextResponse.json({ success: true, data: newAttendance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mencatat presensi" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, studentId, studentName, startTime, endTime, sessionInfo, status, notes, date, tentorName, tutorId, branchId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID presensi dibutuhkan" }, { status: 400 });
    }

    let targetStudentId = studentId;
    if (!targetStudentId && studentName) {
      const existing = await prisma.student.findFirst({
        where: { name: { contains: studentName, mode: "insensitive" } },
      });
      if (existing) targetStudentId = existing.id;
    }

    // Resolve tutorId: by id or by name lookup
    let resolvedTutorId: string | null | undefined = tutorId !== undefined ? (tutorId || null) : undefined;
    if ((!resolvedTutorId || resolvedTutorId === null) && tentorName && tentorName !== "-") {
      let tutor = await prisma.tutor.findFirst({
        where: { name: { contains: tentorName, mode: "insensitive" } },
      });
      if (!tutor) {
        tutor = await prisma.tutor.create({
          data: {
            nip: `TUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: tentorName,
            phone: "081234567890",
          },
        });
      }
      resolvedTutorId = tutor.id;
    }

    // Resolve student and branchId
    const targetStudent = targetStudentId ? await prisma.student.findUnique({ where: { id: targetStudentId } }) : null;
    let resolvedBranchId: string | null | undefined = branchId !== undefined ? branchId : (targetStudent?.branchId || undefined);

    const studentGrade = targetStudent?.gradeLevel || "";
    let normGrade = "SMA";
    if (studentGrade.toUpperCase().includes("SMP")) normGrade = "SMP";
    else if (studentGrade.toUpperCase().includes("SD")) normGrade = "SD";
    else if (studentGrade.toUpperCase().includes("SMA")) normGrade = "SMA";

    let attendanceDate: Date | undefined = undefined;
    let startOfDay = new Date();
    let endOfDay = new Date();

    if (date && typeof date === "string" && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      attendanceDate = new Date(y, m - 1, d, 12, 0, 0);
      startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
      endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
    }

    let calculatedTimeIn: Date | undefined = undefined;
    if (startTime && attendanceDate) {
      const [hours, minutes] = startTime.split(":").map(Number);
      calculatedTimeIn = new Date(attendanceDate);
      if (!isNaN(hours) && !isNaN(minutes)) {
        calculatedTimeIn.setHours(hours, minutes, 0, 0);
      }
    }

    const displaySession = startTime && endTime
      ? `${startTime} - ${endTime}`
      : sessionInfo;

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        ...(targetStudentId ? { studentId: targetStudentId } : {}),
        ...(resolvedBranchId !== undefined ? { branchId: resolvedBranchId } : {}),
        ...(resolvedTutorId !== undefined ? { tutorId: resolvedTutorId } : {}),
        ...(attendanceDate ? { date: attendanceDate } : {}),
        ...(calculatedTimeIn ? { timeIn: calculatedTimeIn } : {}),
        ...(status ? { status: (status.toUpperCase() === "TIDAK_HADIR" ? "TIDAK_HADIR" : status.toUpperCase()) as any } : {}),
        ...(displaySession ? { sessionInfo: displaySession } : {}),
        notes: notes !== undefined ? notes : undefined,
        recordedBy: tentorName !== undefined ? tentorName : undefined,
      },
    });

    // Otomatis buat presensi tentor (60 Menit) - tentor tetap dapat honor baik siswa HADIR maupun ALPA
    // Cek duplikat berdasarkan (tutorId + date + branchId + gradeLevel + timeIn):
    // Jika tentor mengajar di jam/sesi beda (misal jenjang SMP jam 16:30 dan SMA jam 17:30), dibuatkan record presensi terpisah!
    const finalTutorId = resolvedTutorId !== undefined ? resolvedTutorId : updated.tutorId;
    const finalBranchId = resolvedBranchId !== undefined ? resolvedBranchId : updated.branchId;
    const finalDate = attendanceDate || updated.date;

    if (finalTutorId) {
      try {
        let tutorTimeIn = new Date(finalDate);
        let tutorTimeOut = new Date(finalDate);
        if (startTime) {
          const [h, m] = startTime.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) tutorTimeIn.setHours(h, m, 0, 0);
        } else if (updated.timeIn) {
          tutorTimeIn = new Date(updated.timeIn);
        }
        if (endTime) {
          const [h, m] = endTime.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) tutorTimeOut.setHours(h, m, 0, 0);
        } else {
          tutorTimeOut = new Date(tutorTimeIn.getTime() + 60 * 60 * 1000);
        }

        const existingTutorAtt = await prisma.tutorAttendance.findFirst({
          where: {
            tutorId: finalTutorId,
            date: finalDate,
            branchId: finalBranchId,
            gradeLevel: normGrade,
            timeIn: tutorTimeIn,
          },
        });

        if (!existingTutorAtt) {
          await prisma.tutorAttendance.create({
            data: {
              tutorId: finalTutorId,
              branchId: finalBranchId,
              date: finalDate,
              timeIn: tutorTimeIn,
              timeOut: tutorTimeOut,
              gradeLevel: normGrade,
              teachingHours: 1.0,
              status: "HADIR",
              sessionTopic: notes || `Mengajar Sesi (${displaySession || "60 Menit"})`,
              notes: notes || `Presensi otomatis dari validasi siswa (${status?.toUpperCase() || "HADIR"})`,
              recordedBy: "SISTEM_VALIDASI",
            },
          });
        }
      } catch (tutorErr) {
        console.error("[Auto Tutor Attendance PUT Error]:", tutorErr);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui presensi" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID presensi tidak ditemukan" }, { status: 400 });
    }

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Data presensi berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus data presensi" },
      { status: 500 }
    );
  }
}
