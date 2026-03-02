import Razorpay from 'razorpay';
import crypto from 'crypto';

import env from '@config/env';
import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';

const getRazorpayInstance = () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError('Razorpay is not configured', 503);
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
};

export const razorpayService = {
  async createSubscription(userId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
    const razorpay = getRazorpayInstance();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    // Check if already subscribed
    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing?.plan === 'PRO' && existing.status === 'ACTIVE') {
      throw new AppError('Already subscribed to Pro', 400);
    }

    const planId = billingCycle === 'yearly'
      ? env.RAZORPAY_PLAN_ID_PRO_YEARLY
      : env.RAZORPAY_PLAN_ID_PRO;

    if (!planId) {
      throw new AppError(`Razorpay ${billingCycle} plan not configured`, 503);
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: billingCycle === 'yearly' ? 5 : 12,
      notes: {
        userId: user.id,
        email: user.email || '',
        billingCycle,
      },
    });

    // Store pending subscription
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        razorpaySubId: subscription.id,
        status: 'ACTIVE',
        billingCycle,
      },
      create: {
        userId,
        plan: 'FREE',
        status: 'ACTIVE',
        razorpaySubId: subscription.id,
        billingCycle,
      },
    });

    return {
      subscriptionId: subscription.id,
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      billingCycle,
    };
  },

  async verifyPayment(
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string,
    userId: string
  ) {
    if (!env.RAZORPAY_KEY_SECRET) {
      throw new AppError('Razorpay is not configured', 503);
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Update subscription to PRO
    const now = new Date();
    const periodEnd = new Date(now);

    // Check billing cycle from the pending subscription
    const pendingSub = await prisma.subscription.findFirst({ where: { razorpaySubId: razorpaySubscriptionId } });
    if (pendingSub?.billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: 'PRO',
        status: 'ACTIVE',
        razorpaySubId: razorpaySubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId,
        plan: 'PRO',
        status: 'ACTIVE',
        razorpaySubId: razorpaySubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Record payment
    await prisma.payment.create({
      data: {
        userId,
        razorpayPaymentId,
        razorpayOrderId: razorpaySubscriptionId,
        razorpaySignature,
        amount: 49900, // ₹499 in paise
        currency: 'INR',
        status: 'SUCCESS',
        plan: 'PRO',
      },
    });

    return subscription;
  },

  async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription || subscription.plan === 'FREE') {
      throw new AppError('No active Pro subscription to cancel', 400);
    }

    // Cancel at period end (don't revoke immediately)
    if (subscription.razorpaySubId) {
      try {
        const razorpay = getRazorpayInstance();
        await razorpay.subscriptions.cancel(subscription.razorpaySubId, false);
      } catch (err) {
        console.error('Razorpay cancel error:', err);
      }
    }

    const updated = await prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    });

    return updated;
  },

  async getSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    return subscription || { plan: 'FREE', status: 'ACTIVE', currentPeriodEnd: null, cancelAtPeriodEnd: false };
  },

  async handleWebhook(payload: any, signature: string) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      throw new AppError('Webhook secret not configured', 503);
    }

    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid webhook signature', 400);
    }

    const event = payload.event;
    const entity = payload.payload?.subscription?.entity || payload.payload?.payment?.entity;

    switch (event) {
      case 'subscription.charged': {
        // Recurring payment success
        const subId = entity?.id;
        if (subId) {
          const sub = await prisma.subscription.findFirst({ where: { razorpaySubId: subId } });
          if (sub) {
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                status: 'ACTIVE',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
              },
            });
          }
        }
        break;
      }
      case 'subscription.cancelled': {
        const subId = entity?.id;
        if (subId) {
          const sub = await prisma.subscription.findFirst({ where: { razorpaySubId: subId } });
          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { plan: 'FREE', status: 'CANCELLED' },
            });
          }
        }
        break;
      }
      case 'payment.failed': {
        const subId = payload.payload?.payment?.entity?.subscription_id;
        if (subId) {
          const sub = await prisma.subscription.findFirst({ where: { razorpaySubId: subId } });
          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: 'PAST_DUE' },
            });
          }
        }
        break;
      }
    }

    return { received: true };
  },

  getPlans() {
    return [
      {
        id: 'FREE',
        name: 'Free',
        price: 0,
        currency: 'INR',
        interval: 'monthly',
        features: [
          'Basic career assessment',
          '3 career path suggestions',
          'Limited micro-learning tasks',
          'Community access',
          '3 AI chats per day',
        ],
      },
      {
        id: 'PRO',
        name: 'Pro',
        price: 499,
        currency: 'INR',
        interval: 'monthly',
        features: [
          'Advanced AI assessment',
          'Career DNA Card',
          'AI Resume Builder',
          'Skill Gap Simulator',
          'Placement prep packs',
          'Unlimited AI Chat',
          'Mock Interviews',
          'AI Code Interviewer',
          'Full Portfolio Analysis',
          'Market Intelligence',
          'Priority Support',
        ],
      },
    ];
  },
};
