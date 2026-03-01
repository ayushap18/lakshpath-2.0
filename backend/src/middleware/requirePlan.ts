import { Request, Response, NextFunction } from 'express';
import prisma from '@lib/prisma';

export const requirePlan = (plan: 'PRO') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    if (!subscription || subscription.plan !== plan || subscription.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'UPGRADE_REQUIRED',
        message: 'This feature requires a Pro subscription',
        upgradeUrl: '/pricing',
      });
    }

    next();
  };
};
