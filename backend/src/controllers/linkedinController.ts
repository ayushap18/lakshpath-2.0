import { Request, Response, NextFunction } from 'express';
import { linkedinService } from '@services/linkedinService';

export const linkedinController = {
  async optimizeProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profileData = req.body;
      const result = await linkedinService.optimizeProfile(userId, profileData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getOptimization(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { optimizationId } = req.params;
      const result = await linkedinService.getOptimization(optimizationId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserOptimizations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await linkedinService.getUserOptimizations(userId, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { optimizationId } = req.params;
      const { status } = req.body;

      if (!status || !['DRAFT', 'APPLIED', 'ARCHIVED'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required (DRAFT, APPLIED, ARCHIVED)' });
      }

      const result = await linkedinService.updateStatus(optimizationId, userId, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await linkedinService.getUserStats(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteOptimization(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { optimizationId } = req.params;
      const result = await linkedinService.deleteOptimization(optimizationId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async compareVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { optimizationIds } = req.body;
      if (!optimizationIds || !Array.isArray(optimizationIds)) {
        return res.status(400).json({ error: 'optimizationIds array is required' });
      }

      const result = await linkedinService.compareVersions(userId, optimizationIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
