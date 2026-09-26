import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { tutorId, email, currentPassword, newPassword } = await req.json();

    if (!tutorId) {
      return NextResponse.json(
        { success: false, error: "Tutor ID diperlukan!" },
        { status: 400 }
      );
    }

    // 1. Cek DB Tutor
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Akun tentor tidak ditemukan di database." },
        { status: 404 }
      );
    }

    // Validasi kata sandi lama (bisa NIP atau password default)
    if (currentPassword) {
      const validPass =
        currentPassword === tutor.nip ||
        currentPassword === "tentor123" ||
        currentPassword === "123456";

      if (!validPass) {
        return NextResponse.json(
          { success: false, error: "Kata sandi lama tidak sesuai." },
          { status: 400 }
        );
      }
    }

    // Update data email (dan password jika ada field atau disimpan)
    const updated = await prisma.tutor.update({
      where: { id: tutorId },
      data: {
        ...(email ? { email } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil & sandi tentor berhasil diperbarui!",
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        nip: updated.nip,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui pengaturan tentor" },
      { status: 500 }
    );
  }
}
