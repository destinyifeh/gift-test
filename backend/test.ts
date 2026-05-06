import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const configs = await p.countryConfig.findMany();
  console.log(configs);
  await p.countryConfig.updateMany({ where: { countryCode: 'ZA' }, data: { isEnabled: true } });
  await p.countryConfig.upsert({
    where: { countryCode: 'CI' },
    create: { countryName: "Cote d'Ivoire", countryCode: "CI", currency: "XOF", currencySymbol: "CFA", flag: "🇨🇮", transactionFeePercent: 4, withdrawalFeeFlat: 500, minWithdrawal: 5000, maxWithdrawal: 1000000, features: {"creatorSupport": true, "vendorShop": true, "campaigns": true, "flexCard": true}, isEnabled: true },
    update: { isEnabled: true }
  });
  const configs2 = await p.countryConfig.findMany();
  console.log('After update:', configs2.map(c => c.countryCode + ': ' + c.isEnabled));
}
main();
