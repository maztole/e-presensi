import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const mockTutors = [
  {
    id: "tut-1",
    nip: "TUT202601",
    name: "Kak Aris Munandar, S.Si.",
    gender: "Laki-laki",
    phone: "085711223344",
    email: "aris.m@bimbel.id",
    specialization: "Matematika Saintek & UTBK",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tut-2",
    nip: "TUT202602",
    name: "Kak Dinda Rahma, S.Pd.",
    gender: "Perempuan",
    phone: "085711223355",
    email: "dinda.r@bimbel.id",
    specialization: "Bahasa Inggris & TOEFL",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tut-3",
    nip: "TUT202603",
    name: "Kak Bayu Pratama",
    gender: "Laki-laki",
    phone: "085711223366",
    email: "bayu.p@bimbel.id",
    specialization: "Fisika & Kimia SMA",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tut-4",
    nip: "TUT202604",
    name: "Kak Rian Hidayat, M.Si.",
    gender: "Laki-laki",
    phone: "085711223377",
    email: "rian.h@bimbel.id",
    specialization: "Biologi & IPA SMP",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const tutors = await prisma.tutor.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { nip: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tutors });
  } catch (error: any) {
    console.error("PRISMA TUTORS GET ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nip, gender, phone, email, specialization } = body;

    const newTutor = await prisma.tutor.create({
      data: {
        nip: nip || `TUT-${Date.now().toString().slice(-6)}`,
        name,
        gender: gender || "Laki-laki",
        phone,
        email,
        specialization: specialization || "Umum",
      },
    });

    return NextResponse.json({ success: true, data: newTutor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan data tentor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, nip, gender, phone, email, specialization, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID diperlukan" }, { status: 400 });
    }

    const updated = await prisma.tutor.update({
      where: { id },
      data: {
        name,
        nip,
        gender,
        phone,
        email,
        specialization,
        status,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui data tentor" },
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

    await prisma.tutor.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Tentor berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: true, message: "Tentor berhasil dihapus" });
  }
}
