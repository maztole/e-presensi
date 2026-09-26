import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "weekly"; // "weekly" | "monthly"

    const now = new Date();

    if (range === "weekly") {
      // 7 hari terakhir (Senin - Minggu / 7 hari ke belakang)
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const chartData: { day: string; siswa: number; tentor: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - i);

        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        const dateNum = targetDate.getDate();

        const startOfDay = new Date(year, month, dateNum, 0, 0, 0, 0);
        const endOfDay = new Date(year, month, dateNum, 23, 59, 59, 999);

        const dayName = days[targetDate.getDay()];

        const [siswaHadir, tentorHadir] = await Promise.all([
          prisma.attendance.count({
            where: {
              date: { gte: startOfDay, lte: endOfDay },
              status: "HADIR",
            },
          }),
          prisma.tutorAttendance.count({
            where: {
              date: { gte: startOfDay, lte: endOfDay },
              status: "HADIR",
            },
          }),
        ]);

        chartData.push({
          day: dayName,
          siswa: siswaHadir,
          tentor: tentorHadir,
        });
      }

      return NextResponse.json({ success: true, data: chartData });
    } else {
      // 4 Minggu Terakhir di bulan ini / 4 minggu ke belakang
      const chartData: { day: string; siswa: number; tentor: number }[] = [];

      for (let i = 3; i >= 0; i--) {
        const startWeek = new Date(now);
        startWeek.setDate(now.getDate() - i * 7 - 6);
        startWeek.setHours(0, 0, 0, 0);

        const endWeek = new Date(now);
        endWeek.setDate(now.getDate() - i * 7);
        endWeek.setHours(23, 59, 59, 999);

        const [siswaHadir, tentorHadir] = await Promise.all([
          prisma.attendance.count({
            where: {
              date: { gte: startWeek, lte: endWeek },
              status: "HADIR",
            },
          }),
          prisma.tutorAttendance.count({
            where: {
              date: { gte: startWeek, lte: endWeek },
              status: "HADIR",
            },
          }),
        ]);

        chartData.push({
          day: `Minggu ${4 - i}`,
          siswa: siswaHadir,
          tentor: tentorHadir,
        });
      }

      return NextResponse.json({ success: true, data: chartData });
    }
  } catch (error: any) {
    console.error("[GET /api/reports/trend] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat tren kehadiran" },
      { status: 500 }
    );
  }
}
