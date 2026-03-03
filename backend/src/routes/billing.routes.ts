import { Router } from 'express';

import { billingController } from '@controllers/billingController';
import { authenticate } from '@middleware/authenticate';
import { webhookLimiter } from '@middleware/rateLimiter';

const router = Router();

// Public
router.get('/plans', billingController.getPlans);

// Webhook (no auth, verified by signature, rate-limited)
router.post('/webhook', webhookLimiter, billingController.webhook);

// Authenticated
router.post('/subscribe', authenticate, billingController.subscribe);
router.post('/verify', authenticate, billingController.verifyPayment);
router.get('/subscription', authenticate, billingController.getSubscription);
router.post('/cancel', authenticate, billingController.cancelSubscription);
router.post('/trial', authenticate, billingController.startTrial);

export default router;
