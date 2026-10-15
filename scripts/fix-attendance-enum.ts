import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to connect to PostgreSQL.");
}

const pool = new Pool({ connectionString: databaseUrl });

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

async function main() {
  try {
    const values = await prisma.$queryRawUnsafe(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'AttendanceStatus';
    `);
    console.log("Enum AttendanceStatus in DB:", values);

    // Tambahkan TIDAK_HADIR jika belum ada di database
    const enumValues = values as Array<{ enumlabel: string }>;
    const hasTidakHadir = enumValues.some((value) => value.enumlabel === "TIDAK_HADIR");
    if (!hasTidakHadir) {
      console.log("Adding TIDAK_HADIR to enum AttendanceStatus...");
      await prisma.$executeRawUnsafe(`ALTER TYPE "AttendanceStatus" ADD VALUE 'TIDAK_HADIR';`);
      console.log("TIDAK_HADIR added successfully!");
    } else {
      console.log("TIDAK_HADIR already exists in database.");
    }
  } catch (err) {
    console.error("Error checking/updating enum:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
