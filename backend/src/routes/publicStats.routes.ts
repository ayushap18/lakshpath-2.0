/**
 * Public stats endpoint — no auth required.
 * Returns aggregate numbers for the landing page.
 * Results are cached in memory for 5 minutes to avoid DB hammering.
 */
import { Router, Request, Response } from 'express';
import prisma from '@lib/prisma';

const router = Router();

interface StatsCache {
  data: Record<string, number>;
  fetchedAt: number;
}

let cache: StatsCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

router.get('/', async (_req: Request, res: Response) => {
  try {
    const now = Date.now();

    if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    const [userCount, sessionCount, roadmapCount] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'DEMO' } } }),
      prisma.interviewSession.count(),
      prisma.learningRoadmap.count(),
    ]);

    const data = {
      students: userCount,
      interviewSessions: sessionCount,
      roadmapsCreated: roadmapCount,
    };

    cache = { data, fetchedAt: now };
    res.json(data);
  } catch {
    // Return cached data if available, otherwise hardcoded fallback
    if (cache) return res.json(cache.data);
    res.json({ students: 50000, interviewSessions: 12000, roadmapsCreated: 8000 });
  }
});

export default router;
