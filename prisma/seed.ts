import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding data into Supabase...");

  // 1. Seed Admin User for Login
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bimbel.id" },
    update: {
      passwordHash: "admin123",
      name: "Admin Utama",
    },
    create: {
      email: "admin@bimbel.id",
      name: "Admin Utama",
      passwordHash: "admin123",
      role: "ADMIN",
    },
  });

  console.log("Admin User created:", adminUser.email);

  // 2. Seed Data Tentor / Pengajar
  const tutorsData = [
    {
      nip: "TUT202601",
      name: "Kak Aris Munandar, S.Si.",
      gender: "Laki-laki",
      phone: "085711223344",
      email: "aris.m@bimbel.id",
      specialization: "Matematika Saintek",
      status: "ACTIVE" as const,
    },
    {
      nip: "TUT202602",
      name: "Kak Dinda Rahma, S.Pd.",
      gender: "Perempuan",
      phone: "085711223355",
      email: "dinda.r@bimbel.id",
      specialization: "Bahasa Inggris & TOEFL",
      status: "ACTIVE" as const,
    },
    {
      nip: "TUT202603",
      name: "Kak Bayu Pratama, S.T.",
      gender: "Laki-laki",
      phone: "085711223366",
      email: "bayu.p@bimbel.id",
      specialization: "Fisika & Kimia SMA",
      status: "ACTIVE" as const,
    },
    {
      nip: "TUT202604",
      name: "Kak Rian Hidayat, M.Si.",
      gender: "Laki-laki",
      phone: "085711223377",
      email: "rian.h@bimbel.id",
      specialization: "Biologi & IPA SMP",
      status: "ACTIVE" as const,
    },
    {
      nip: "TUT202605",
      name: "Kak Nabila Safitri, S.Pd.",
      gender: "Perempuan",
      phone: "085711223388",
      email: "nabila.s@bimbel.id",
      specialization: "Bahasa Indonesia",
      status: "ACTIVE" as const,
    },
  ];

  for (const t of tutorsData) {
    await prisma.tutor.upsert({
      where: { nip: t.nip },
      update: t,
      create: t,
    });
  }

  console.log("5 Tutors successfully seeded.");

  // 3. Seed Data Siswa
  const studentsData = [
    {
      nis: "2026001",
      name: "Ahmad Rizky",
      gender: "Laki-laki",
      schoolOrigin: "SMAN 1 City",
      gradeLevel: "12 SMA",
      parentName: "Bapak Rahmad",
      parentPhone: "081299887711",
      status: "ACTIVE" as const,
    },
    {
      nis: "2026002",
      name: "Siti Nurhaliza",
      gender: "Perempuan",
      schoolOrigin: "SMA 2 Nusantara",
      gradeLevel: "12 SMA",
      parentName: "Ibu Fatimah",
      parentPhone: "081299887722",
      status: "ACTIVE" as const,
    },
    {
      nis: "2026003",
      name: "Budi Santoso",
      gender: "Laki-laki",
      schoolOrigin: "SMPN 9",
      gradeLevel: "9 SMP",
      parentName: "Bapak Joko",
      parentPhone: "081299887733",
      status: "ACTIVE" as const,
    },
    {
      nis: "2026004",
      name: "Clarissa Putri",
      gender: "Perempuan",
      schoolOrigin: "SDIT Utama",
      gradeLevel: "5 SD",
      parentName: "Ibu Ratna",
      parentPhone: "081299887744",
      status: "ACTIVE" as const,
    },
  ];

  for (const s of studentsData) {
    await prisma.student.upsert({
      where: { nis: s.nis },
      update: s,
      create: s,
    });
  }

  console.log("4 Students successfully seeded.");

  // 4. Seed Honor Rate Configs
  const honorRateConfigs = [
    { gradeLevel: "SD", rate: 18000 },
    { gradeLevel: "SMP", rate: 20000 },
    { gradeLevel: "SMA", rate: 22000 },
  ];
  for (const h of honorRateConfigs) {
    await prisma.honorRateConfig.upsert({
      where: { gradeLevel: h.gradeLevel },
      update: { rate: h.rate },
      create: h,
    });
  }

  // 5. Seed SPP Rate Configs
  const sppRateConfigs = [
    { gradeLevel: "SD", rate: 350000 },
    { gradeLevel: "SMP", rate: 450000 },
    { gradeLevel: "SMA", rate: 550000 },
  ];
  for (const s of sppRateConfigs) {
    await prisma.sppRateConfig.upsert({
      where: { gradeLevel: s.gradeLevel },
      update: { rate: s.rate },
      create: s,
    });
  }

  console.log("Financial Rate Configs successfully seeded.");
  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
