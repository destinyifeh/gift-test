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
   * Universal handler for all Better Auth endpoints
   * Handles /auth/login, /auth/signup, /auth/social, etc.
   */
  @All('/*path')
  async catchAll(@Req() req: Request, @Res() res: Response) {
    const handler = toNodeHandler(auth);
    return handler(req, res);
  }

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
   * Update password for an authenticated user
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
}
