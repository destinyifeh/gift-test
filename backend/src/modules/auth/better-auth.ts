// Ensure BigInt is serialized correctly
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

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
      displayName: { type: 'string', required: false },
      avatarUrl: { type: 'string', required: false },
      isCreator: { type: 'boolean', defaultValue: false },
      country: { type: 'string', required: false },
      roles: { type: 'string[]' as any, defaultValue: ['user'] as any },
      adminRole: { type: 'string', required: false },
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
    {
      id: 'account-vendor',
      hooks: {
        after: [
          {
            matcher: (ctx: any) => ctx.path === '/sign-up/email',
            handler: async (ctx: any) => {
              const user = ctx.response?.user;
              if (!user) return {}; // Prevent crashes if registration failed and ctx.response.user is undefined
              
              const roles = ctx.body.roles || [];
              const fallbackUsername = user.name.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substring(2, 6);
              const username = ctx.body.username || fallbackUsername;
              
              try {
                // Ensure every user has a creator profile (where the username lives now)
                await (prisma as any).creator.upsert({
                  where: { userId: user.id },
                  update: {},
                  create: {
                    userId: user.id,
                    username: username,
                    bio: ctx.body.bio || null,
                  }
                });
              } catch (e) {
                console.error("Failed to automatically create Creator relation on signup", e);
              }
              
              if (roles.includes('vendor')) {
                // Create vendor record
                await (prisma as any).vendor.upsert({
                  where: { userId: user.id },
                  update: {},
                  create: {
                    id: user.id,
                    userId: user.id,
                    businessName: ctx.body.businessName || user.name,
                    businessSlug: ctx.body.businessSlug || user.id,
                    status: ctx.body.isVerifiedVendor ? 'approved' : 'pending',
                    isVerified: ctx.body.isVerifiedVendor || false,
                  },
                });
              }
              
              return {}; // Explicitly return empty object to bypass result.headers crash in better-auth core
            }
          }
        ]
      }
    }
  ],
});
