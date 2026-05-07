const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const directGifts = await prisma.directGift.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, recipientEmail: true, senderEmail: true }
  });
  console.log("DirectGifts:", JSON.stringify(directGifts, null, 2));

  const flexCards = await prisma.flexCard.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, recipientEmail: true, senderId: true }
  });
  console.log("FlexCards:", JSON.stringify(flexCards, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
