import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || "";
    const studentId = searchParams.get("studentId") || "";
    const query = searchParams.get("query") || "";

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (studentId) where.studentId = studentId;

    if (query) {
      where.OR = [
        { student: { name: { contains: query, mode: "insensitive" } } },
        { student: { nis: { contains: query, mode: "insensitive" } } },
        { days: { contains: query, mode: "insensitive" } },
        { tentorName: { contains: query, mode: "insensitive" } },
        { tutor: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    const schedules = await prisma.studentSchedule.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        student: {
          select: { id: true, name: true, nis: true, gradeLevel: true, schoolOrigin: true },
        },
        branch: {
          select: { id: true, name: true, code: true },
        },
        tutor: {
          select: { id: true, name: true, nip: true, specialization: true },
        },
      },
      orderBy: [{ student: { name: "asc" } }, { startTime: "asc" }],
    });

    // Check date-filtered attendances to attach todayStatus & attendanceId
    const dateParam = searchParams.get("date");
    
    const now = new Date();
    let targetStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    let targetEndOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateParam && dateParam.includes("-")) {
      const [y, m, d] = dateParam.split("-").map(Number);
      targetStartOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
      targetEndOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
    }

    const todayAttendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: targetStartOfDay,
          lte: targetEndOfDay,
        },
      },
    });

    const mappedSchedules = schedules.map((sch: any) => {
      const att = todayAttendances.find((a: any) => a.studentId === sch.studentId);
      return {
        ...sch,
        todayStatus: att ? att.status : "BELUM_PRESENSI",
        attendanceId: att ? att.id : undefined,
      };
    });

    return NextResponse.json({ success: true, data: mappedSchedules });
  } catch (error: any) {
    console.error("[GET /api/schedules] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat jadwal siswa" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, branchId, days, startTime, endTime, tutorId, tentorName, isActive } = body;

    if (!studentId || !branchId || !days || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Siswa, cabang, hari belajar, dan jam belajar wajib diisi!" },
        { status: 400 }
      );
    }

    const cleanTutorId = tutorId && String(tutorId).trim() !== "" ? String(tutorId).trim() : null;

    // Lookup tutor name if tutorId provided
    let resolvedTentorName = tentorName || null;
    if (cleanTutorId) {
      const tutorObj = await prisma.tutor.findUnique({ where: { id: cleanTutorId } });
      if (tutorObj) {
        resolvedTentorName = tutorObj.name;
      }
    }

    const newSchedule = await prisma.studentSchedule.create({
      data: {
        studentId,
        branchId,
        days,
        startTime,
        endTime,
        tutorId: cleanTutorId,
        tentorName: resolvedTentorName,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        student: {
          select: { id: true, name: true, nis: true, gradeLevel: true },
        },
        branch: {
          select: { id: true, name: true, code: true },
        },
        tutor: {
          select: { id: true, name: true, nip: true, specialization: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: newSchedule }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/schedules] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat jadwal siswa" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, studentId, branchId, days, startTime, endTime, tutorId, tentorName, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Jadwal diperlukan" }, { status: 400 });
    }

    const cleanTutorId = tutorId && String(tutorId).trim() !== "" ? String(tutorId).trim() : null;

    let resolvedTentorName = tentorName || null;
    if (cleanTutorId) {
      const tutorObj = await prisma.tutor.findUnique({ where: { id: cleanTutorId } });
      if (tutorObj) {
        resolvedTentorName = tutorObj.name;
      }
    }

    const updated = await prisma.studentSchedule.update({
      where: { id },
      data: {
        studentId,
        branchId,
        days,
        startTime,
        endTime,
        tutorId: cleanTutorId,
        tentorName: resolvedTentorName,
        isActive,
      },
      include: {
        student: {
          select: { id: true, name: true, nis: true, gradeLevel: true },
        },
        branch: {
          select: { id: true, name: true, code: true },
        },
        tutor: {
          select: { id: true, name: true, nip: true, specialization: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[PUT /api/schedules] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui jadwal" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID Jadwal diperlukan" }, { status: 400 });
    }

    await prisma.studentSchedule.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Jadwal siswa berhasil dihapus" });
  } catch (error: any) {
    console.error("[DELETE /api/schedules] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus jadwal" },
      { status: 500 }
    );
  }
}
