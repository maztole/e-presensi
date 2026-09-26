import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking current UserRole enum values...");
  const vals = await prisma.$queryRawUnsafe(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'UserRole' ORDER BY enumsortorder`);
  console.log("Current values:", vals);

  const hasTentor = vals.some(v => v.enumlabel === 'TENTOR');
  if (!hasTentor) {
    console.log("Adding TENTOR to UserRole enum...");
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE 'TENTOR'`);
    console.log("Added TENTOR successfully");
  } else {
    console.log("TENTOR already exists");
  }

  const vals2 = await prisma.$queryRawUnsafe(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'UserRole' ORDER BY enumsortorder`);
  console.log("Updated values:", vals2);

  // Now sync Mas Alif
  const tutors = await prisma.tutor.findMany();
  console.log(`Found ${tutors.length} tutors`);
  for (const t of tutors) {
    const email = t.email || (t.nip.toLowerCase() + '@bimbel.id');
    console.log(`Syncing tutor ${t.name} -> ${email}`);
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      console.log(`  Already exists as user ${existing.id} role=${existing.role}, updating...`);
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'TENTOR', passwordHash: '12345678', name: t.name } });
      console.log(`  Updated`);
    } else {
      // Try to create with same id as tutor
      try {
        const created = await prisma.user.create({
          data: { id: t.id, name: t.name, email, passwordHash: '12345678', role: 'TENTOR' }
        });
        console.log(`  Created user ${created.id}`);
      } catch (e) {
        console.log(`  Create with id failed: ${e.message}, trying without id...`);
        const created2 = await prisma.user.create({
          data: { name: t.name, email, passwordHash: '12345678', role: 'TENTOR' }
        });
        console.log(`  Created user ${created2.id}`);
      }
    }
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  console.log(`\nUSERS COUNT: ${users.length}`);
  console.log(JSON.stringify(users, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
