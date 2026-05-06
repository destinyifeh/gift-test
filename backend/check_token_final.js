const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const token = '6adb47420c5f8e62';
  console.log(`Deep searching for token: ${token}`);

  const [flex, direct, campaign] = await Promise.all([
    prisma.flexCard.findFirst({ where: { OR: [{ claimToken: token }, { code: { equals: token, mode: 'insensitive' } }] } }),
    prisma.directGift.findFirst({ where: { OR: [{ claimToken: token }, { giftCode: { equals: token, mode: 'insensitive' } }] } }),
    prisma.campaign.findFirst({ where: { OR: [{ claimToken: token }, { giftCode: { equals: token, mode: 'insensitive' } }] } })
  ]);

  console.log('--- SEARCH RESULTS ---');
  if (flex) console.log('Found in FlexCard table:', flex.id, 'Code:', flex.code);
  if (direct) console.log('Found in DirectGift table:', direct.id, 'GiftCode:', direct.giftCode, 'Type:', direct.claimableType);
  if (campaign) console.log('Found in Campaign table:', campaign.id, 'GiftCode:', campaign.giftCode);
  
  if (!flex && !direct && !campaign) {
    console.log('NOT FOUND in any relevant table.');
    
    // Check for ANY flex cards to see if table is working
    const someFlex = await prisma.flexCard.findFirst();
    console.log('Sample FlexCard in DB:', someFlex ? someFlex.id : 'NONE');
  }
}

main().finally(() => prisma.$disconnect());
