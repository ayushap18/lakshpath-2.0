import { Router, Request, Response, NextFunction } from 'express';
import { chatService } from '@services/chatService';
import { authenticate } from '@middleware/authenticate';
import { usageLimit } from '@middleware/usageLimit';

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

export default router;
