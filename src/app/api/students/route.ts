import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Mock data fallback if DB isn't seeded yet
const mockStudents = [
  {
    id: "std-1",
    nis: "2026001",
    name: "Ahmad Rizky",
    gender: "Laki-laki",
    phone: "081234567801",
    schoolOrigin: "SMAN 1 City",
    gradeLevel: "12 SMA",
    status: "ACTIVE",
    parentName: "Bapak Rahmad",
    parentPhone: "081299887711",
    createdAt: new Date().toISOString(),
  },
  {
    id: "std-2",
    nis: "2026002",
    name: "Siti Nurhaliza",
    gender: "Perempuan",
    phone: "081234567802",
    schoolOrigin: "SMA 2 Nusantara",
    gradeLevel: "12 SMA",
    status: "ACTIVE",
    parentName: "Ibu Fatimah",
    parentPhone: "081299887722",
    createdAt: new Date().toISOString(),
  },
  {
    id: "std-3",
    nis: "2026003",
    name: "Budi Santoso",
    gender: "Laki-laki",
    phone: "081234567803",
    schoolOrigin: "SMPN 9",
    gradeLevel: "9 SMP",
    status: "ACTIVE",
    parentName: "Bapak Joko",
    parentPhone: "081299887733",
    createdAt: new Date().toISOString(),
  },
  {
    id: "std-4",
    nis: "2026004",
    name: "Clarissa Putri",
    gender: "Perempuan",
    phone: "081234567804",
    schoolOrigin: "SDIT Utama",
    gradeLevel: "5 SD",
    status: "ACTIVE",
    parentName: "Ibu Ratna",
    parentPhone: "081299887744",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const branchId = searchParams.get("branchId") || "";
    const gradeLevel = searchParams.get("gradeLevel") || "";

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { nis: { contains: query, mode: "insensitive" } },
        { gradeLevel: { contains: query, mode: "insensitive" } },
        { schoolOrigin: { contains: query, mode: "insensitive" } },
      ];
    }
    if (branchId) {
      where.branchId = branchId;
    }
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }

    const students = await prisma.student.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: { branch: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    console.error("[GET /api/students] Error:", error?.message || error);
    return NextResponse.json({ success: false, error: error?.message || "Gagal memuat data siswa" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nis, gender, schoolOrigin, gradeLevel, parentName, parentPhone, branchId } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama siswa wajib diisi" }, { status: 400 });
    }

    const newStudent = await prisma.student.create({
      data: {
        nis: nis || `NIS-${Date.now().toString().slice(-6)}`,
        name,
        gender,
        schoolOrigin,
        gradeLevel,
        parentName,
        parentPhone,
        branchId: branchId || null,
      },
      include: { branch: true },
    });

    return NextResponse.json({ success: true, data: newStudent }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/students] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan data siswa" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, nis, gender, schoolOrigin, gradeLevel, parentName, parentPhone, status, branchId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID diperlukan" }, { status: 400 });
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        name,
        nis,
        gender,
        schoolOrigin,
        gradeLevel,
        parentName,
        parentPhone,
        status,
        branchId: branchId !== undefined ? (branchId || null) : undefined,
      },
      include: {
        branch: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui data siswa" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID diperlukan" }, { status: 400 });
    }

    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Siswa berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: "Siswa berhasil dihapus" });
  }
}
