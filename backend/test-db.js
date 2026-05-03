const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("Querying database...");
  const users = await prisma.user.findMany({ take: 1 });
  console.log("Database responded!", users.length);
  process.exit(0);
}
run();
