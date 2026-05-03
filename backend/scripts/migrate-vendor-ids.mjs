import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting data migration for Vendor ID backfill...');

  const vendors = await prisma.vendor.findMany();
  console.log(`Found ${vendors.length} vendors.`);

  for (const vendor of vendors) {
    const userId = vendor.userId;
    const vendorId = vendor.id;

    console.log(`Processing Vendor: ${vendor.storeName} (User: ${userId}, Vendor: ${vendorId})`);

    // 1. Transactions
    const transactions = await prisma.transaction.updateMany({
      where: { userId, vendorId: null },
      data: { vendorId },
    });
    console.log(`  Updated ${transactions.count} transactions.`);

    // 2. Bank Accounts
    const bankAccounts = await prisma.bankAccount.updateMany({
      where: { userId, vendorId: null },
      data: { vendorId },
    });
    console.log(`  Updated ${bankAccounts.count} bank accounts.`);

    // 3. Withdrawals
    const withdrawals = await prisma.withdrawal.updateMany({
      where: { userId, vendorId: null },
      data: { vendorId },
    });
    console.log(`  Updated ${withdrawals.count} withdrawals.`);

    // 4. Notifications
    const notifications = await prisma.notification.updateMany({
      where: { userId, vendorId: null },
      data: { vendorId },
    });
    console.log(`  Updated ${notifications.count} notifications.`);

    // 5. Featured Ads
    const featuredAds = await prisma.featuredAd.updateMany({
      where: { userId, vendorId: null },
      data: { vendorId },
    });
    console.log(`  Updated ${featuredAds.count} featured ads.`);

    // 6. Sponsored Ads
    const sponsoredAds = await prisma.sponsoredAd.updateMany({
      where: { userId, vendorId: null },
      data: { vendorId },
    });
    console.log(`  Updated ${sponsoredAds.count} sponsored ads.`);
    
    // 7. VendorAcceptedGiftCard
    const acceptedCards = await prisma.vendorAcceptedGiftCard.updateMany({
      where: { vendorId: userId }, // Old vendorId was the userId
      data: { vendorId: vendorId }, // New vendorId is the real vendor UUID
    });
    console.log(`  Updated ${acceptedCards.count} accepted gift cards.`);
  }

  console.log('Migration completed successfully.');
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
