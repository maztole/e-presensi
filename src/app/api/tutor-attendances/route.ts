import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month"); // YYYY-MM
    const tutorId = searchParams.get("tutorId");
    const tutorName = searchParams.get("tutorName");
    const status = searchParams.get("status");

    let dateWhere: any = {};
    let startOfDay = new Date();
    let endOfDay = new Date();

    if (month && month.includes("-")) {
      const [year, mon] = month.split("-").map(Number);
      startOfDay = new Date(year, mon - 1, 1, 0, 0, 0, 0);
      endOfDay = new Date(year, mon, 0, 23, 59, 59, 999);
      dateWhere = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    } else if (date && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
      endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
      dateWhere = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    // Auto-sync missing TutorAttendance from validated Student Attendances for target range
    if ((date && date.includes("-")) || (month && month.includes("-"))) {
      try {
        const studentAtts = await prisma.attendance.findMany({
          where: {
            date: { gte: startOfDay, lte: endOfDay },
          },
          include: { tutor: true, student: true },
        });

        for (const sa of studentAtts) {
          let tId = sa.tutorId;
          const tName = sa.tutor?.name || sa.recordedBy;

          if (!tId && tName && tName !== "-") {
            let existingTutor = await prisma.tutor.findFirst({
              where: { name: { contains: tName, mode: "insensitive" } },
            });
            if (!existingTutor) {
              existingTutor = await prisma.tutor.create({
                data: {
                  nip: `TUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  name: tName,
                  phone: "081234567890",
                },
              });
            }
            tId = existingTutor.id;
            await prisma.attendance.update({
              where: { id: sa.id },
              data: { tutorId: tId },
            });
          }

          if (tId) {
            const studentGrade = sa.student?.gradeLevel || "";
            let normGrade = "SMA";
            if (studentGrade.toUpperCase().includes("SMP")) normGrade = "SMP";
            else if (studentGrade.toUpperCase().includes("SD")) normGrade = "SD";
            else if (studentGrade.toUpperCase().includes("SMA")) normGrade = "SMA";

            // Tentukan awal dan akhir hari untuk tanggal presensi ini
            const saDate = sa.date ? new Date(sa.date) : new Date();
            const saDayStart = new Date(saDate.getFullYear(), saDate.getMonth(), saDate.getDate(), 0, 0, 0, 0);
            const saDayEnd = new Date(saDate.getFullYear(), saDate.getMonth(), saDate.getDate(), 23, 59, 59, 999);

            const timeInDate = sa.timeIn ? new Date(sa.timeIn) : new Date(sa.date);

            // Cari existing TutorAttendance dalam rentang hari yang sama untuk tentor & jenjang ini
            const existingTutorAtt = await prisma.tutorAttendance.findFirst({
              where: {
                tutorId: tId,
                date: { gte: saDayStart, lte: saDayEnd },
                gradeLevel: normGrade,
                ...(sa.branchId ? { branchId: sa.branchId } : {}),
              },
            });

            if (!existingTutorAtt) {
              await prisma.tutorAttendance.create({
                data: {
                  tutorId: tId,
                  branchId: sa.branchId,
                  date: sa.date,
                  timeIn: timeInDate,
                  timeOut: new Date(timeInDate.getTime() + 60 * 60 * 1000),
                  gradeLevel: normGrade,
                  teachingHours: 1.0,
                  status: "HADIR",
                  sessionTopic: (sa as any).materi || sa.sessionInfo || `Mengajar ${normGrade}`,
                  notes: sa.notes || `Presensi otomatis dari validasi siswa (${sa.status})`,
                  recordedBy: "SISTEM_VALIDASI",
                },
              });
            } else if (existingTutorAtt.recordedBy === "SISTEM_VALIDASI") {
              // Update jenjang jika sebelumnya salah default ke SMA
              if (existingTutorAtt.gradeLevel !== normGrade) {
                await prisma.tutorAttendance.update({
                  where: { id: existingTutorAtt.id },
                  data: { gradeLevel: normGrade },
                });
              }
            }
          }
        }
      } catch (syncErr) {
        console.error("[Auto-sync TutorAttendance Error]:", syncErr);
      }
    }

    const tutorCondition: any = {};
    if (tutorId) {
      tutorCondition.tutorId = tutorId;
    } else if (tutorName) {
      tutorCondition.tutor = { name: { contains: tutorName, mode: "insensitive" } };
    }

    const attendances = await prisma.tutorAttendance.findMany({
      where: {
        ...dateWhere,
        ...tutorCondition,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        tutor: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Deduplikasi record berulang pada tanggal, tentor, jenjang, & cabang yang sama
    const uniqueMap = new Map<string, any>();

    for (const a of attendances) {
      const dateObj = a.date ? new Date(a.date) : new Date();
      const dateKey = dateObj.toISOString().split("T")[0];
      const tId = a.tutorId || a.recordedBy || "unknown";
      const branchKey = a.branchId || "default";
      const gradeKey = a.gradeLevel || "SMA";
      const dedupeKey = `${tId}_${dateKey}_${gradeKey}_${branchKey}`;

      if (!uniqueMap.has(dedupeKey)) {
        const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(dateObj);
        const dateFormatted = new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(dateObj);

        const timeInStr = a.timeIn ? new Date(a.timeIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-";
        const timeOutStr = a.timeOut ? new Date(a.timeOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
        const timeDisplay = timeOutStr ? `${timeInStr} - ${timeOutStr}` : timeInStr;

        uniqueMap.set(dedupeKey, {
          id: a.id,
          tutorId: a.tutorId,
          tutorName: a.tutor?.name || a.recordedBy || "Tentor",
          branchId: a.branchId || "",
          branchName: a.branch?.name || "Cabang Utama",
          sessionTopic: a.sessionTopic || "Sesi Pembelajaran",
          gradeLevel: a.gradeLevel || "SMA",
          teachingHours: a.teachingHours,
          date: dateKey,
          fullDateFormatted: `${dayName}, ${dateFormatted}`,
          timeIn: timeInStr,
          timeOut: timeOutStr,
          timeDisplay,
          status: a.status,
          notes: a.notes,
        });
      }
    }

    const formatted = Array.from(uniqueMap.values());

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tutorId, tutorName, branchId, sessionTopic, gradeLevel, teachingHours, status, notes, date, startTime, endTime } = body;

    let targetTutorId = tutorId;

    if (!targetTutorId && tutorName) {
      const existing = await prisma.tutor.findFirst({
        where: { name: { contains: tutorName, mode: "insensitive" } },
      });
      if (existing) targetTutorId = existing.id;
    }

    if (!targetTutorId) {
      const newTut = await prisma.tutor.create({
        data: {
          nip: `TUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: tutorName || "Tentor Baru",
          phone: "081234567890",
        },
      });
      targetTutorId = newTut.id;
    }

    // Resolve branchId: if not passed, find first branch or default
    let resolvedBranchId = branchId || null;
    if (!resolvedBranchId) {
      const firstBranch = await prisma.branch.findFirst({ where: { isActive: true } });
      resolvedBranchId = firstBranch?.id || null;
    }

    const attendanceDate = date ? new Date(date) : new Date();
    let calculatedTimeIn = new Date();
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      calculatedTimeIn = new Date(attendanceDate);
      if (!isNaN(hours) && !isNaN(minutes)) {
        calculatedTimeIn.setHours(hours, minutes, 0, 0);
      }
    }

    let calculatedTimeOut: Date | null = null;
    if (endTime) {
      const [hours, minutes] = endTime.split(":").map(Number);
      calculatedTimeOut = new Date(attendanceDate);
      if (!isNaN(hours) && !isNaN(minutes)) {
        calculatedTimeOut.setHours(hours, minutes, 0, 0);
      }
    }

    let newAttendance;
    try {
      newAttendance = await prisma.tutorAttendance.create({
        data: {
          tutorId: targetTutorId,
          branchId: resolvedBranchId,
          date: attendanceDate,
          timeIn: calculatedTimeIn,
          timeOut: calculatedTimeOut,
          status: status?.toUpperCase() || "HADIR",
          sessionTopic: sessionTopic || "Mengajar Reguler",
          gradeLevel: gradeLevel || "SMA",
          teachingHours: teachingHours ? Number(teachingHours) : 1.0,
          notes: notes || null,
          recordedBy: tutorName || null,
        } as any,
      });
    } catch (e: any) {
      if (e?.message?.includes("branchId")) {
        newAttendance = await prisma.tutorAttendance.create({
          data: {
            tutorId: targetTutorId,
            date: attendanceDate,
            timeIn: calculatedTimeIn,
            timeOut: calculatedTimeOut,
            status: status?.toUpperCase() || "HADIR",
            sessionTopic: sessionTopic || "Mengajar Reguler",
            gradeLevel: gradeLevel || "SMA",
            teachingHours: teachingHours ? Number(teachingHours) : 1.0,
            notes: notes || null,
            recordedBy: tutorName || null,
          },
        });
      } else {
        throw e;
      }
    }

    return NextResponse.json({ success: true, data: newAttendance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mencatat presensi tentor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, tutorId, tutorName, branchId, sessionTopic, gradeLevel, teachingHours, status, notes, date, startTime, endTime } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID presensi tentor dibutuhkan" }, { status: 400 });
    }

    let targetTutorId = tutorId;
    if (!targetTutorId && tutorName) {
      const existing = await prisma.tutor.findFirst({
        where: { name: { contains: tutorName, mode: "insensitive" } },
      });
      if (existing) targetTutorId = existing.id;
    }

    const attendanceDate = date ? new Date(date) : undefined;
    let calculatedTimeIn: Date | undefined = undefined;
    if (startTime && attendanceDate) {
      const [hours, minutes] = startTime.split(":").map(Number);
      calculatedTimeIn = new Date(attendanceDate);
      if (!isNaN(hours) && !isNaN(minutes)) {
        calculatedTimeIn.setHours(hours, minutes, 0, 0);
      }
    }

    let calculatedTimeOut: Date | undefined = undefined;
    if (endTime && attendanceDate) {
      const [hours, minutes] = endTime.split(":").map(Number);
      calculatedTimeOut = new Date(attendanceDate);
      if (!isNaN(hours) && !isNaN(minutes)) {
        calculatedTimeOut.setHours(hours, minutes, 0, 0);
      }
    }

    let updated;
    try {
      updated = await prisma.tutorAttendance.update({
        where: { id },
        data: {
          ...(targetTutorId ? { tutorId: targetTutorId } : {}),
          ...(branchId !== undefined ? { branchId } : {}),
          ...(attendanceDate ? { date: attendanceDate } : {}),
          ...(calculatedTimeIn ? { timeIn: calculatedTimeIn } : {}),
          ...(calculatedTimeOut !== undefined ? { timeOut: calculatedTimeOut } : {}),
          ...(status ? { status: status.toUpperCase() as any } : {}),
          ...(sessionTopic ? { sessionTopic } : {}),
          ...(gradeLevel ? { gradeLevel } : {}),
          ...(teachingHours ? { teachingHours: Number(teachingHours) } : {}),
          notes: notes !== undefined ? notes : undefined,
          recordedBy: tutorName !== undefined ? tutorName : undefined,
        } as any,
      });
    } catch (e: any) {
      updated = await prisma.tutorAttendance.update({
        where: { id },
        data: {
          ...(targetTutorId ? { tutorId: targetTutorId } : {}),
          ...(attendanceDate ? { date: attendanceDate } : {}),
          ...(calculatedTimeIn ? { timeIn: calculatedTimeIn } : {}),
          ...(calculatedTimeOut !== undefined ? { timeOut: calculatedTimeOut } : {}),
          ...(status ? { status: status.toUpperCase() as any } : {}),
          ...(sessionTopic ? { sessionTopic } : {}),
          ...(gradeLevel ? { gradeLevel } : {}),
          ...(teachingHours ? { teachingHours: Number(teachingHours) } : {}),
          notes: notes !== undefined ? notes : undefined,
          recordedBy: tutorName !== undefined ? tutorName : undefined,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui presensi tentor" },
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

    await prisma.tutorAttendance.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Data presensi tentor berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus data presensi tentor" },
      { status: 500 }
    );
  }
}
