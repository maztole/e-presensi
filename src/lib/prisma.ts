import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function getPool() {
  if (!globalForPrisma.pgPool) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://postgres.eoowaxvdktguwxcgenfy:IniPwEpresensi123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
    globalForPrisma.pgPool = new Pool({ connectionString });
  }
  return globalForPrisma.pgPool;
}

function getPrisma() {
  if (!globalForPrisma.prisma) {
    const pool = getPool();
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ["error", "warn"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
