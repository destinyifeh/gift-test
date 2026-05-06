import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  const orphanedTxs = await prisma.transaction.findMany({
    where: { 
      type: 'campaign_contribution',
      userId: null
    },
    include: {
      contribution: true
    }
  });

  console.log(`Found ${orphanedTxs.length} orphaned contributions (userId is null).`);
  
  // Find users to potentially link to
  // We'll look for users whose emails match the donorEmail in orphans
  for (const t of orphanedTxs) {
    if (t.contribution?.donorEmail) {
        const user = await prisma.user.findUnique({
            where: { email: t.contribution.donorEmail }
        });
        if (user) {
            console.log(`Liking Tx ${t.id} (Ref: ${t.reference}) to User: ${user.email} (${user.id})`);
            await prisma.transaction.update({
                where: { id: t.id },
                data: { userId: user.id }
            });
        } else {
            console.log(`No user found for donor email: ${t.contribution.donorEmail}`);
        }
    }
  }

  console.log('\nMigration complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await process.exit());
