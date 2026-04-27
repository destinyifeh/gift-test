import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding sample vendors...');

  // 1. Find Flex Card and Food Card
  const flexCard = await prisma.giftCard.findUnique({ where: { slug: 'flex-card' } });
  const foodCard = await prisma.giftCard.findUnique({ where: { slug: 'food-card' } });

  if (!flexCard || !foodCard) {
    console.error('Core gift cards not found. Please run seed-gift-cards.ts first.');
    return;
  }

  // 2. Create Sample Vendors (Users with SHOP fields)
  const vendors = [
    {
      email: 'kfc@test.com',
      name: 'KFC Ikorodu',
      shopName: 'KFC',
      shopCity: 'Ikorodu',
      shopState: 'Lagos',
      shopCountry: 'Nigeria',
      shopSlug: 'kfc-ikorodu',
      shopDescription: 'The best finger-lickin good chicken.',
      roles: ['vendor'],
    },
    {
      email: 'chicken-republic@test.com',
      name: 'Chicken Republic Ketu',
      shopName: 'Chicken Republic',
      shopCity: 'Ketu',
      shopState: 'Lagos',
      shopCountry: 'Nigeria',
      shopSlug: 'chicken-republic-ketu',
      shopDescription: 'Authentic African soul food.',
      roles: ['vendor'],
    },
    {
      email: 'local-restaurant@test.com',
      name: 'Local Restaurant Yaba',
      shopName: 'Local Restaurant',
      shopCity: 'Yaba',
      shopState: 'Lagos',
      shopCountry: 'Nigeria',
      shopSlug: 'local-restaurant-yaba',
      shopDescription: 'Delicious home-cooked meals.',
      roles: ['vendor'],
    },
  ];

  for (const v of vendors) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: { ...v },
      create: { 
        ...v,
        username: v.shopSlug,
      },
    });

    console.log(`  ✓ Vendor: ${user.shopName} - ${user.shopCity}`);

    // Link to Flex Card
    await prisma.vendorAcceptedGiftCard.upsert({
      where: {
        vendorId_giftCardId: {
          vendorId: user.id,
          giftCardId: flexCard.id,
        },
      },
      update: {},
      create: {
        vendorId: user.id,
        giftCardId: flexCard.id,
      },
    });

    // Link to Food Card
    await prisma.vendorAcceptedGiftCard.upsert({
      where: {
        vendorId_giftCardId: {
          vendorId: user.id,
          giftCardId: foodCard.id,
        },
      },
      update: {},
      create: {
        vendorId: user.id,
        giftCardId: foodCard.id,
      },
    });
  }

  console.log('Vendor seeding completed!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
