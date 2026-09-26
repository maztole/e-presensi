import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // 1. Fetch Today's Student Attendances
    const studentAttendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
            parentPhone: true,
            branch: {
              select: {
                name: true,
              },
            },
          },
        },
        tutor: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { timeIn: "desc" },
    });

    // 2. Fetch Today's Tutor Attendances
    const tutorAttendances = await prisma.tutorAttendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            phone: true,
            specialization: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { timeIn: "desc" },
    });

    // 3. Fetch Student Schedules for Today (by day name in Indonesian)
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const todayDayName = dayNames[today.getDay()];

    const activeSchedules = await prisma.studentSchedule.findMany({
      where: {
        isActive: true,
        days: {
          contains: todayDayName,
          mode: "insensitive",
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
    });

    // Calculate Status Distribution (Student + Tutor)
    const statusCounts: Record<string, number> = {
      HADIR: 0,
      TIDAK_HADIR: 0,
    };

    studentAttendances.forEach((a) => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status]++;
    });

    tutorAttendances.forEach((ta) => {
      if (statusCounts[ta.status] !== undefined) statusCounts[ta.status]++;
    });

    // Recent Activity List (merge student & tutor recent attendances)
    const recentActivities = [
      ...studentAttendances.map((sa) => {
        const grade = sa.student.gradeLevel || "Siswa";
        const branchName = sa.branch?.name || sa.student?.branch?.name || "";
        return {
          id: `s-${sa.id}`,
          name: sa.student.name,
          role: "siswa" as const,
          classOrSubject: branchName ? `${grade} - ${branchName}` : grade,
          timestamp: new Date(sa.timeIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          status: sa.status.toLowerCase(),
          rawDate: sa.timeIn,
        };
      }),
      ...tutorAttendances.map((ta) => {
        const grade = ta.gradeLevel ? `Jenjang ${ta.gradeLevel}` : "Jenjang -";
        const branchName = ta.branch?.name || "";
        return {
          id: `t-${ta.id}`,
          name: ta.tutor.name,
          role: "tutor" as const,
          classOrSubject: branchName ? `${grade} - ${branchName}` : grade,
          timestamp: new Date(ta.timeIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          status: ta.status.toLowerCase(),
          rawDate: ta.timeIn,
        };
      }),
    ].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()).slice(0, 7);

    // Absence List (Tidak Hadir)
    const absenceList = [
      ...studentAttendances
        .filter((sa) => sa.status === "IZIN" || sa.status === "ALPA" || sa.status === "SAKIT")
        .map((sa) => ({
          id: sa.id,
          name: sa.student.name,
          role: "siswa" as const,
          classOrSubject: sa.sessionInfo || sa.student.gradeLevel || "Bimbel",
          status: "tidak_hadir" as const,
          reason: sa.notes || "Tidak ada keterangan",
          parentPhone: sa.student.parentPhone || undefined,
        })),
      ...tutorAttendances
        .filter((ta) => ta.status === "IZIN" || ta.status === "ALPA" || ta.status === "SAKIT")
        .map((ta) => ({
          id: ta.id,
          name: ta.tutor.name,
          role: "tutor" as const,
          classOrSubject: ta.sessionTopic || ta.tutor.specialization || "Tentor",
          status: "tidak_hadir" as const,
          reason: ta.notes || "Tidak ada keterangan",
          parentPhone: ta.tutor.phone || undefined,
        })),
    ];

    // Schedules formatted for TodaySchedule component
    const formattedSchedules = activeSchedules.map((sch) => {
      // Calculate attendance for this schedule's student/tutor today
      const attendedCount = studentAttendances.filter((sa) => sa.studentId === sch.studentId && sa.status === "HADIR").length;
      return {
        id: sch.id,
        className: `${sch.student.name} (${sch.student.gradeLevel || "Siswa"})`,
        subject: sch.tentorName || sch.tutor?.name || "Bimbel",
        tutor: sch.tutor?.name || sch.tentorName || "Tentor",
        room: sch.branch.name,
        time: `${sch.startTime} - ${sch.endTime}`,
        studentsAttended: attendedCount,
        totalStudents: 1,
        status: attendedCount > 0 ? ("completed" as const) : ("upcoming" as const),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        statusDistribution: [
          { name: "Hadir", value: statusCounts.HADIR, color: "#10b981" },
          { name: "Tidak Hadir", value: statusCounts.TIDAK_HADIR, color: "#ef4444" },
        ],
        recentActivities,
        absenceList,
        schedules: formattedSchedules,
      },
    });
  } catch (error: any) {
    console.error("Gagal mengambil data dashboard hari ini:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data dashboard hari ini" },
      { status: 500 }
    );
  }
}
