const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log("no users found");
  
  BigInt.prototype.toJSON = function () {
    return Number(this);
  };

  try {
    const outTxs = await prisma.transaction.findMany({
      where: { userId: user.id }, take: 10
    });
    console.log("OutTxs:", outTxs.length);
  } catch(e) {
    console.log("Error finding transactions:", e.message);
  }

  try {
    const directGifts = await prisma.directGift.findMany({
      where: { userId: user.id }, take: 5
    });
    console.log("DirectGifts:", directGifts.length);
  } catch(e) {
    console.log("Error finding direct gifts:", e.message);
  }
  
  try {
    const unclaimedGifts = await prisma.directGift.findMany({
      where: {
        recipientEmail: { equals: user.email, mode: 'insensitive' },
        status: { in: ['active', 'pending', 'funded'] },
      },
      include: {
        product: {
          include: { vendor: { select: { businessName: true, displayName: true } } },
        },
      },
    });
    console.log("unclaimedGifts:", unclaimedGifts.length);
  } catch(e) {
    console.log("Error finding unclaimedGifts:", e.message);
  }

  process.exit(0);
}
run();
