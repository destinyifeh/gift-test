import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const cards = await prisma.giftCard.findMany();
  console.log(JSON.stringify(cards, null, 2));
}
run();
