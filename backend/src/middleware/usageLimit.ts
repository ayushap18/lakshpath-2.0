import { Request, Response, NextFunction } from 'express';
import prisma from '@lib/prisma';

export const usageLimit = (feature: string, freeLimit: number, period: 'day' | 'month') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is Pro — no limits for Pro users
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    // FIX HIGH-1: Also recognize TRIALING status as Pro access
    const isProAccess = subscription?.plan === 'PRO' &&
      (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING');

    if (isProAccess) {
      // Log usage and pass through
      await prisma.usageLog.create({
        data: { userId: req.user.id, feature },
      });
      return next();
    }

    // Free user — check usage count
    const now = new Date();
    let periodStart: Date;

    if (period === 'day') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const usageCount = await prisma.usageLog.count({
      where: {
        userId: req.user.id,
        feature,
        createdAt: { gte: periodStart },
      },
    });

    if (usageCount >= freeLimit) {
      return res.status(403).json({
        error: 'USAGE_LIMIT_REACHED',
        message: `You've reached the free limit of ${freeLimit} ${feature.replace(/_/g, ' ')} per ${period}. Upgrade to Pro for unlimited access.`,
        upgradeUrl: '/pricing',
        limit: freeLimit,
        used: usageCount,
        period,
      });
    }

    // Log usage and pass through
    await prisma.usageLog.create({
      data: { userId: req.user.id, feature },
    });

    next();
  };
};
