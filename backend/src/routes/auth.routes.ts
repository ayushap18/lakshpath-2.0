import { Router, Request, Response } from 'express';

import { authController } from '@controllers/authController';
import { authenticate } from '@middleware/authenticate';
import { validate } from '@middleware/validate';
import { googleAuthSchema } from '@middleware/schemas';
import prisma from '@lib/prisma';

const router = Router();

router.post('/google', validate(googleAuthSchema), authController.googleSignIn);
router.post('/demo', authController.demoSignIn);
router.get('/me', authenticate, authController.getCurrentUser);

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
