import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { AuthEmailHelper } from './auth-email.helper.js';

const prisma = new PrismaClient({});

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
      roles: { type: 'string[]' as any, defaultValue: ['user'] as any },
      isCreator: { type: 'boolean', defaultValue: false },
      platformBalance: { type: 'number' as any, defaultValue: 0 as any },
      status: { type: 'string', defaultValue: 'active' },
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
    // Configured via environment variables
    // BETTER_AUTH_GOOGLE_CLIENT_ID, BETTER_AUTH_GOOGLE_CLIENT_SECRET, etc.
  }
});
