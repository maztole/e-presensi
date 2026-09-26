import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Initial seed notifications if DB is empty
const DEMO_NOTIFICATIONS = [
  {
    type: "attendance",
    title: "Presensi Siswa Masuk",
    message: "Ahmad Fauzi (Kelas 12 SMA) telah tercatat Hadir di Cabang Pusat.",
    isRead: false,
  },
  {
    type: "warning",
    title: "Presensi Tentor Terlambat",
    message: "Budi Santoso, S.Pd baru melakukan presensi pukul 16.15 (Jadwal: 16.00).",
    isRead: false,
  },
  {
    type: "info",
    title: "Rekap Bulanan Siap",
    message: "Laporan presensi dan honor tentor bulan ini sudah dapat diunduh.",
    isRead: true,
  },
];

export async function GET() {
  try {
    const now = new Date();

    // 1. Delete notifications older than 7 days (auto-cleanup)
    try {
      await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });
    } catch {
      // ignore if DB table doesn't exist yet or offline
    }

    // 2. Fetch non-expired notifications
    let notifications = [];
    try {
      notifications = await prisma.notification.findMany({
        where: {
          expiresAt: {
            gte: now,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // 3. Seed demo data if database table is completely empty
      if (notifications.length === 0) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.notification.createMany({
          data: DEMO_NOTIFICATIONS.map((item) => ({
            ...item,
            expiresAt,
          })),
        });

        notifications = await prisma.notification.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });
      }
    } catch {
      // Fallback in-memory list if Prisma is not synced yet
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      notifications = DEMO_NOTIFICATIONS.map((item, index) => ({
        id: `demo-${index + 1}`,
        ...item,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil notifikasi";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "markAllRead") {
      try {
        await prisma.notification.updateMany({
          data: { isRead: true },
        });
      } catch {
        // DB fallback
      }
      return NextResponse.json({ success: true, message: "Semua dibaca" });
    }

    if (body.id) {
      try {
        const current = await prisma.notification.findUnique({
          where: { id: body.id },
        });
        if (current) {
          await prisma.notification.update({
            where: { id: body.id },
            data: { isRead: !current.isRead },
          });
        }
      } catch {
        // DB fallback
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengupdate notifikasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    try {
      await prisma.notification.deleteMany();
    } catch {
      // ignore
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus notifikasi";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
