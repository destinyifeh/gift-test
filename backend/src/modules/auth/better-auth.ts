import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { APIError } from 'better-auth/api';
import 'dotenv/config';
import { Pool } from 'pg';
import { AuthEmailHelper } from './auth-email.helper.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001/api/auth',
  trustedOrigins: (
    process.env.BETTER_AUTH_TRUSTED_ORIGINS || 'http://localhost:3000'
  ).split(','),
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
      suggestedAmounts: {
        type: 'number[]' as any,
        defaultValue: [5, 10, 25] as any,
      },
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
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
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
  },

  emailVerification: {
    requireEmailVerification: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }, ctx) {
        // Skip for certain conditions if needed, but usually we want to send it
        const user = await (prisma as any).user.findUnique({
          where: { email },
        });

        await AuthEmailHelper.sendOTP({
          to: email,
          userName: user?.name || 'there',
          otp,
        });
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: true,
      storeOTP: 'hashed',
      overrideDefaultEmailVerification: true,
    }),
    {
      id: 'account-status',
      hooks: {
        before: [
          {
            matcher: (ctx: any) => ctx.path === '/sign-in/email',
            handler: async (ctx: any) => {
              const email = ctx.body?.email;
              if (!email) return;

              const userByEmail = await (prisma as any).user.findUnique({
                where: { email },
              });
              if (!userByEmail) return;

              // Force block unverified users during sign-in
              if (!userByEmail.emailVerified) {
                throw new APIError('FORBIDDEN', {
                  message: 'EMAIL_NOT_VERIFIED',
                });
              }

              if (userByEmail.status === 'active') return;

              if (userByEmail.status === 'suspended') {
                // Auto-reactivate if suspension period has passed
                if (
                  userByEmail.suspensionEnd &&
                  new Date(userByEmail.suspensionEnd) < new Date()
                ) {
                  await (prisma as any).user.update({
                    where: { id: userByEmail.id },
                    data: { status: 'active', suspensionEnd: null },
                  });
                  return;
                }

                throw new APIError('FORBIDDEN', {
                  message: `SUSPENDED:${userByEmail.suspensionEnd ? new Date(userByEmail.suspensionEnd).toISOString() : 'PERMANENT'}`,
                });
              }

              if (userByEmail.status === 'banned') {
                throw new APIError('FORBIDDEN', { message: 'BANNED' });
              }
            },
          },
        ],
      },
    },
  ],
});
