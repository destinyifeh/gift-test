import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthEmailHelper } from './auth-email.helper.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS || 'http://localhost:3000').split(','),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      username: { type: 'string', required: false },
      displayName: { type: 'string', required: false },
      avatarUrl: { type: 'string', required: false },
      bio: { type: 'string', required: false },
      isCreator: { type: 'boolean', defaultValue: false },
      suggestedAmounts: { type: 'string[]' as any, defaultValue: ['5', '10', '25'] as any }, // Stored as array in Prisma, but Better Auth might need mapping
      socialLinks: { type: 'string' as any, defaultValue: '{}' },
      themeSettings: { type: 'string' as any, defaultValue: '{}' },
      country: { type: 'string', required: false },
      roles: { type: 'string[]' as any, defaultValue: ['user'] as any },
      adminRole: { type: 'string', required: false },
      platformBalance: { type: 'number' as any, defaultValue: 0 as any },
      status: { type: 'string', defaultValue: 'active' },
      walletStatus: { type: 'string', defaultValue: 'active' },
      shopName: { type: 'string', required: false },
      shopDescription: { type: 'string', required: false },
      shopAddress: { type: 'string', required: false },
      shopSlug: { type: 'string', required: false },
      shopLogoUrl: { type: 'string', required: false },
      bannerUrl: { type: 'string', required: false },
      isVerifiedVendor: { type: 'boolean', defaultValue: false },
      vendorStatus: { type: 'string', defaultValue: 'pending' },
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await AuthEmailHelper.sendVerifyEmail({
        to: user.email,
        userName: user.name,
        verificationUrl: url,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await AuthEmailHelper.sendResetEmail({
        to: user.email,
        userName: user.name,
        resetUrl: url,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.BETTER_AUTH_APPLE_CLIENT_ID!,
      clientSecret: process.env.BETTER_AUTH_APPLE_CLIENT_SECRET!,
    },
  }
});
