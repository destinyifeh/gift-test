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
  console.log('Skipping backfill: legacy VendorGift model removed');
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
