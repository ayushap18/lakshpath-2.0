import { Request, Response, NextFunction } from 'express';

import { razorpayService } from '@services/razorpayService';
import prisma from '@lib/prisma';

export const billingController = {
  async getPlans(_req: Request, res: Response, next: NextFunction) {
    try {
      const plans = razorpayService.getPlans();
      res.status(200).json({ plans });
    } catch (error) {
      next(error);
    }
  },

  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const billingCycle = req.body?.billingCycle === 'yearly' ? 'yearly' : 'monthly';
      const result = await razorpayService.createSubscription(req.user.id, billingCycle);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

      if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing payment verification fields' });
      }

      const subscription = await razorpayService.verifyPayment(
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature,
        req.user.id
      );

      res.status(200).json({
        message: 'Payment verified successfully',
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const subscription = await razorpayService.getSubscription(req.user.id);
      res.status(200).json({ subscription });
    } catch (error) {
      next(error);
    }
  },

  async cancelSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const subscription = await razorpayService.cancelSubscription(req.user.id);
      res.status(200).json({
        message: 'Subscription will be cancelled at end of billing period',
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        return res.status(400).json({ message: 'Missing signature' });
      }

      // FIX CRIT-2: Pass raw body (Buffer) for correct HMAC verification.
      // express.raw() middleware gives us req.body as a Buffer.
      const result = await razorpayService.handleWebhook(req.body as Buffer, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async startTrial(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const existing = await prisma.subscription.findUnique({ where: { userId: req.user.id } });

      // Can't start trial if already Pro or already used trial
      if (existing?.plan === 'PRO' && existing.status === 'ACTIVE') {
        return res.status(400).json({ message: 'Already subscribed to Pro' });
      }
      if (existing?.trialEndsAt) {
        return res.status(400).json({ message: 'Free trial already used' });
      }
      // FIX M-9: Block trial for users who previously had a paid subscription
      if (existing?.razorpaySubId) {
        return res.status(400).json({ message: 'Free trial is only available for new users' });
      }

      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7);

      const subscription = await prisma.subscription.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          plan: 'PRO',
          status: 'TRIALING',
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          trialEndsAt: trialEnd,
        },
        update: {
          plan: 'PRO',
          status: 'TRIALING',
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          trialEndsAt: trialEnd,
        },
      });

      res.status(200).json({
        message: 'Free trial started! Enjoy 7 days of Pro.',
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
