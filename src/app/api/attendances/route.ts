import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const monthParam = searchParams.get("month");
    const status = searchParams.get("status");

    const now = new Date();
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    let dayName = dayNames[now.getDay()];
    let targetDateStr = now.toISOString().split("T")[0];

    let year = now.getFullYear();
    let month = now.getMonth();
    let dayDate = now.getDate();

    let dateWhere: any = {};

    if (monthParam && monthParam.includes("-")) {
      const [y, m] = monthParam.split("-").map(Number);
      year = y;
      month = m - 1;
      const startOfMonth = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(y, m - 1, new Date(y, m, 0).getDate(), 23, 59, 59, 999));
      dateWhere = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
      // Untuk mode bulan, targetDateStr diisi awal bulan agar konsisten
      targetDateStr = `${y}-${String(m).padStart(2, "0")}-01`;
    } else if (date && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      year = y;
      month = m - 1;
      dayDate = d;
      const targetDate = new Date(y, m - 1, d, 12, 0, 0);
      dayName = dayNames[targetDate.getDay()];
      targetDateStr = date;

      const startOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
      dateWhere = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

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
        materi: (a as any).materi || "",
        notes: a.notes || "-",
        isValidated: true,
      };
    });

    // 2. Fetch active schedules - hanya untuk mode harian (date), skip jika mode bulanan (month)
    let scheduledItems: any[] = [];
    if (!monthParam) {
      const endOfTargetDay = new Date(year, month, dayDate, 23, 59, 59, 999);
      const activeSchedules = await prisma.studentSchedule.findMany({
        where: {
          isActive: true,
          createdAt: { lte: endOfTargetDay },
          days: { contains: dayName, mode: "insensitive" },
        },
        include: {
          student: {
            include: { branch: true },
          },
          branch: true,
          tutor: true,
        },
      });

      scheduledItems = activeSchedules.map((sch) => {
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
          materi: existingAtt ? (existingAtt.materi || "") : "",
          notes: existingAtt ? existingAtt.notes : "Menunggu validasi tentor",
          isValidated: !!existingAtt,
          timeIn: existingAtt ? existingAtt.timeIn : "-",
        };
      });
    }

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
    const { studentId, studentName, startTime, endTime, sessionInfo, status, notes, date, tentorName, tutorId, branchId, materi } = body;

    let targetStudentId = studentId;
    let targetStudent = null;

    if (targetStudentId) {
      targetStudent = await prisma.student.findUnique({ where: { id: targetStudentId } });
    }

    if (!targetStudent && studentName) {
      targetStudent = await prisma.student.findFirst({
        where: { name: { contains: studentName, mode: "insensitive" } },
      });
    }

    if (!targetStudent) {
      targetStudent = await prisma.student.create({
        data: {
          nis: `NIS-${Date.now().toString().slice(-5)}`,
          name: studentName || "Siswa Baru",
        },
      });
    }
    targetStudentId = targetStudent.id;

    // Resolve tutorId: verify existence or lookup/create by name
    let resolvedTutorId: string | null = null;
    if (tutorId) {
      const tutorExists = await prisma.tutor.findUnique({ where: { id: tutorId } });
      if (tutorExists) resolvedTutorId = tutorExists.id;
    }

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

    // Resolve branchId: verify existence or fallback to student's branch
    let resolvedBranchId: string | null = null;
    const candidateBranchId = branchId || targetStudent?.branchId;
    if (candidateBranchId) {
      const branchExists = await prisma.branch.findUnique({ where: { id: candidateBranchId } });
      if (branchExists) resolvedBranchId = branchExists.id;
    }

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
      attendanceDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
      startOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
      endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
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

    let validStatus: any = "HADIR";
    const upperStatus = status?.toString().toUpperCase();
    if (["HADIR", "TIDAK_HADIR", "IZIN", "ALPA", "SAKIT"].includes(upperStatus)) {
      validStatus = upperStatus;
    }

    // Check if attendance already exists on target day for this student
    const existingAtt = await prisma.attendance.findFirst({
      where: {
        studentId: targetStudentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let newAttendance;
    try {
      if (existingAtt) {
        newAttendance = await prisma.attendance.update({
          where: { id: existingAtt.id },
          data: {
            branchId: resolvedBranchId,
            tutorId: resolvedTutorId,
            status: validStatus,
            sessionInfo: displaySession,
            materi: materi !== undefined ? (materi || null) : existingAtt.materi,
            notes: notes !== undefined ? (notes || null) : existingAtt.notes,
            recordedBy: tentorName || null,
          },
        });
      } else {
        newAttendance = await prisma.attendance.create({
          data: {
            studentId: targetStudentId,
            branchId: resolvedBranchId,
            tutorId: resolvedTutorId,
            date: attendanceDate,
            timeIn: calculatedTimeIn,
            status: validStatus,
            sessionInfo: displaySession,
            materi: materi || null,
            notes: notes || null,
            recordedBy: tentorName || null,
          },
        });
      }
    } catch (createErr: any) {
      if (createErr?.message?.includes("Unknown argument `materi`")) {
        // Fallback for cached Prisma Client in Next.js dev server memory
        if (existingAtt) {
          newAttendance = await prisma.attendance.update({
            where: { id: existingAtt.id },
            data: {
              branchId: resolvedBranchId,
              tutorId: resolvedTutorId,
              status: validStatus,
              sessionInfo: displaySession,
              notes: notes !== undefined ? (notes || null) : existingAtt.notes,
              recordedBy: tentorName || null,
            },
          });
        } else {
          newAttendance = await prisma.attendance.create({
            data: {
              studentId: targetStudentId,
              branchId: resolvedBranchId,
              tutorId: resolvedTutorId,
              date: attendanceDate,
              timeIn: calculatedTimeIn,
              status: validStatus,
              sessionInfo: displaySession,
              notes: notes || null,
              recordedBy: tentorName || null,
            },
          });
        }
        if (materi && newAttendance?.id) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "attendances" SET "materi" = $1 WHERE "id" = $2`,
              materi,
              newAttendance.id
            );
            (newAttendance as any).materi = materi;
          } catch (e) {
            console.error("[Raw Materi Update Error]:", e);
          }
        }
      } else {
        throw createErr;
      }
    }

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
    const { id, studentId, studentName, startTime, endTime, sessionInfo, status, notes, date, tentorName, tutorId, branchId, materi } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID presensi dibutuhkan" }, { status: 400 });
    }

    let targetStudentId = studentId;
    let targetStudent = null;
    if (targetStudentId) {
      targetStudent = await prisma.student.findUnique({ where: { id: targetStudentId } });
    }
    if (!targetStudent && studentName) {
      targetStudent = await prisma.student.findFirst({
        where: { name: { contains: studentName, mode: "insensitive" } },
      });
      if (targetStudent) targetStudentId = targetStudent.id;
    }

    // Resolve tutorId: verify existence or lookup/create by name
    let resolvedTutorId: string | null | undefined = undefined;
    if (tutorId) {
      const tutorExists = await prisma.tutor.findUnique({ where: { id: tutorId } });
      if (tutorExists) resolvedTutorId = tutorExists.id;
      else resolvedTutorId = null;
    }

    if ((resolvedTutorId === undefined || resolvedTutorId === null) && tentorName && tentorName !== "-") {
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

    // Resolve branchId: verify existence
    let resolvedBranchId: string | null | undefined = undefined;
    const candidateBranchId = branchId || targetStudent?.branchId;
    if (candidateBranchId) {
      const branchExists = await prisma.branch.findUnique({ where: { id: candidateBranchId } });
      if (branchExists) resolvedBranchId = branchExists.id;
      else resolvedBranchId = null;
    }

    const studentGrade = targetStudent?.gradeLevel || "";
    let normGrade = "SMA";
    if (studentGrade.toUpperCase().includes("SMP")) normGrade = "SMP";
    else if (studentGrade.toUpperCase().includes("SD")) normGrade = "SD";
    else if (studentGrade.toUpperCase().includes("SMA")) normGrade = "SMA";

    let attendanceDate: Date | undefined = undefined;
    if (date && typeof date === "string" && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      attendanceDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
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

    let validStatus: any = undefined;
    if (status) {
      const upperStatus = status.toString().toUpperCase();
      if (["HADIR", "TIDAK_HADIR", "IZIN", "ALPA", "SAKIT"].includes(upperStatus)) {
        validStatus = upperStatus;
      } else {
        validStatus = "HADIR";
      }
    }

    // Check if updating an existing non-sch record or sch- item
    const recordExists = id && !id.startsWith("sch-") ? await prisma.attendance.findUnique({ where: { id } }) : null;

    let updated;
    try {
      if (recordExists) {
        updated = await prisma.attendance.update({
          where: { id },
          data: {
            ...(targetStudentId ? { studentId: targetStudentId } : {}),
            ...(resolvedBranchId !== undefined ? { branchId: resolvedBranchId } : {}),
            ...(resolvedTutorId !== undefined ? { tutorId: resolvedTutorId } : {}),
            ...(attendanceDate ? { date: attendanceDate } : {}),
            ...(calculatedTimeIn ? { timeIn: calculatedTimeIn } : {}),
            ...(validStatus ? { status: validStatus } : {}),
            ...(displaySession ? { sessionInfo: displaySession } : {}),
            materi: materi !== undefined ? (materi || null) : undefined,
            notes: notes !== undefined ? (notes || null) : undefined,
            recordedBy: tentorName !== undefined ? tentorName : undefined,
          },
        });
      } else {
        // Fallback create if PUT called on schedule item
        const finalStudentId = targetStudentId || studentId;
        updated = await prisma.attendance.create({
          data: {
            studentId: finalStudentId,
            branchId: resolvedBranchId || null,
            tutorId: resolvedTutorId || null,
            date: attendanceDate || new Date(),
            timeIn: calculatedTimeIn || new Date(),
            status: validStatus || "HADIR",
            sessionInfo: displaySession || "",
            materi: materi || null,
            notes: notes || null,
            recordedBy: tentorName || null,
          },
        });
      }
    } catch (updateErr: any) {
      if (updateErr?.message?.includes("Unknown argument `materi`")) {
        if (recordExists) {
          updated = await prisma.attendance.update({
            where: { id },
            data: {
              ...(targetStudentId ? { studentId: targetStudentId } : {}),
              ...(resolvedBranchId !== undefined ? { branchId: resolvedBranchId } : {}),
              ...(resolvedTutorId !== undefined ? { tutorId: resolvedTutorId } : {}),
              ...(attendanceDate ? { date: attendanceDate } : {}),
              ...(calculatedTimeIn ? { timeIn: calculatedTimeIn } : {}),
              ...(validStatus ? { status: validStatus } : {}),
              ...(displaySession ? { sessionInfo: displaySession } : {}),
              notes: notes !== undefined ? (notes || null) : undefined,
              recordedBy: tentorName !== undefined ? tentorName : undefined,
            },
          });
        } else {
          const finalStudentId = targetStudentId || studentId;
          updated = await prisma.attendance.create({
            data: {
              studentId: finalStudentId,
              branchId: resolvedBranchId || null,
              tutorId: resolvedTutorId || null,
              date: attendanceDate || new Date(),
              timeIn: calculatedTimeIn || new Date(),
              status: validStatus || "HADIR",
              sessionInfo: displaySession || "",
              notes: notes || null,
              recordedBy: tentorName || null,
            },
          });
        }
        if (materi && updated?.id) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "attendances" SET "materi" = $1 WHERE "id" = $2`,
              materi,
              updated.id
            );
            (updated as any).materi = materi;
          } catch (e) {
            console.error("[Raw Materi Update Error]:", e);
          }
        }
      } else {
        throw updateErr;
      }
    }

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
