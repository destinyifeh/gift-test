const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const flex = await prisma.flexCard.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 3,
    select: { id: true, code: true, recipientEmail: true } 
  });
  const ugc = await prisma.userGiftCard.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 3, 
    select: { id: true, code: true, recipientEmail: true } 
  });
  const direct = await prisma.directGift.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 3, 
    select: { id: true, giftCode: true, recipientEmail: true } 
  });
  console.log("Flex:", flex);
  console.log("UGC:", ugc);
  console.log("Direct:", direct);
}

main().catch(console.error).finally(() => prisma.$disconnect());
