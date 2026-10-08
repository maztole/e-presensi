import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    } catch {
      notifications = [];
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
