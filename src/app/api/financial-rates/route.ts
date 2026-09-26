import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Default Fallbacks
const DEFAULT_HONOR_RATES: Record<string, number> = {
  SD: 18000,
  SMP: 20000,
  SMA: 22000,
};

const DEFAULT_SPP_RATES: Record<string, number> = {
  SD: 350000,
  SMP: 450000,
  SMA: 550000,
};

// GET /api/financial-rates -> get all honor & spp rate configs
export async function GET() {
  try {
    const [honorConfigs, sppConfigs] = await Promise.all([
      prisma.honorRateConfig.findMany({ orderBy: { gradeLevel: "asc" } }),
      prisma.sppRateConfig.findMany({ orderBy: { gradeLevel: "asc" } }),
    ]);

    const honorRates = { ...DEFAULT_HONOR_RATES };
    honorConfigs.forEach((c) => {
      honorRates[c.gradeLevel] = c.rate;
    });

    const sppRates = { ...DEFAULT_SPP_RATES };
    sppConfigs.forEach((c) => {
      sppRates[c.gradeLevel] = c.rate;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          honorRates,
          sppRates,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Fetch financial rates error:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          honorRates: DEFAULT_HONOR_RATES,
          sppRates: DEFAULT_SPP_RATES,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}

// POST /api/financial-rates -> update rate configs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { honorRates, sppRates } = body;

    if (honorRates && typeof honorRates === "object") {
      for (const [gradeLevel, rate] of Object.entries(honorRates)) {
        await prisma.honorRateConfig.upsert({
          where: { gradeLevel },
          update: { rate: Number(rate) },
          create: { gradeLevel, rate: Number(rate) },
        });
      }
    }

    if (sppRates && typeof sppRates === "object") {
      for (const [gradeLevel, rate] of Object.entries(sppRates)) {
        await prisma.sppRateConfig.upsert({
          where: { gradeLevel },
          update: { rate: Number(rate) },
          create: { gradeLevel, rate: Number(rate) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tarif honor tentor dan SPP siswa berhasil diperbarui!",
    });
  } catch (error) {
    console.error("Update financial rates error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
