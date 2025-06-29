import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Add session data to request if session exists
    if (req.sessionID) {
      const session = this.authService.getSession(req.sessionID);
      if (session) {
        req['user'] = {
          id: session.userId,
          username: session.username,
          createdAt: new Date(),
        };
      }
    }
    next();
  }

  // Method to get user from session for WebSocket connections
  getUserFromSession(sessionId: string) {
    return this.authService.getSession(sessionId);
  }
}
