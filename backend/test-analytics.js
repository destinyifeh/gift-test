const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({ where: { roles: { has: 'user' } }});
  if (!user) return console.log("no user");
  console.log("User wallet BigInt stringify test:");
  
  BigInt.prototype.toJSON = function () { return Number(this); };
  console.log(JSON.stringify({ wallet: user.userWallet }));
  process.exit(0);
}
run();
