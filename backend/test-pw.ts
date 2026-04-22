import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { roles: { has: 'admin' } }, include: { accounts: true } });
  
  if (users.length === 0) {
     console.log("NO ADMIN USERS FOUND");
     return;
  }
  
  for (const user of users) {
     console.log(`Admin User: ${user.email} (Username: ${user.username})`);
     const account = user.accounts[0];
     if (!account) { console.log('  No account found'); continue; }
     if (!account.password) { console.log('  No password found in account'); continue; }
     
     console.log('  Password hash exists:', !!account.password);
     console.log('  Hash preview:', account.password.slice(0, 15) + '...');
  }
}
main().finally(() => prisma.$disconnect());
