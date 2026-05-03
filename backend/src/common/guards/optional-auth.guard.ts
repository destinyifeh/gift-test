import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { auth } from '../../modules/auth/better-auth';
import { fromNodeHeaders } from 'better-auth/node';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (session) {
        // Attach user to request object if session exists
        (req as any).user = session.user;
        (req as any).session = session.session;
      }
    } catch (error) {
      // Ignore error for optional auth
    }

    return true;
  }
}
