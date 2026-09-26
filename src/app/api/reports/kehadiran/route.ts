import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // format: "2026-09" (YYYY-MM)
    const type = searchParams.get("type") || "siswa"; // "siswa" | "tentor"

    // Parse month filter
    let dateStart: Date | undefined;
    let dateEnd: Date | undefined;
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      dateStart = new Date(year, mon - 1, 1);
      dateEnd = new Date(year, mon, 0, 23, 59, 59, 999); // last day of the month
    }

    if (type === "siswa") {
      // Get all active students
      const students = await prisma.student.findMany({
        where: { status: "ACTIVE" },
        include: {
          branch: true,
          schedules: { where: { isActive: true } },
        },
        orderBy: { name: "asc" },
      });

      // Get all attendances for the month
      const attendances = await prisma.attendance.findMany({
        where: {
          ...(dateStart && dateEnd
            ? { date: { gte: dateStart, lte: dateEnd } }
            : {}),
        },
        select: {
          studentId: true,
          status: true,
        },
      });

      // Group attendances by student
      const attendanceMap: Record<
        string,
        { hadir: number; tidak_hadir: number }
      > = {};

      for (const att of attendances) {
        if (!attendanceMap[att.studentId]) {
          attendanceMap[att.studentId] = { hadir: 0, tidak_hadir: 0 };
        }
        const m = attendanceMap[att.studentId];
        if (att.status === "HADIR") {
          m.hadir++;
        } else {
          m.tidak_hadir++;
        }
      }

      const result = students.map((s) => {
        const att = attendanceMap[s.id] || { hadir: 0, tidak_hadir: 0 };
        const totalSessions = att.hadir + att.tidak_hadir;
        const attendanceRate =
          totalSessions > 0
            ? parseFloat(((att.hadir / totalSessions) * 100).toFixed(1))
            : 0;

        return {
          id: s.id,
          nis: s.nis,
          name: s.name,
          gradeLevel: s.gradeLevel || "-",
          branchName: s.branch?.name || "-",
          totalSessions,
          hadir: att.hadir,
          tidak_hadir: att.tidak_hadir,
          attendanceRate,
        };
      });

      return NextResponse.json({ success: true, data: result });
    } else {
      // Tutor report
      const tutors = await prisma.tutor.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      });

      const tutorAttendances = await prisma.tutorAttendance.findMany({
        where: {
          ...(dateStart && dateEnd
            ? { date: { gte: dateStart, lte: dateEnd } }
            : {}),
        },
        select: {
          tutorId: true,
          status: true,
          teachingHours: true,
        },
      });

      const tutorMap: Record<
        string,
        { hadir: number; tidak_hadir: number; totalHours: number }
      > = {};

      for (const att of tutorAttendances) {
        if (!tutorMap[att.tutorId]) {
          tutorMap[att.tutorId] = { hadir: 0, tidak_hadir: 0, totalHours: 0 };
        }
        const m = tutorMap[att.tutorId];
        m.totalHours += att.teachingHours;
        if (att.status === "HADIR") {
          m.hadir++;
        } else {
          m.tidak_hadir++;
        }
      }

      const result = tutors.map((t) => {
        const att = tutorMap[t.id] || { hadir: 0, tidak_hadir: 0, totalHours: 0 };
        const totalSessions = att.hadir + att.tidak_hadir;
        const attendanceRate =
          totalSessions > 0
            ? parseFloat(((att.hadir / totalSessions) * 100).toFixed(1))
            : 0;

        return {
          id: t.id,
          nip: t.nip,
          name: t.name,
          specialization: t.specialization || "-",
          totalSessions,
          totalHours: att.totalHours,
          hadir: att.hadir,
          tidak_hadir: att.tidak_hadir,
          attendanceRate,
        };
      });

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.error("Report kehadiran error:", error);
    return NextResponse.json({ success: false, data: [], error: String(error) });
  }
}
