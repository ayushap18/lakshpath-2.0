import { Request, Response, NextFunction } from 'express';

import { razorpayService } from '@services/razorpayService';

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

      const result = await razorpayService.createSubscription(req.user.id);
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

      const result = await razorpayService.handleWebhook(req.body, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
