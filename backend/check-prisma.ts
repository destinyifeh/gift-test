import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const flexCard = await prisma.giftCard.findUnique({
    where: { slug: 'flex-card' }
  });
  console.log(flexCard);
}

main().catch(console.error).finally(() => prisma.$disconnect());
