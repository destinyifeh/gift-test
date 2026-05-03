import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Creator Table Recovery & Migration Script ---');

  const userCount = await prisma.user.count();
  console.log('Total users in database:', userCount);

  // 1. Identify potential creators from Campaign table
  const campaigns = await (prisma as any).campaign.findMany({
    select: { userId: true },
  });
  const creatorUserIdsFromCampaigns = new Set<string>(campaigns.map((c: any) => c.userId));
  console.log(`Found ${creatorUserIdsFromCampaigns.size} potential creators from campaigns.`);

  // 2. Identify potential creators from CreatorSupport table
  const supports = await (prisma as any).creatorSupport.findMany({
    select: { creatorId: true },
  });
  const creatorUserIdsFromSupports = new Set<string>(supports.map((s: any) => s.creatorId).filter(Boolean));
  console.log(`Found ${creatorUserIdsFromSupports.size} potential creators from supports.`);

  const allCreatorUserIds = new Set([...creatorUserIdsFromCampaigns, ...creatorUserIdsFromSupports]);

  // 3. Create Creator records for these users
  for (const userId of allCreatorUserIds) {
    const existingCreator = await (prisma as any).creator.findUnique({
      where: { userId },
    });

    if (!existingCreator) {
      console.log(`Creating Creator profile for user ${userId}...`);
      await (prisma as any).creator.create({
        data: {
          userId,
          username: `creator_${userId.slice(0, 8).replace(/-/g, '')}`, // Fallback username
          bio: 'Migrated creator profile',
          wallet: BigInt(0),
        },
      });
    } else {
      console.log(`Creator profile already exists for user ${userId}.`);
    }
  }

  console.log('Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
