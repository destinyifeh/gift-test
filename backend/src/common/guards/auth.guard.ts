import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { auth } from '../../modules/auth/better-auth';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    
    try {
      const session = await auth.api.getSession({
        headers: req.headers as Record<string, string>,
      });

      if (!session) {
        throw new UnauthorizedException('Authentication required');
      }

      // Attach user to request object for use in controllers
      (req as any).user = session.user;
      (req as any).session = session.session;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
