import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const cards = await prisma.giftCard.findMany({
    where: { isFlexCard: true },
  });
  console.log(cards);
  await prisma.$disconnect();
}
check();
