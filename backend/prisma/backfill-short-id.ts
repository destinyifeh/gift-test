import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

// Try to load env manually if not present
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

const prisma = new PrismaClient();

// Mirror the nanoid helper from backend/src/common/utils/slug.util.ts
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7,
);

async function backfill() {
  console.log('Starting backfill for productShortId...');
  
  const products = await prisma.vendorGift.findMany({
    where: {
      productShortId: null
    }
  });
  
  console.log(`Found ${products.length} products to backfill.`);
  
  for (const product of products) {
    const shortId = nanoid();
    await prisma.vendorGift.update({
      where: { id: product.id },
      data: { productShortId: shortId }
    });
    console.log(`Updated product ID ${product.id} (${product.name}) with shortId: ${shortId}`);
  }
  
  console.log('Backfill completed.');
}

backfill()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
