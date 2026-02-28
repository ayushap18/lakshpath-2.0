import { Router, Request, Response, NextFunction } from 'express';
import { roadmapService } from '@services/roadmapService';
import { authenticate } from '@middleware/authenticate';

const router = Router();

// GET /roadmap/active - get the authenticated user's active roadmap
router.get('/active', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const roadmap = await roadmapService.getActiveRoadmap(userId);
    res.json(roadmap);
  } catch (error) {
    next(error);
  }
});

// POST /roadmap/generate - generate a new roadmap from a career match
router.post('/generate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { careerId } = req.body;
    if (!careerId) return res.status(400).json({ error: 'careerId is required' });
    const roadmap = await roadmapService.generateRoadmap(userId, careerId);
    res.json(roadmap);
  } catch (error) {
    next(error);
  }
});

// PATCH /roadmap/milestone/:milestoneId - toggle milestone completion
router.patch('/milestone/:milestoneId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Frontend sends { completed: boolean }, convert to status string
    const { completed, status } = req.body;
    let resolvedStatus: string;
    if (status) {
      resolvedStatus = status;
    } else if (typeof completed === 'boolean') {
      resolvedStatus = completed ? 'COMPLETED' : 'PENDING';
    } else {
      resolvedStatus = 'IN_PROGRESS';
    }
    const result = await roadmapService.updateMilestoneStatus(
      req.params.milestoneId,
      resolvedStatus
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
