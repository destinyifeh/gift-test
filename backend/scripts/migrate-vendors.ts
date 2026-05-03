import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting migration: User -> Vendor');

  // 1. Identify all users with vendor role
  const vendorsFromUser = await (prisma as any).user.findMany({
    where: {
      roles: {
        has: 'vendor'
      }
    }
  });

  console.log(`Found ${vendorsFromUser.length} vendor users.`);

  for (const user of vendorsFromUser) {
    console.log(`Processing vendor: ${user.businessName || user.name}`);

    // 2. Create or update the Vendor record
    await (prisma as any).vendor.upsert({
      where: { userId: user.id },
      update: {
        id: user.id, // Ensure ID matches User ID for 1-to-1 consistency
        businessName: user.businessName || user.name || '',
        businessDescription: user.businessDescription,
        businessSlug: user.businessSlug || user.username || user.id,
        businessLogoUrl: user.businessLogoUrl,
        bannerUrl: user.bannerUrl,
        streetAddress: user.businessStreet,
        city: user.businessCity,
        state: user.businessState,
        country: user.businessCountry,
        postalCode: user.businessZip,
        status: user.vendorStatus || 'approved',
        isVerified: user.isVerifiedVendor || false,
        categories: user.vendorCategories,
        wallet: user.userWallet, 
      },
      create: {
        id: user.id, // Use User ID as Vendor ID
        userId: user.id,
        businessName: user.businessName || user.name || '',
        businessDescription: user.businessDescription,
        businessSlug: user.businessSlug || user.username || user.id,
        businessLogoUrl: user.businessLogoUrl,
        bannerUrl: user.bannerUrl,
        streetAddress: user.businessStreet,
        city: user.businessCity,
        state: user.businessState,
        country: user.businessCountry,
        postalCode: user.businessZip,
        status: user.vendorStatus || 'approved',
        isVerified: user.isVerifiedVendor || false,
        categories: user.vendorCategories,
        wallet: user.userWallet,
      },
    });

    console.log(`  ✓ Migrated ${user.email} to Vendor table.`);
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
