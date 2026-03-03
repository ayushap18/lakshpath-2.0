import { Request, Response, NextFunction } from 'express';

import { authService } from '@services/authService';
import env from '@config/env';
import prisma from '@lib/prisma';

export const authController = {
  async googleSignIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = req.body as { credential?: string };
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.signInWithGoogle(credential ?? '', ipAddress, userAgent);

      // Check if user has completed an assessment
      const hasAssessment = await prisma.quizResult.count({ where: { userId: result.user.id } }) > 0;

      res.status(200).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
          profileSetupCompleted: (result.user as any).profileSetupCompleted ?? false,
          hasAssessment,
        },
        isNewUser: result.isNewUser,
      });
    } catch (error) {
      next(error);
    }
  },

  async demoSignIn(req: Request, res: Response, next: NextFunction) {
    try {
      // FIX M-17: Check if demo mode is actually enabled
      if (!env.DEMO_MODE_ENABLED) {
        return res.status(403).json({ message: 'Demo mode is disabled' });
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.signInAsDemoUser(ipAddress, userAgent);

      const hasAssessment = await prisma.quizResult.count({ where: { userId: result.user.id } }) > 0;

      res.status(200).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
          profileSetupCompleted: (result.user as any).profileSetupCompleted ?? false,
          hasAssessment,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async emailRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.registerWithEmail(name, email, password, ipAddress, userAgent);

      const hasAssessment = false; // New user

      res.status(201).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
          profileSetupCompleted: false,
          hasAssessment,
          plan: result.user.subscription?.plan || 'FREE',
        },
        isNewUser: true,
      });
    } catch (error) {
      next(error);
    }
  },

  async emailLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.loginWithEmail(email, password, ipAddress, userAgent);

      const hasAssessment = await prisma.quizResult.count({ where: { userId: result.user.id } }) > 0;

      res.status(200).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
          profileSetupCompleted: (result.user as any).profileSetupCompleted ?? false,
          hasAssessment,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      res.status(200).json(result);
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
        plan: user.subscription?.plan || 'FREE',
        subscriptionStatus: user.subscription?.status || null,
      });
    } catch (error) {
      next(error);
    }
  },
};
