import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const c = await prisma.campaign.findFirst({ orderBy: { createdAt: 'desc' }, include: { user: true } });
  console.log("LATEST CAMPAIGN DATA:", JSON.stringify(c, null, 2));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
