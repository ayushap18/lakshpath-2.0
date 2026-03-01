/**
 * Profile Setup & Analysis Routes
 */
import { Router, Request, Response } from 'express';
import { authenticate } from '@middleware/authenticate';
import { validate } from '@middleware/validate';
import { profileSetupSchema } from '@middleware/schemas';
import prisma from '@lib/prisma';
import { runFullAnalysis, getLatestAnalysis, fetchGitHubProfile } from '@services/analysisEngine';
import { badgeService, ALL_BADGES } from '@services/badgeService';

const router = Router();

// ─── GET /profile/full — Get full profile + analysis + badges ────
router.get('/full', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, avatarUrl: true, age: true,
        college: true, degree: true, branch: true, graduationYear: true,
        githubUsername: true, linkedinUrl: true, bio: true, phone: true,
        profileSetupCompleted: true, createdAt: true, role: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const analysis = await getLatestAnalysis(userId);

    res.json({
      user,
      analysis: analysis?.analysis || null,
      badges: analysis?.badges || [],
      parsed: analysis?.parsed || null,
    });
  } catch (err: any) {
    console.error('[ProfileRoutes] full:', err.message);
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

// ─── POST /profile/setup — Complete profile setup ────────
router.post('/setup', authenticate, validate(profileSetupSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name, age, college, degree, branch, graduationYear,
      githubUsername, linkedinUrl, bio, phone,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(age && { age: parseInt(age) }),
        ...(college && { college }),
        ...(degree && { degree }),
        ...(branch && { branch }),
        ...(graduationYear && { graduationYear: parseInt(graduationYear) }),
        ...(githubUsername !== undefined && { githubUsername: githubUsername || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(bio && { bio }),
        ...(phone && { phone }),
        profileSetupCompleted: true,
      },
    });

    // Run full analysis after profile setup
    const result = await runFullAnalysis(userId);

    // Award badges based on activity
    const newBadges = await badgeService.checkAndAward(userId);

    res.json({
      success: true,
      user: {
        id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl,
        college: user.college, degree: user.degree, branch: user.branch,
        graduationYear: user.graduationYear, githubUsername: user.githubUsername,
        linkedinUrl: user.linkedinUrl, profileSetupCompleted: user.profileSetupCompleted,
      },
      analysis: result.analysis,
      badges: result.badges,
      newBadges,
    });
  } catch (err: any) {
    console.error('[ProfileRoutes] setup:', err.message);
    res.status(500).json({ message: 'Profile setup failed' });
  }
});

// ─── POST /profile/analyze — Re-run analysis ─────────────
router.post('/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await runFullAnalysis(userId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[ProfileRoutes] analyze:', err.message);
    res.status(500).json({ message: 'Analysis failed' });
  }
});

// ─── GET /profile/badges — Get user badges ────────────────
router.get('/badges', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const badges = await prisma.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
    res.json({ badges });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to load badges' });
  }
});

// ─── GET /profile/github-preview/:username — Preview GitHub without saving ─
router.get('/github-preview/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const data = await fetchGitHubProfile(username);
    if (!data) return res.status(404).json({ message: 'GitHub user not found' });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ message: 'GitHub fetch failed' });
  }
});

// ─── GET /profile/analysis — Get latest analysis ──────────
router.get('/analysis', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await getLatestAnalysis(userId);
    if (!result) return res.json({ analysis: null, badges: [], parsed: null });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to load analysis' });
  }
});

// ─── GET /profile/badge-catalog — Get all badges with earned status ──
router.get('/badge-catalog', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const earnedBadges = await prisma.badge.findMany({
      where: { userId },
      select: { name: true, earnedAt: true },
    });
    const earnedMap = new Map(earnedBadges.map(b => [b.name, b.earnedAt]));

    const catalog = ALL_BADGES.map(b => ({
      ...b,
      earned: earnedMap.has(b.name),
      earnedAt: earnedMap.get(b.name) || null,
    }));

    res.json({ badges: catalog });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to load badge catalog' });
  }
});

export default router;
