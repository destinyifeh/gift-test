import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function backfill() {
  const p = prisma as any;
  console.log('Starting wallet backfill...');
  try {
    const users = await p.user.findMany({
      select: { id: true, email: true }
    });

    for (const user of users) {
      console.log(`Processing user: ${user.email} (${user.id})`);

      // 1. Calculate User Wallet (Personal Funds)
      const userTransactions = await p.transaction.findMany({
        where: { 
          userId: user.id,
          status: 'success',
          type: { 
            in: [
              'deposit', 
              'withdrawal', 
              'creator_support', 
              'platform_credit_conversion', 
              'campaign_withdrawal',
              'fee'
            ] 
          }
        }
      });

      let userBalanceKobo = 0n;
      userTransactions.forEach((tx: any) => {
        if (['deposit', 'creator_support', 'platform_credit_conversion', 'campaign_withdrawal'].includes(tx.type)) {
          userBalanceKobo += tx.amount;
        } else if (['withdrawal', 'fee'].includes(tx.type)) {
          userBalanceKobo -= tx.amount;
        }
      });

      // 2. Calculate Vendor Wallet (Business Revenue)
      const redeemedGifts = await p.directGift.findMany({
        where: { 
          redeemedByVendorId: user.id, 
          status: 'redeemed' 
        },
        select: { amount: true }
      });

      const vendorBalanceKobo = redeemedGifts.reduce((acc: bigint, g: any) => acc + BigInt(Math.round(Number(g.amount) * 100)), 0n);

      // 3. Update User
      await p.user.update({
        where: { id: user.id },
        data: {
          userWallet: userBalanceKobo,
          vendorWallet: vendorBalanceKobo
        }
      });

      console.log(`Updated ${user.email}: UserWallet=${userBalanceKobo}, VendorWallet=${vendorBalanceKobo}`);
    }

    console.log('Backfill completed successfully.');
  } catch (error) {
    console.error('Backfill failed:', error);
    throw error;
  }
}

backfill()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
