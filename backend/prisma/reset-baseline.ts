import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const migrationName = '0_init';
  console.log(`Deleting migration record: ${migrationName}`);
  
  try {
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "_prisma_migrations" WHERE "migration_name" = $1`,
      migrationName
    );
    console.log(`Successfully deleted ${result} record(s).`);
  } catch (error) {
    console.error('Error deleting migration record:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
