import { Router, Request, Response } from 'express';

import { authController } from '@controllers/authController';
import { authenticate } from '@middleware/authenticate';
import { validate } from '@middleware/validate';
import {
  googleAuthSchema,
  emailRegisterSchema,
  emailLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@middleware/schemas';
import prisma from '@lib/prisma';

const router = Router();

// Google OAuth
router.post('/google', validate(googleAuthSchema), authController.googleSignIn);

// Email/password auth
router.post('/register', validate(emailRegisterSchema), authController.emailRegister);
router.post('/login', validate(emailLoginSchema), authController.emailLogin);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Demo login
router.post('/demo', authController.demoSignIn);

// Current user
router.get('/me', authenticate, authController.getCurrentUser);

// Logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.loginLog.create({
      data: {
        userId: req.user!.id,
        method: 'GOOGLE',
        success: true,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      },
    });
  } catch {}
  res.status(200).json({ message: 'Logged out' });
});

export default router;
