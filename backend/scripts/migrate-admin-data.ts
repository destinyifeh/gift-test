import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL?.replace('localhost', '127.0.0.1');
const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Phase 1: Migrating Admin Users ---');
  
  // Find users with admin roles
  // Note: We use 'any' because the roles field might have changed in the client
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { roles: { has: 'admin' } },
        { roles: { has: 'superadmin' } }
      ]
    }
  }) as any[];

  console.log(`Found ${users.length} users with admin roles.`);

  for (const user of users) {
    console.log(`Processing user: ${user.email} (${user.id})`);
    
    // Determine admin role
    let adminRole = 'support';
    if (user.roles.includes('superadmin')) {
      adminRole = 'superadmin';
    } else if (user.adminRole) {
      adminRole = user.adminRole;
    }

    // Create Admin record
    await (prisma as any).admin.upsert({
      where: { userId: user.id },
      update: { role: adminRole },
      create: {
        userId: user.id,
        role: adminRole,
        status: 'active'
      }
    });
    console.log(`- Created/Updated Admin record for ${user.email}`);
  }

  console.log('\n--- Phase 2: Updating Relations ---');

  const admins = await (prisma as any).admin.findMany({
    include: { user: true }
  });

  const userIdToAdminId = admins.reduce((acc: any, admin: any) => {
    acc[admin.userId] = admin.id;
    return acc;
  }, {});

  // 1. AdminLog
  console.log('Updating AdminLog...');
  const adminLogs = await (prisma as any).adminLog.findMany();
  for (const log of adminLogs) {
    const adminId = userIdToAdminId[log.adminId];
    if (adminId) {
      await (prisma as any).adminLog.update({
        where: { id: log.id },
        data: { adminId: adminId }
      });
    }
  }

  // 2. ModerationReport (ResolvedBy)
  console.log('Updating ModerationReport resolvers...');
  const reports = await (prisma as any).moderationReport.findMany({
    where: { resolvedById: { not: null } }
  });
  for (const report of reports) {
    const adminId = userIdToAdminId[report.resolvedById!];
    if (adminId) {
      await (prisma as any).moderationReport.update({
        where: { id: report.id },
        data: { resolvedById: adminId }
      });
    }
  }

  // 3. ModerationTicket (ResolvedBy)
  console.log('Updating ModerationTicket resolvers...');
  const tickets = await (prisma as any).moderationTicket.findMany({
    where: { resolvedById: { not: null } }
  });
  for (const ticket of tickets) {
    const adminId = userIdToAdminId[ticket.resolvedById!];
    if (adminId) {
      await (prisma as any).moderationTicket.update({
        where: { id: ticket.id },
        data: { resolvedById: adminId }
      });
    }
  }

  // 4. ExternalPromotion (Admin)
  console.log('Updating ExternalPromotion admins...');
  const promos = await (prisma as any).externalPromotion.findMany();
  for (const promo of promos) {
    const adminId = userIdToAdminId[promo.adminId];
    if (adminId) {
      await (prisma as any).externalPromotion.update({
        where: { id: promo.id },
        data: { adminId: adminId }
      });
    }
  }

  console.log('\nMigration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
