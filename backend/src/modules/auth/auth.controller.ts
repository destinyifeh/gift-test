import { Controller, All, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './better-auth';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  /**
   * Universal handler for all Better Auth endpoints
   * Handles /auth/login, /auth/signup, /auth/social, etc.
   */
  @All('/*path')
  async catchAll(@Req() req: Request, @Res() res: Response) {
    return (auth as any).handler(req, res);
  }

  /**
   * Get the currently logged-in user session
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    return {
      success: true,
      user: (req as any).user,
      session: (req as any).session,
    };
  }

  /**
   * Update password for an authenticated user
   */
  @Post('change-password')
  @UseGuards(AuthGuard)
  async changePassword(@Req() req: Request, @Body('newPassword') newPassword: string) {
    const userId = (req as any).user.id;
    return this.authService.updatePassword(userId, newPassword);
  }
}
