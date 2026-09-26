import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedBranches() {
  console.log("Seeding 5 Branches...");

  const branchesData = [
    {
      code: "CBG-001",
      name: "Cabang Patemon",
      address: "Jl. Patemon Raya No. 12, Gunungpati",
      phone: "081234567810",
      isActive: true,
    },
    {
      code: "CBG-002",
      name: "Cabang Nongkosawit",
      address: "Jl. Nongkosawit No. 45, Gunungpati",
      phone: "081234567820",
      isActive: true,
    },
    {
      code: "CBG-003",
      name: "Cabang Ngijo",
      address: "Jl. Raya Ngijo No. 8, Gunungpati",
      phone: "081234567830",
      isActive: true,
    },
    {
      code: "CBG-004",
      name: "Cabang Banjarejo",
      address: "Jl. Banjarejo Asri No. 19, Gunungpati",
      phone: "081234567840",
      isActive: true,
    },
    {
      code: "CBG-005",
      name: "Cabang Kaligetas",
      address: "Jl. Kaligetas Indah No. 5, Mijen",
      phone: "081234567850",
      isActive: true,
    },
  ];

  for (const b of branchesData) {
    await prisma.branch.upsert({
      where: { code: b.code },
      update: {
        name: b.name,
        address: b.address,
        phone: b.phone,
        isActive: b.isActive,
      },
      create: b,
    });
  }

  const nongkosawit = await prisma.branch.findUnique({
    where: { code: "CBG-002" },
  });

  if (nongkosawit) {
    // Update all existing students with null branchId to Cabang Nongkosawit
    const updateResult = await prisma.student.updateMany({
      where: {
        OR: [
          { branchId: null },
          { branchId: "" },
        ],
      },
      data: {
        branchId: nongkosawit.id,
      },
    });
    console.log(`Updated ${updateResult.count} existing students to Cabang Nongkosawit.`);
  }

  console.log("5 Branches seeded successfully!");

  const allBranches = await prisma.branch.findMany();
  const branchMap: Record<string, string> = {};
  allBranches.forEach((b) => {
    branchMap[b.name] = b.id;
  });

  const sampleBranchStudents = [
    // Cabang Ngijo
    {
      nis: "2026101",
      name: "Dimas Aditya Pratama",
      gender: "Laki-laki",
      phone: "081234567901",
      email: "dimas.ngijo@gmail.com",
      schoolOrigin: "SMPN 1 Gunungpati",
      gradeLevel: "8 SMP",
      programPackage: "Reguler SMP",
      status: "ACTIVE",
      parentName: "Bapak Hartono",
      parentPhone: "081299887801",
      branchId: branchMap["Cabang Ngijo"],
    },
    {
      nis: "2026102",
      name: "Nabila Zahra Putri",
      gender: "Perempuan",
      phone: "081234567902",
      email: "nabila.ngijo@gmail.com",
      schoolOrigin: "SMAN 12 Semarang",
      gradeLevel: "11 SMA",
      programPackage: "Intensif SNBT",
      status: "ACTIVE",
      parentName: "Ibu Susilowati",
      parentPhone: "081299887802",
      branchId: branchMap["Cabang Ngijo"],
    },
    {
      nis: "2026103",
      name: "Fathur Rahman",
      gender: "Laki-laki",
      phone: "081234567903",
      email: "fathur.ngijo@gmail.com",
      schoolOrigin: "SDIT Bina Amal",
      gradeLevel: "6 SD",
      programPackage: "Bimbel Sukses ASPD",
      status: "ACTIVE",
      parentName: "Bapak Gunawan",
      parentPhone: "081299887803",
      branchId: branchMap["Cabang Ngijo"],
    },
    // Cabang Patemon
    {
      nis: "2026201",
      name: "Rian Firmansyah",
      gender: "Laki-laki",
      phone: "081234567911",
      email: "rian.patemon@gmail.com",
      schoolOrigin: "SMA Negeri 1 Gunungpati",
      gradeLevel: "10 SMA",
      programPackage: "Reguler SMA",
      status: "ACTIVE",
      parentName: "Bapak Suryanto",
      parentPhone: "081299887811",
      branchId: branchMap["Cabang Patemon"],
    },
    {
      nis: "2026202",
      name: "Anindya Larasati",
      gender: "Perempuan",
      phone: "081234567912",
      email: "anindya.patemon@gmail.com",
      schoolOrigin: "SMP N 22 Semarang",
      gradeLevel: "9 SMP",
      programPackage: "Intensif Ujian",
      status: "ACTIVE",
      parentName: "Ibu Retno",
      parentPhone: "081299887812",
      branchId: branchMap["Cabang Patemon"],
    },
    // Cabang Banjarejo
    {
      nis: "2026301",
      name: "Kevin Wijaya",
      gender: "Laki-laki",
      phone: "081234567921",
      email: "kevin.banjarejo@gmail.com",
      schoolOrigin: "SMAN 3 Semarang",
      gradeLevel: "12 SMA",
      programPackage: "Intensif Kedokteran",
      status: "ACTIVE",
      parentName: "Bapak Bambang W.",
      parentPhone: "081299887821",
      branchId: branchMap["Cabang Banjarejo"],
    },
    {
      nis: "2026302",
      name: "Tiara Anggraini",
      gender: "Perempuan",
      phone: "081234567922",
      email: "tiara.banjarejo@gmail.com",
      schoolOrigin: "SD Negeri 1 Banjarejo",
      gradeLevel: "4 SD",
      programPackage: "Privat Calistung & Matematika",
      status: "ACTIVE",
      parentName: "Ibu Sri Wahyuni",
      parentPhone: "081299887822",
      branchId: branchMap["Cabang Banjarejo"],
    },
    // Cabang Kaligetas
    {
      nis: "2026401",
      name: "Rizki Bayu Pratama",
      gender: "Laki-laki",
      phone: "081234567931",
      email: "rizki.kaligetas@gmail.com",
      schoolOrigin: "SMP Negeri 24 Semarang",
      gradeLevel: "7 SMP",
      programPackage: "Reguler SMP",
      status: "ACTIVE",
      parentName: "Bapak Supriyadi",
      parentPhone: "081299887831",
      branchId: branchMap["Cabang Kaligetas"],
    },
    {
      nis: "2026402",
      name: "Syifa Azzahra",
      gender: "Perempuan",
      phone: "081234567932",
      email: "syifa.kaligetas@gmail.com",
      schoolOrigin: "SMK Negeri 7 Semarang",
      gradeLevel: "11 SMK",
      programPackage: "Bimbel Kejuruan",
      status: "ACTIVE",
      parentName: "Ibu Nurhayati",
      parentPhone: "081299887832",
      branchId: branchMap["Cabang Kaligetas"],
    },
  ];

  for (const s of sampleBranchStudents) {
    if (!s.branchId) continue;
    const exists = await prisma.student.findFirst({ where: { nis: s.nis } });
    if (!exists) {
      await prisma.student.create({ data: s as any });
      console.log(`Created student ${s.name} at branch`);
    }
  }

  console.log("All sample branch students created successfully!");
}

seedBranches()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
