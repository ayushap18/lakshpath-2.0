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

    if (!subscription || subscription.plan !== plan) {
      return res.status(403).json({
        error: 'UPGRADE_REQUIRED',
        message: 'This feature requires a Pro subscription',
        upgradeUrl: '/pricing',
      });
    }

    // FIX HIGH-1: Recognize TRIALING status as valid Pro access
    const validStatuses = ['ACTIVE', 'TRIALING'];
    if (!validStatuses.includes(subscription.status)) {
      return res.status(403).json({
        error: 'UPGRADE_REQUIRED',
        message: 'This feature requires a Pro subscription',
        upgradeUrl: '/pricing',
      });
    }

    // FIX HIGH-2: Check if trial has expired
    if (subscription.status === 'TRIALING' && subscription.trialEndsAt) {
      if (new Date() > new Date(subscription.trialEndsAt)) {
        await prisma.subscription.update({
          where: { userId: req.user.id },
          data: { plan: 'FREE', status: 'ACTIVE' },
        });
        return res.status(403).json({
          error: 'TRIAL_EXPIRED',
          message: 'Your free trial has expired. Upgrade to Pro to continue.',
          upgradeUrl: '/pricing',
        });
      }
    }

    // FIX HIGH-2: Check if subscription period has expired
    if (subscription.currentPeriodEnd && new Date() > new Date(subscription.currentPeriodEnd)) {
      await prisma.subscription.update({
        where: { userId: req.user.id },
        data: { plan: 'FREE', status: 'ACTIVE' },
      });
      return res.status(403).json({
        error: 'SUBSCRIPTION_EXPIRED',
        message: 'Your Pro subscription has expired. Please renew.',
        upgradeUrl: '/pricing',
      });
    }

    next();
  };
};
