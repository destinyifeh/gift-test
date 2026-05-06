import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('Testing connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log('User count:', count);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
