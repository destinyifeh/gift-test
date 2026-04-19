const { PrismaClient } = require('./prisma/generated');

const prisma = new PrismaClient();

async function test() {
  const allSupports = await prisma.creatorSupport.findMany({
    include: { transaction: true }
  });
  console.log('Total CreatorSupports:', allSupports.length);
  for (const s of allSupports) {
    console.log(`- ID: ${s.id}, Message: ${s.message}, TxRef: ${s.transaction?.reference}`);
  }

  const filtered = await prisma.creatorSupport.findMany({
    where: {
      NOT: {
        transaction: {
          reference: {
            startsWith: 'claim-',
          },
        },
      },
    },
    include: { transaction: true }
  });
  console.log('\nFiltered CreatorSupports:', filtered.length);
  for (const s of filtered) {
    console.log(`- ID: ${s.id}, Message: ${s.message}`);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
