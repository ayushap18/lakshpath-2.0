import { Router, Request, Response, NextFunction } from 'express';
import { chatService } from '@services/chatService';
import { authenticate } from '@middleware/authenticate';
import { usageLimit } from '@middleware/usageLimit';
import prisma from '@lib/prisma';

const router = Router();

// AI Chat — usage limited: 3 messages/day for free users, unlimited for Pro
router.post('/mentor', authenticate, usageLimit('ai_chat', 3, 'day'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reply = await chatService.mentorRound({
      userId: req.body.userId,
      round: (req.body.round as 'career' | 'interview' | 'scholarship') ?? 'career',
      message: req.body.message,
      context: req.body.context,
    });
    res.json({ reply });
  } catch (error) {
    next(error);
  }
});

// GET /chat/history — return last N messages for the authenticated user
router.get('/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Not authenticated' });

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const round = req.query.round as string | undefined;

    const messages = await prisma.chatMessage.findMany({
      where: {
        userId: req.user.id,
        ...(round ? { round } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
        round: true,
        metadata: true,
        createdAt: true,
      },
    });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

export default router;
