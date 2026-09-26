import { prisma } from "../src/lib/prisma";

async function seedPersonalSchedules() {
  console.log("Seeding student personal schedules...");
  const students = await prisma.student.findMany({ include: { branch: true } });
  if (students.length === 0) {
    console.log("No students found.");
    return;
  }

  await prisma.studentSchedule.deleteMany();

  const daysOptions = [
    "Senin, Rabu, Jumat",
    "Selasa, Kamis, Sabtu",
    "Senin, Selasa, Kamis",
    "Rabu, Jumat, Sabtu",
  ];

  const subjectsOptions = [
    "Matematika & IPA Terpadu",
    "Intensif SNBT & TPS",
    "Fisika & Kimia SMA",
    "Matematika & B. Indonesia",
    "Calistung & Tematik SD",
  ];

  const tentors = [
    "Kak Budi Hartono, M.Pd.",
    "Kak Siti Nurhaliza, S.Si.",
    "Kak Hendra Kurniawan",
    "Kak Rina Wulandari, S.Pd.",
    "Kak Dewi Lestari",
  ];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    if (!s.branchId) continue;

    await prisma.studentSchedule.create({
      data: {
        studentId: s.id,
        branchId: s.branchId,
        days: daysOptions[i % daysOptions.length],
        startTime: i % 2 === 0 ? "15:30" : "16:00",
        endTime: i % 2 === 0 ? "17:00" : "17:30",
        tentorName: tentors[i % tentors.length],
        isActive: true,
      },
    });
    console.log(`Created schedule for student: ${s.name}`);
  }

  console.log(`Success! Created personal schedules for ${students.length} students.`);
  await prisma.$disconnect();
}

seedPersonalSchedules().catch((e) => {
  console.error("Error seeding schedules:", e);
  prisma.$disconnect();
});
