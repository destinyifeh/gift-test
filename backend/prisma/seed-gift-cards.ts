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

const giftCards = [
  // ── Flex Card (Special) ──
  { name: 'Flex Card', slug: 'flex-card', description: 'Send money as a gift. Usable at any partner vendor, any time.', category: 'flex', icon: 'credit_card', colorFrom: '#10B981', colorTo: '#059669', amountOptions: [1000, 3000, 5000, 10000], allowCustomAmount: true, minAmount: 500, maxAmount: 500000, serviceFeePercent: 4, isFlexCard: true, usageDescription: 'Redeemable at all partner vendors nationwide', status: 'active', displayOrder: 0 },

  // ── Food & Drinks ──
  { name: 'Food Card', slug: 'food-card', description: 'Gifts for every palate.', category: 'food', icon: 'restaurant', colorFrom: '#F97316', colorTo: '#EA580C', amountOptions: [1000, 2000, 5000, 10000], usageDescription: 'Redeemable at restaurant partners', status: 'active', displayOrder: 1 },
  { name: 'Drinks Card', slug: 'drinks-card', description: 'Refreshments and beyond.', category: 'food', icon: 'local_bar', colorFrom: '#D97706', colorTo: '#B45309', amountOptions: [1000, 3000, 5000], usageDescription: 'Redeemable at bars and cafe partners', status: 'active', displayOrder: 2 },

  // ── Fashion ──
  { name: 'Fashion Card', slug: 'fashion-card', description: 'Gift the latest fashion trends.', category: 'fashion', icon: 'checkroom', colorFrom: '#374151', colorTo: '#111827', amountOptions: [2000, 5000, 10000, 20000], usageDescription: 'Redeemable at fashion vendors', status: 'active', displayOrder: 3 },

  // ── Shopping ──
  { name: 'Shopping Card', slug: 'shopping-card', description: 'Freedom to shop for anything.', category: 'shopping', icon: 'shopping_bag', colorFrom: '#10B981', colorTo: '#059669', amountOptions: [2000, 5000, 10000, 20000], usageDescription: 'Redeemable at retail vendors', status: 'active', displayOrder: 4 },

  // ── Technology ──
  { name: 'Gadget Card', slug: 'gadgets-card-v2', description: 'The latest innovations and accessories.', category: 'technology', icon: 'smartphone', colorFrom: '#14B8A6', colorTo: '#0D9488', amountOptions: [2000, 5000, 10000, 20000], usageDescription: 'Redeemable for tech accessories and gadgets', status: 'active', displayOrder: 6 },
  { name: 'Electronics Card', slug: 'electronics-card', description: 'Bespoke digital equipment.', category: 'technology', icon: 'devices', colorFrom: '#0EA5E9', colorTo: '#0284C7', amountOptions: [5000, 10000, 25000, 50000], usageDescription: 'Redeemable at all tech outlets', status: 'active', displayOrder: 7 },

  // ── Everyday Use ──
  { name: 'Groceries Card', slug: 'groceries-card', description: 'For your everyday needs.', category: 'everyday', icon: 'shopping_basket', colorFrom: '#10B981', colorTo: '#059669', amountOptions: [5000, 10000, 25000, 50000], usageDescription: 'Redeemable at supermarkets and grocery stores', status: 'active', displayOrder: 8 },
  { name: 'Bills & Utilities Card', slug: 'bills-utilities-card', description: 'Simplify their daily life and expenses.', category: 'everyday', icon: 'payments', colorFrom: '#6366F1', colorTo: '#4F46E5', amountOptions: [1000, 5000, 10000, 20000], usageDescription: 'Redeemable for utility and bill partners', status: 'active', displayOrder: 9 },
  { name: 'Transport Card', slug: 'transport-card', description: 'Cover their rides.', category: 'everyday', icon: 'directions_car', colorFrom: '#FACC15', colorTo: '#EAB308', amountOptions: [500, 1000, 2000, 5000], usageDescription: 'Redeemable for transport services', status: 'active', displayOrder: 10 },
  { name: 'Fuel Card', slug: 'fuel-card', description: 'Keep them moving.', category: 'everyday', icon: 'local_gas_station', colorFrom: '#FB923C', colorTo: '#F97316', amountOptions: [2000, 5000, 10000, 20000], usageDescription: 'Redeemable at fuel stations', status: 'active', displayOrder: 11 },

  // ── Home & Living ──
  { name: 'Furniture Card', slug: 'furniture-card', description: 'Elevate their living space.', category: 'home', icon: 'chair', colorFrom: '#92400E', colorTo: '#78350F', amountOptions: [10000, 25000, 50000, 100000], usageDescription: 'Redeemable at furniture partners', status: 'active', displayOrder: 12 },
  { name: 'Home Essentials Card', slug: 'home-essentials-card', description: 'Everything a home needs.', category: 'home', icon: 'house', colorFrom: '#0EA5E9', colorTo: '#0284C7', amountOptions: [2000, 5000, 10000, 25000], usageDescription: 'Redeemable at home essential stores', status: 'active', displayOrder: 13 },

  // ── Lifestyle ──
  { name: 'Entertainment Card', slug: 'entertainment-card', description: 'Fun experiences and entertainment.', category: 'lifestyle', icon: 'movie', colorFrom: '#EF4444', colorTo: '#DC2626', amountOptions: [1000, 3000, 5000, 10000], usageDescription: 'Redeemable at entertainment venues', status: 'active', displayOrder: 14 },
  { name: 'Educational Card', slug: 'educational-card', description: 'Gift the power of knowledge.', category: 'lifestyle', icon: 'school', colorFrom: '#7C3AED', colorTo: '#6D28D9', amountOptions: [2000, 5000, 10000, 20000], usageDescription: 'Redeemable for courses and learning resources', status: 'active', displayOrder: 15 },
];

async function main() {
  console.log('Cleaning up old gift cards...');
  const activeSlugs = giftCards.map(c => c.slug);
  // Keep the Flex Card if it's not in the list but user wants to keep the system working
  // Actually, I've included Flex Card at the top of the list in the script.
  const deleteResult = await prisma.giftCard.deleteMany({
    where: {
      slug: {
        notIn: activeSlugs
      }
    }
  });
  console.log(`  Removed ${deleteResult.count} legacy cards.`);

  console.log('Seeding current gift cards...');
  for (const card of giftCards) {
    await prisma.giftCard.upsert({
      where: { slug: card.slug },
      update: { ...card },
      create: {
        ...card,
        currency: 'NGN',
        allowCustomAmount: card.allowCustomAmount ?? true,
        minAmount: card.minAmount ?? 500,
        maxAmount: card.maxAmount ?? 500000,
        serviceFeePercent: card.serviceFeePercent ?? 4,
        isFlexCard: card.isFlexCard ?? false,
      },
    });
    console.log(`  ✓ ${card.name}`);
  }
  console.log(`Seeded ${giftCards.length} gift cards!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
