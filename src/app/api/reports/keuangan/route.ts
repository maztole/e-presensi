import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Default rates fallback if DB not configured
const DEFAULT_HONOR_RATE: Record<string, number> = {
  SD: 18000,
  SMP: 20000,
  SMA: 22000,
};

const DEFAULT_SPP_RATE: Record<string, number> = {
  SD: 350000,
  SMP: 450000,
  SMA: 550000,
};

async function getHonorRates(): Promise<Record<string, number>> {
  try {
    const configs = await prisma.honorRateConfig.findMany();
    const map = { ...DEFAULT_HONOR_RATE };
    configs.forEach((c) => {
      map[c.gradeLevel] = c.rate;
    });
    return map;
  } catch {
    return DEFAULT_HONOR_RATE;
  }
}

async function getSppRates(): Promise<Record<string, number>> {
  try {
    const configs = await prisma.sppRateConfig.findMany();
    const map = { ...DEFAULT_SPP_RATE };
    configs.forEach((c) => {
      map[c.gradeLevel] = c.rate;
    });
    return map;
  } catch {
    return DEFAULT_SPP_RATE;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // "YYYY-MM"
    const type = searchParams.get("type") || "honor"; // "honor" | "spp"

    const selectedMonth =
      month ||
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    let dateStart: Date | undefined;
    let dateEnd: Date | undefined;
    if (month) {
      const [year, mon] = month.split("-").map(Number);
      dateStart = new Date(year, mon - 1, 1);
      dateEnd = new Date(year, mon, 0, 23, 59, 59, 999);
    }

    if (type === "honor") {
      const honorRates = await getHonorRates();

      // Fetch tutors with their attendance sessions in the period
      const tutors = await prisma.tutor.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      });

      const sessions = await prisma.tutorAttendance.findMany({
        where: {
          status: "HADIR",
          ...(dateStart && dateEnd
            ? { date: { gte: dateStart, lte: dateEnd } }
            : {}),
        },
        select: {
          tutorId: true,
          gradeLevel: true,
          teachingHours: true,
        },
      });

      // Get saved honor payment statuses for this month
      const savedPayments = await prisma.honorPayment.findMany({
        where: { month: selectedMonth },
      });
      const paymentStatusMap = new Map(savedPayments.map((p) => [p.tutorId, p.status]));

      // Aggregate per tutor
      const tutorSessionMap: Record<
        string,
        { sd: number; smp: number; sma: number; total: number }
      > = {};

      for (const s of sessions) {
        if (!tutorSessionMap[s.tutorId]) {
          tutorSessionMap[s.tutorId] = { sd: 0, smp: 0, sma: 0, total: 0 };
        }
        const m = tutorSessionMap[s.tutorId];
        const gl = (s.gradeLevel || "").toUpperCase();
        m.total++;
        if (gl.includes("SD")) m.sd++;
        else if (gl.includes("SMP")) m.smp++;
        else m.sma++; // SMA / UTBK / default
      }

      const rateSD = honorRates.SD ?? DEFAULT_HONOR_RATE.SD;
      const rateSMP = honorRates.SMP ?? DEFAULT_HONOR_RATE.SMP;
      const rateSMA = honorRates.SMA ?? DEFAULT_HONOR_RATE.SMA;

      const result = tutors.map((t) => {
        const m = tutorSessionMap[t.id] || { sd: 0, smp: 0, sma: 0, total: 0 };
        const totalHonor = m.sd * rateSD + m.smp * rateSMP + m.sma * rateSMA;

        const currentStatus =
          (paymentStatusMap.get(t.id) as "LUNAS" | "PENDING") || "PENDING";

        return {
          id: t.id,
          tutorName: t.name,
          specialization: t.specialization || "-",
          sessionsSD: m.sd,
          sessionsSMP: m.smp,
          sessionsSMA: m.sma,
          totalSessions: m.total,
          totalHonor,
          status: currentStatus,
          rates: { SD: rateSD, SMP: rateSMP, SMA: rateSMA },
        };
      });

      return NextResponse.json({ success: true, data: result });
    } else {
      // SPP report: list active students with their grade-based SPP estimate
      const sppRates = await getSppRates();

      function sppRate(gradeLevel: string): number {
        const gl = (gradeLevel || "").toUpperCase();
        if (gl.includes("SD")) return sppRates.SD ?? DEFAULT_SPP_RATE.SD;
        if (gl.includes("SMP")) return sppRates.SMP ?? DEFAULT_SPP_RATE.SMP;
        if (gl.includes("UTBK")) return sppRates.UTBK ?? DEFAULT_SPP_RATE.UTBK;
        if (gl.includes("SMA")) return sppRates.SMA ?? DEFAULT_SPP_RATE.SMA;
        return sppRates.SMP ?? DEFAULT_SPP_RATE.SMP;
      }

      const students = await prisma.student.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      });

      // Get saved SPP payment statuses for this month
      const savedSppPayments = await prisma.sppPayment.findMany({
        where: { month: selectedMonth },
      });
      const sppStatusMap = new Map(
        savedSppPayments.map((p) => [p.studentId, p.status])
      );

      const now = new Date();
      const dueYear = dateStart ? dateStart.getFullYear() : now.getFullYear();
      const dueMon = dateStart ? dateStart.getMonth() + 1 : now.getMonth() + 1;
      const dueDate = `10-${String(dueMon).padStart(2, "0")}-${dueYear}`;

      const result = students.map((s) => ({
        id: s.id,
        studentName: s.name,
        gradeLevel: s.gradeLevel || "-",
        amount: sppRate(s.gradeLevel || ""),
        dueDate,
        status:
          (sppStatusMap.get(s.id) as "LUNAS" | "BELUM_LUNAS") || "BELUM_LUNAS",
      }));

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.error("Report keuangan error:", error);
    return NextResponse.json({ success: false, data: [], error: String(error) });
  }
}

// POST endpoint to update payment status (Honor or SPP)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, month, status } = body;

    if (!type || !id || !month || !status) {
      return NextResponse.json(
        { success: false, error: "Parameter type, id, month, status wajib diisi" },
        { status: 400 }
      );
    }

    if (type === "honor") {
      const updated = await prisma.honorPayment.upsert({
        where: {
          tutorId_month: {
            tutorId: id,
            month: month,
          },
        },
        update: {
          status: status,
          paidAt: status === "LUNAS" ? new Date() : null,
        },
        create: {
          tutorId: id,
          month: month,
          status: status,
          paidAt: status === "LUNAS" ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } else if (type === "spp") {
      const updated = await prisma.sppPayment.upsert({
        where: {
          studentId_month: {
            studentId: id,
            month: month,
          },
        },
        update: {
          status: status,
          paidAt: status === "LUNAS" ? new Date() : null,
        },
        create: {
          studentId: id,
          month: month,
          status: status,
          paidAt: status === "LUNAS" ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      return NextResponse.json(
        { success: false, error: "Type tidak valid (harus 'honor' atau 'spp')" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
