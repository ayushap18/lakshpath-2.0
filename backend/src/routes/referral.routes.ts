import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import { authenticate } from '@middleware/authenticate';
import prisma from '@lib/prisma';

const router = Router();

// Generate referral code for current user
router.post('/generate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return existing code if user already has one
    if (user.referralCode) {
      const stats = await prisma.referral.aggregate({
        where: { referrerId: req.user.id, status: 'REDEEMED' },
        _count: true,
      });
      return res.status(200).json({
        referralCode: user.referralCode,
        shareUrl: `${process.env.FRONTEND_URL || 'https://lakshpath-336426317494.asia-south1.run.app'}/register?ref=${user.referralCode}`,
        totalReferred: stats._count,
      });
    }

    // Generate unique code
    const code = `LP${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await prisma.user.update({ where: { id: req.user.id }, data: { referralCode: code } });

    res.status(200).json({
      referralCode: code,
      shareUrl: `${process.env.FRONTEND_URL || 'https://lakshpath-336426317494.asia-south1.run.app'}/register?ref=${code}`,
      totalReferred: 0,
    });
  } catch (error) {
    next(error);
  }
});

// Get referral stats for current user
router.get('/stats', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Not authenticated' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const referrals = await prisma.referral.findMany({
      where: { referrerId: req.user.id },
      include: { referred: { select: { name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      referralCode: user?.referralCode || null,
      shareUrl: user?.referralCode
        ? `${process.env.FRONTEND_URL || 'https://lakshpath-336426317494.asia-south1.run.app'}/register?ref=${user.referralCode}`
        : null,
      total: referrals.length,
      redeemed: referrals.filter(r => r.status === 'REDEEMED').length,
      referrals: referrals.map(r => ({
        status: r.status,
        rewardGiven: r.rewardGiven,
        referredName: r.referred?.name || 'Pending',
        createdAt: r.createdAt,
        redeemedAt: r.redeemedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Redeem referral code (called during registration)
router.post('/redeem', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Not authenticated' });
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Referral code is required' });

    // Find referrer by code
    const referrer = await prisma.user.findFirst({ where: { referralCode: code } });
    if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });
    if (referrer.id === req.user.id) return res.status(400).json({ message: 'Cannot use your own referral code' });

    // FIX HIGH-14: Use transaction to prevent TOCTOU race condition on referral redemption
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Check if already redeemed a referral (inside transaction)
      const existing = await tx.referral.findFirst({ where: { referredId: req.user!.id } });
      if (existing) {
        throw new Error('ALREADY_REDEEMED');
      }

      // FIX M-13: Cap referral rewards at 10 per referrer to prevent farming
      const referrerCount = await tx.referral.count({
        where: { referrerId: referrer.id, status: 'REDEEMED' },
      });
      if (referrerCount >= 10) {
        throw new Error('REFERRER_CAP_REACHED');
      }

      // Create referral record
      await tx.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: req.user!.id,
          code,
          status: 'REDEEMED',
          rewardGiven: true,
          redeemedAt: now,
        },
      });

      // Reward: Give 1 month Pro to BOTH referrer and referred user
      for (const userId of [referrer.id, req.user!.id]) {
        const existingSub = await tx.subscription.findUnique({ where: { userId } });
        const currentEnd = existingSub?.currentPeriodEnd && existingSub.plan === 'PRO' && existingSub.status === 'ACTIVE'
          ? new Date(existingSub.currentPeriodEnd)
          : now;
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + 1);

        await tx.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: 'PRO',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: newEnd,
          },
          update: {
            plan: 'PRO',
            status: 'ACTIVE',
            currentPeriodEnd: newEnd,
          },
        });
      }

      return true;
    });

    if (!result) {
      return res.status(400).json({ message: 'Failed to redeem referral' });
    }

    res.status(200).json({
      message: 'Referral redeemed! Both you and your friend get 1 month of Pro free.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
