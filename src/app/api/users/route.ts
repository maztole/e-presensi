import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role"); // "ADMIN" | "TENTOR" | null

    // 1. Ambil Akun Admin & Staff & User Tentor dari tabel User
    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        createdAt: true,
      },
    });

    const userMapByEmail = new Map<string, string>();
    const userMapById = new Map<string, string>();
    allUsers.forEach((u) => {
      userMapByEmail.set(u.email, u.passwordHash);
      userMapById.set(u.id, u.passwordHash);
    });

    // 1. Ambil Akun Admin & Staff dari tabel User
    let adminUsers: any[] = [];
    if (!roleFilter || roleFilter === "ADMIN") {
      adminUsers = allUsers
        .filter((u) => u.role !== "TENTOR")
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.email,
          role: u.role, // ADMIN, SUPERADMIN, STAFF
          accountType: "ADMIN",
          password: u.passwordHash,
          createdAt: u.createdAt,
        }));
    }

    // 2. Ambil Akun Tentor dari tabel Tutor
    let tutorAccounts: any[] = [];
    if (!roleFilter || roleFilter === "TENTOR") {
      const tutors = await prisma.tutor.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          nip: true,
          email: true,
          phone: true,
          specialization: true,
          status: true,
          createdAt: true,
        },
      });

      // Kumpulkan ID dan Email tutor yang sudah terdaftar
      const registeredTutorIds = new Set(tutors.map((t) => t.id));
      const registeredTutorEmails = new Set(tutors.map((t) => (t.email || "").toLowerCase()));

      tutorAccounts = tutors.map((t) => {
        const tutorEmail = t.email || `${t.nip.toLowerCase()}@bimbel.id`;
        const pwd = userMapById.get(t.id) || userMapByEmail.get(tutorEmail) || userMapByEmail.get(t.email || "") || "12345678";

        return {
          id: t.id,
          name: t.name,
          email: tutorEmail,
          username: tutorEmail,
          nip: t.nip,
          role: "TENTOR",
          accountType: "TENTOR",
          password: pwd,
          phone: t.phone,
          specialization: t.specialization,
          status: t.status,
          createdAt: t.createdAt,
        };
      });

      // Tambahkan juga jika ada user dengan role TENTOR di tabel users yang belum ada di tabel tutors
      const standaloneTentorUsers = allUsers
        .filter((u) => u.role === "TENTOR" && !registeredTutorIds.has(u.id) && !registeredTutorEmails.has(u.email.toLowerCase()))
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.email,
          nip: "-",
          role: "TENTOR",
          accountType: "TENTOR",
          password: u.passwordHash,
          phone: "-",
          specialization: "Umum",
          status: "ACTIVE",
          createdAt: u.createdAt,
        }));

      tutorAccounts.push(...standaloneTentorUsers);
    }

    const allAccounts = [...adminUsers, ...tutorAccounts];

    return NextResponse.json({
      success: true,
      data: allAccounts,
      stats: {
        total: allAccounts.length,
        adminCount: adminUsers.length,
        tutorCount: tutorAccounts.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat data akun pengguna" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountType, name, username, email, password, nip, phone, specialization, role } = body;

    if (!name || !accountType) {
      return NextResponse.json(
        { success: false, error: "Nama dan jenis akun (Admin/Tentor) wajib diisi!" },
        { status: 400 }
      );
    }

    const finalEmail = email || (username?.includes("@") ? username : `${(username || name).toLowerCase().replace(/\s+/g, "")}@bimbel.id`);
    const finalPassword = password || "12345678";
    const finalNip = nip || username || `TUT${Date.now().toString().slice(-6)}`;

    if (accountType === "ADMIN" || accountType === "TENTOR") {
      // Cek apakah email sudah ada di database tabel users
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: finalEmail }, { email: username || "" }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email atau Username tersebut sudah terdaftar di sistem!" },
          { status: 400 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email: finalEmail,
          passwordHash: finalPassword,
          role: (accountType === "TENTOR" ? "TENTOR" : (role || "ADMIN")) as any,
        },
      });

      // Jika tipe TENTOR, buatkan juga record di tabel Tutor
      if (accountType === "TENTOR") {
        await prisma.tutor.create({
          data: {
            id: newUser.id,
            name,
            nip: finalNip,
            email: finalEmail,
            phone: phone || "081234567890",
            specialization: specialization || "Pengajar Umum",
            status: "ACTIVE",
          },
        }).catch(() => null);
      }

      return NextResponse.json({
        success: true,
        message: `Akun ${accountType} baru (${finalEmail}) berhasil dibuat!`,
        data: newUser,
      });
    }

    return NextResponse.json(
      { success: false, error: "Tipe akun tidak valid (Gunakan ADMIN atau TENTOR)" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat akun baru" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, accountType, name, email, username, password, currentPassword, nip, phone, specialization, role, status } = body;

    if (!id || !accountType) {
      return NextResponse.json(
        { success: false, error: "ID Akun dan Tipe Akun diperlukan!" },
        { status: 400 }
      );
    }

    const targetEmail = email || (username?.includes("@") ? username : undefined);
    const targetNip = nip || username;

    if (accountType === "ADMIN") {
      // Jika ganti password, validasi password lama
      if (password) {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json({ success: false, error: "Akun admin tidak ditemukan!" }, { status: 404 });
        }
        if (!currentPassword) {
          return NextResponse.json({ success: false, error: "Kata sandi saat ini wajib diisi untuk ganti password!" }, { status: 400 });
        }
        if (existing.passwordHash !== currentPassword) {
          return NextResponse.json({ success: false, error: "Kata sandi saat ini tidak sesuai!" }, { status: 400 });
        }
        if (password.length < 6) {
          return NextResponse.json({ success: false, error: "Kata sandi baru minimal 6 karakter!" }, { status: 400 });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(targetEmail ? { email: targetEmail } : {}),
          ...(password ? { passwordHash: password } : {}),
          ...(role ? { role } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Data akun Admin & Password berhasil diperbarui!",
        data: updatedUser,
      });
    } else if (accountType === "TENTOR") {
      // 1. Update tabel Tutor
      const updatedTutor = await prisma.tutor.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          ...(targetNip ? { nip: targetNip } : {}),
          ...(phone ? { phone } : {}),
          ...(specialization ? { specialization } : {}),
          ...(status ? { status } : {}),
        },
      });

      // 2. Update atau sinkronkan ke tabel User untuk login
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: id },
            { email: updatedTutor.email },
            { email: email || "" },
          ],
        },
      });

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            ...(name ? { name } : {}),
            ...(email ? { email } : {}),
            ...(password ? { passwordHash: password } : {}),
          },
        });
      } else if (password) {
        await prisma.user.create({
          data: {
            id: id,
            name: name || updatedTutor.name,
            email: updatedTutor.email || `${updatedTutor.nip.toLowerCase()}@bimbel.id`,
            passwordHash: password,
            role: "TENTOR",
          },
        }).catch(() => null);
      }

      return NextResponse.json({
        success: true,
        message: "Data akun Tentor, Username/NIP & Password berhasil diperbarui!",
        data: updatedTutor,
      });
    }

    return NextResponse.json(
      { success: false, error: "Tipe akun tidak valid" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui data akun" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const accountType = searchParams.get("accountType");

    if (!id || !accountType) {
      return NextResponse.json(
        { success: false, error: "ID dan Tipe Akun wajib disertakan!" },
        { status: 400 }
      );
    }

    if (accountType === "ADMIN") {
      // Pastikan tidak menghapus semua admin sampai kosong
      const totalAdmin = await prisma.user.count();
      if (totalAdmin <= 1) {
        return NextResponse.json(
          { success: false, error: "Tidak dapat menghapus akun admin terakhir!" },
          { status: 400 }
        );
      }

      await prisma.user.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Akun Admin berhasil dihapus dari sistem!",
      });
    } else if (accountType === "TENTOR") {
      await prisma.tutor.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: "Akun Tentor berhasil dihapus dari sistem!",
      });
    }

    return NextResponse.json(
      { success: false, error: "Tipe akun tidak valid" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus akun pengguna" },
      { status: 500 }
    );
  }
}
