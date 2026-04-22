import { PrismaClient } from './src/generated/prisma';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    where: { roles: { has: 'admin' } },
    include: { accounts: true }
  });
  console.log(users.map(u => ({ email: u.email, hasAccount: u.accounts.length > 0, hasPassword: u.accounts.some(a => !!a.password) })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
