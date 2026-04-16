import { PrismaClient } from './src/generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.findUnique({
    where: { email: 'destechofficial@gmail.com' },
    select: {
      id: true,
      email: true,
      roles: true,
      adminRole: true,
    }
  });

  console.log('--- USER DATA ---');
  console.log(JSON.stringify(user, null, 2));
  
  await pool.end();
}

main().catch(console.error);
