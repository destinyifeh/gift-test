const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latestDirect = await prisma.directGift.findFirst({ 
    orderBy: { createdAt: 'desc' }
  });
  if (!latestDirect) return console.log('No direct gift');
  
  console.log('Original email:', latestDirect.recipientEmail);
  
  const updated = await prisma.directGift.update({
    where: { id: latestDirect.id },
    data: { recipientEmail: 'test12345@gatherly.com' }
  });
  
  console.log('Updated email synchronously:', updated.recipientEmail);
  
  const refetched = await prisma.directGift.findUnique({ where: { id: latestDirect.id } });
  console.log('Refetched email:', refetched.recipientEmail);
  
  // Revert
  await prisma.directGift.update({
    where: { id: latestDirect.id },
    data: { recipientEmail: latestDirect.recipientEmail }
  });
}
main().then(() => prisma.$disconnect());
