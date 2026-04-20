import { Injectable, UnauthorizedException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { auth } from './better-auth.js';
import { EmailService } from '../email/email.service.js';
import { ConfigService } from '@nestjs/config';
import { AuthEmailHelper } from './auth-email.helper.js';
import type { Request } from 'express';

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
  async updatePassword(userId: string, currentPassword: string, newPassword: string, headers?: any) {
    try {
      await (auth.api as any).changePassword({
        headers: headers ? new Headers(headers) : undefined,
        body: {
          currentPassword,
          newPassword,
        }
      });
      return { success: true };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Could not update password');
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
   * Admin-triggered sign up
   */
  async signUpEmail(data: { email: string; password?: string; name: string; roles?: string[]; isVerifiedVendor?: boolean }) {
    return (auth.api as any).signUpEmail({
      body: {
        email: data.email,
        password: data.password || 'TemporaryPassword123!',
        name: data.name,
        roles: data.roles || ['user'],
        isVerifiedVendor: data.isVerifiedVendor || false,
        suggestedAmounts: [5, 10, 25],
        platformBalance: 0,
      }
    });
  }
}
