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
      businessName: 'KFC',
      businessCity: 'Ikorodu',
      businessState: 'Lagos',
      businessCountry: 'Nigeria',
      businessSlug: 'kfc-ikorodu',
      businessDescription: 'The best finger-lickin good chicken.',
      roles: ['vendor'],
    },
    {
      email: 'chicken-republic@test.com',
      name: 'Chicken Republic Ketu',
      businessName: 'Chicken Republic',
      businessCity: 'Ketu',
      businessState: 'Lagos',
      businessCountry: 'Nigeria',
      businessSlug: 'chicken-republic-ketu',
      businessDescription: 'Authentic African soul food.',
      roles: ['vendor'],
    },
    {
      email: 'local-restaurant@test.com',
      name: 'Local Restaurant Yaba',
      businessName: 'Local Restaurant',
      businessCity: 'Yaba',
      businessState: 'Lagos',
      businessCountry: 'Nigeria',
      businessSlug: 'local-restaurant-yaba',
      businessDescription: 'Delicious home-cooked meals.',
      roles: ['vendor'],
    },
  ];

  for (const v of vendors) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: { ...v },
      create: { 
        ...v,
        username: v.businessSlug,
      },
    });

    console.log(`  ✓ Vendor: ${user.businessName} - ${user.businessCity}`);

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
