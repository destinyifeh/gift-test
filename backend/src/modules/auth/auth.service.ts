import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { AuthEmailHelper } from './auth-email.helper.js';
import { auth } from './better-auth.js';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    // Register the email sender for Better Auth callbacks
    AuthEmailHelper.registerReset(async (params) => {
      return this.emailService.sendPasswordResetEmail(params);
    });

    AuthEmailHelper.registerVerify(async (params) => {
      return this.emailService.sendVerificationEmail(params);
    });

    AuthEmailHelper.registerOTP(async (params) => {
      return this.emailService.sendOTPEmail(params);
    });
  }

  /**
   * Helper to get the current session from headers
   */
  async getSession(req: Request) {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    return session;
  }

  /**
   * Helper to find a user by ID
   */
  async findUserById(id: string) {
    return (this.prisma as any).user.findUnique({
      where: { id },
    });
  }

  /**
   * Manual Password Update (When logged in)
   * Mirrors frontend: auth.ts → updatePassword
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    headers?: any,
  ) {
    try {
      // 1. Check if user actually has a password in the DB
      const account = await (this.prisma as any).account.findFirst({
        where: { userId, password: { not: null } },
      });

      if (!account) {
        // User logged in via OTP/OAuth and doesn't have a password yet!
        // We use setPassword instead of changePassword
        await (auth.api as any).setPassword({
          headers: headers ? new Headers(headers) : undefined,
          body: { newPassword },
        });
        return { success: true };
      }
      // 2. Normal change password flow
      await (auth.api as any).changePassword({
        headers: headers ? new Headers(headers) : undefined,
        body: {
          currentPassword,
          newPassword,
        },
      });
      return { success: true };
    } catch (error: any) {
      let message =
        error.body?.message || error.message || 'Could not update password';
      if (message === 'Invalid password' || message === 'INVALID_PASSWORD') {
        message = 'Incorrect current password';
      }
      throw new BadRequestException(message);
    }
  }

  /**
   * Check if a user has a specific role
   */
  async hasRole(userId: string, role: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });
    return user?.roles.includes(role) || false;
  }

  /**
   * Send Verification OTP
   */
  async sendVerificationOTP(email: string) {
    try {
      await (auth.api as any).sendVerificationOTP({
        body: {
          email,
          type: 'email-verification',
        },
      });
      return { success: true };
    } catch (error: any) {
      const message =
        error.body?.message ||
        error.message ||
        'Could not send verification code';
      throw new BadRequestException(message);
    }
  }

  /**
   * Verify Email OTP
   */
  async verifyEmailOTP(email: string, otp: string) {
    try {
      await (auth.api as any).verifyEmailOTP({
        body: {
          email,
          otp,
        },
      });
      return { success: true };
    } catch (error: any) {
      const message =
        error.body?.message ||
        error.message ||
        'Invalid or expired verification code';
      console.error(
        '[AuthService] Throwing BadRequestException with message:',
        message,
      );
      throw new BadRequestException(message);
    }
  }

  /**
   * Send Password Reset OTP
   */
  async sendResetPasswordOTP(email: string) {
    console.log('[AuthService] sendResetPasswordOTP starting for:', email);
    try {
      await (auth.api as any).sendVerificationOTP({
        body: {
          email,
          type: 'forget-password',
        },
      });
      console.log('[AuthService] sendResetPasswordOTP success');
      return { success: true };
    } catch (error: any) {
      console.error('[AuthService] sendResetPasswordOTP error:', error);
      const message =
        error.body?.message || error.message || 'Could not send reset code';
      throw new BadRequestException(message);
    }
  }

  /**
   * Reset Password with OTP
   */
  async resetPasswordWithOTP(email: string, otp: string, newPassword: string) {
    try {
      await (auth.api as any).resetPasswordEmailOTP({
        body: {
          email,
          otp,
          password: newPassword,
        },
      });
      return { success: true };
    } catch (error: any) {
      const message =
        error.body?.message || error.message || 'Could not reset password';
      throw new BadRequestException(message);
    }
  }

  /**
   * Admin-triggered sign up
   */
  async signUpEmail(data: {
    email: string;
    password?: string;
    name: string;
    roles?: string[];
    isVerifiedVendor?: boolean;
  }) {
    return (auth.api as any).signUpEmail({
      body: {
        email: data.email,
        password: data.password || 'TemporaryPassword123!',
        name: data.name,
        roles: data.roles || ['user'],
        isVerifiedVendor: data.isVerifiedVendor || false,
        suggestedAmounts: [5, 10, 25],
        platformBalance: 0,
      },
    });
  }
}
