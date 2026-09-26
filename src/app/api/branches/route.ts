import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const fallbackBranches = [
  {
    id: "cbg-1",
    code: "CBG-001",
    name: "Cabang Patemon",
    address: "Jl. Patemon Raya No. 12, Gunungpati",
    phone: "081234567810",
    isActive: true,
    studentCount: 0,
  },
  {
    id: "cbg-2",
    code: "CBG-002",
    name: "Cabang Nongkosawit",
    address: "Jl. Nongkosawit No. 45, Gunungpati",
    phone: "081234567820",
    isActive: true,
    studentCount: 4,
  },
  {
    id: "cbg-3",
    code: "CBG-003",
    name: "Cabang Ngijo",
    address: "Jl. Raya Ngijo No. 8, Gunungpati",
    phone: "081234567830",
    isActive: true,
    studentCount: 0,
  },
  {
    id: "cbg-4",
    code: "CBG-004",
    name: "Cabang Banjarejo",
    address: "Jl. Banjarejo Asri No. 19, Gunungpati",
    phone: "081234567840",
    isActive: true,
    studentCount: 0,
  },
  {
    id: "cbg-5",
    code: "CBG-005",
    name: "Cabang Kaligetas",
    address: "Jl. Kaligetas Indah No. 5, Mijen",
    phone: "081234567850",
    isActive: true,
    studentCount: 0,
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ];
    }

    let branches: any[] = [];
    try {
      branches = await prisma.branch.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
          _count: {
            select: { students: true },
          },
        },
        orderBy: { code: "asc" },
      });
    } catch (dbErr) {
      console.error("Prisma branch GET error:", dbErr);
    }

    if (!branches || branches.length === 0) {
      let filtered = fallbackBranches;
      if (query) {
        const q = query.toLowerCase();
        filtered = fallbackBranches.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.code.toLowerCase().includes(q) ||
            (b.address && b.address.toLowerCase().includes(q))
        );
      }
      return NextResponse.json({ success: true, data: filtered });
    }

    const formatted = branches.map((b) => ({
      ...b,
      studentCount: b._count?.students ?? 0,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("PRISMA BRANCHES GET ERROR, using fallback:", error);
    let filtered = fallbackBranches;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    if (query) {
      const q = query.toLowerCase();
      filtered = fallbackBranches.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          (b.address && b.address.toLowerCase().includes(q))
      );
    }
    return NextResponse.json({ success: true, data: filtered });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, name, address, phone, isActive } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Kode dan Nama Cabang wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.branch.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Kode cabang '${code}' sudah digunakan.` },
        { status: 400 }
      );
    }

    const newBranch = await prisma.branch.create({
      data: {
        code,
        name,
        address: address || null,
        phone: phone || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: newBranch }, { status: 201 });
  } catch (error: any) {
    console.error("PRISMA BRANCH POST ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal membuat cabang" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, code, name, address, phone, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID Cabang wajib diberikan." },
        { status: 400 }
      );
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PRISMA BRANCH PUT ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal memperbarui cabang" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID Cabang wajib diberikan." },
        { status: 400 }
      );
    }

    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Cabang berhasil dihapus." });
  } catch (error: any) {
    console.error("PRISMA BRANCH DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal menghapus cabang" },
      { status: 500 }
    );
  }
}
