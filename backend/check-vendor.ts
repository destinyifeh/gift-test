import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const vendor = await prisma.vendor.findFirst({
    where: { businessSlug: 'dez-place' },
    include: {
      acceptedCards: true
    }
  });
  console.log(JSON.stringify(vendor?.acceptedCards, null, 2));
  await prisma.$disconnect();
}
check();
