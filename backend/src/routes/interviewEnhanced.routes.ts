import { Router, Request, Response } from 'express';
import { authenticate } from '@middleware/authenticate';
import { requirePlan } from '@middleware/requirePlan';
import { interviewEnhancedService, QUESTION_CATEGORIES } from '@services/interviewEnhancedService';

const router = Router();

// All enhanced interview routes require Pro subscription
router.use(authenticate, requirePlan('PRO'));

// Get question categories
router.get('/categories', async (req: Request, res: Response) => {
  res.json(QUESTION_CATEGORIES);
});

// Get code review
router.post('/code-review', async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, code, language } = req.body;

    if (!sessionId || !questionId || !code || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const review = await interviewEnhancedService.getCodeReview(
      { sessionId, questionId, code, language },
      req.user!.id
    );

    res.json(review);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get hint
router.post('/hint', async (req: Request, res: Response) => {
  try {
    const { questionId, hintLevel, currentCode } = req.body;

    if (!questionId || !hintLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (![1, 2, 3, 4].includes(hintLevel)) {
      return res.status(400).json({ error: 'Hint level must be 1, 2, 3, or 4' });
    }

    const hint = await interviewEnhancedService.getHint(
      questionId,
      req.user!.id,
      hintLevel,
      currentCode
    );

    res.json(hint);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get follow-up questions
router.post('/follow-up-questions', async (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, code, userAnswer } = req.body;

    if (!sessionId || !questionId || !userAnswer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const questions = await interviewEnhancedService.getFollowUpQuestions(
      { sessionId, questionId, code, userAnswer },
      req.user!.id
    );

    res.json({ questions });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get questions by category
router.get('/questions/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { difficulty = 'MEDIUM', limit = 10 } = req.query;

    const validCategories = Object.keys(QUESTION_CATEGORIES);
    if (!validCategories.includes(category.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (!validDifficulties.includes(difficulty.toString().toUpperCase())) {
      return res.status(400).json({ error: 'Invalid difficulty' });
    }

    const questions = await interviewEnhancedService.getQuestionsByCategory(
      category.toUpperCase() as any,
      difficulty.toString().toUpperCase() as any,
      parseInt(limit as string, 10)
    );

    res.json({ questions });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get performance analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await interviewEnhancedService.getPerformanceAnalytics(
      req.user!.id
    );

    res.json(analytics);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;
