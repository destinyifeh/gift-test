import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  const transactions = await prisma.transaction.findMany({
    where: { type: 'campaign_contribution' }
  });
  console.log('--- Transactions (type: campaign_contribution) ---');
  console.log(`Count: ${transactions.length}`);
  
  const contributions = await prisma.contribution.findMany();
  console.log('--- Contributions ---');
  console.log(`Count: ${contributions.length}`);
  if (contributions.length > 0) {
    console.log(contributions.slice(0, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await process.exit());
