import { Request, Response, NextFunction } from 'express';

import { authService } from '@services/authService';

export const authController = {
  async googleSignIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = req.body as { credential?: string };
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      const result = await authService.signInWithGoogle(credential ?? '', ipAddress, userAgent);

      res.status(200).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
          profileSetupCompleted: (result.user as any).profileSetupCompleted ?? false,
        },
        isNewUser: result.isNewUser,
      });
    } catch (error) {
      next(error);
    }
  },

  async demoSignIn(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      const result = await authService.signInAsDemoUser(ipAddress, userAgent);

      res.status(200).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  },
};
