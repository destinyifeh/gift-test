import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const direct = await prisma.directGift.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 5, 
    select: { id: true, giftCode: true, recipientEmail: true, senderEmail: true, amount: true } 
  });
  console.log("Latest Direct Gifts:", JSON.stringify(direct, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
