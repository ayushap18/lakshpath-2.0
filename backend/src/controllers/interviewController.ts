import { Request, Response, NextFunction } from 'express';
import { interviewService } from '@services/interviewService';
import { badgeService } from '@services/badgeService';

export const interviewController = {
  /**
   * POST /api/interview/start
   * Start a new interview session
   */
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { type, difficulty, role } = req.body;

      if (!type || !difficulty) {
        return res.status(400).json({ error: 'Type and difficulty are required' });
      }

      const result = await interviewService.startSession(userId, type, difficulty, role);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/interview/answer
   * Submit answer to a question
   */
  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { questionId, answer, timeTaken } = req.body;

      if (!questionId || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required' });
      }

      const result = await interviewService.submitAnswer(
        questionId,
        userId,
        answer,
        timeTaken
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/interview/:sessionId/complete
   * Complete an interview session
   */
  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      const { speechTranscript } = req.body;

      const result = await interviewService.completeSession(
        sessionId,
        userId,
        speechTranscript
      );

      // Check and award badges after interview completion
      const newBadges = await badgeService.checkAndAward(userId);

      res.json({ ...result, newBadges });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/:sessionId
   * Get interview session details
   */
  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      const result = await interviewService.getSession(sessionId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/sessions
   * Get all sessions for a user
   */
  async getUserSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await interviewService.getUserSessions(userId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/stats
   * Get interview statistics
   */
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || 'demo-user';

      const result = await interviewService.getUserStats(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/interview/:sessionId/next
   * Get next question in session
   */
  async getNextQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      const result = await interviewService.getNextQuestion(sessionId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
