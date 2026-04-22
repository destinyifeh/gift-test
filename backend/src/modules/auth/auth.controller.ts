import { Controller, All, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './better-auth';
import { toNodeHandler } from 'better-auth/node';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  

  /**
   * Get the currently logged-in user session
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    return {
      user: (req as any).user,
      session: (req as any).session,
    };
  }

  /**
   * Manual Password Update (When logged in)
   * Mirrors frontend: auth.ts → updatePassword
   */
  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Req() req: Request, 
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    const userId = (req as any).user.id;
    return this.authService.updatePassword(userId, currentPassword, newPassword, req.headers as any);
  }

  /**
   * Resend Verification OTP
   */
  @Post('resend-otp')
  async resendOTP(@Body('email') email: string) {
    return this.authService.sendVerificationOTP(email);
  }

  /**
   * Verify Email OTP
   */
  @Post('verify-otp')
  async verifyOTP(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyEmailOTP(email, otp);
  }

  /**
   * Send Password Reset OTP
   */
  @Post('forgot-password-otp')
  async forgotPasswordOTP(@Body('email') email: string) {
    console.log('[AuthController] forgotPasswordOTP for email:', email);
    return this.authService.sendResetPasswordOTP(email);
  }

  /**
   * Reset Password with OTP
   */
  @Post('reset-password-otp')
  async resetPasswordOTP(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.resetPasswordWithOTP(email, otp, newPassword);
  }

  /**
   * Universal handler for all Better Auth endpoints
   * Handles /auth/login, /auth/signup, /auth/social, etc.
   * This is at the bottom to allow specific routes to match first.
   */
  @All('/*path')
  async catchAll(@Req() req: Request, @Res() res: Response) {
    const handler = toNodeHandler(auth);
    return handler(req, res);
  }
}
