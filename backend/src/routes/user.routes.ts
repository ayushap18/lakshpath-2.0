import { Router, Request, Response, NextFunction } from 'express';

import { authenticate } from '@middleware/authenticate';
import { validate } from '@middleware/validate';
import { settingsUpdateSchema } from '@middleware/schemas';
import { userService } from '@services/userService';
import prisma from '@lib/prisma';

const router = Router();

router.use(authenticate);

router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const payload = await userService.getProfile(userId ?? '');
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id ?? '';
    const payload = await userService.updateProfile(userId, {
      name: req.body?.name,
      avatarUrl: req.body?.avatarUrl,
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id ?? '';
    const payload = await userService.getProgress(userId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

// ─── GET /user/streak — Get login streak + XP ───────────────
router.get('/streak', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get login logs ordered by date
    const logs = await prisma.loginLog.findMany({
      where: { userId, success: true },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Calculate streak from login dates
    let streak = 0;
    if (logs.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // FIX HIGH-7: Zero-pad months and days for correct lexicographic sort
      const uniqueDays = new Set<string>();
      logs.forEach(log => {
        const d = new Date(log.createdAt);
        uniqueDays.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      });

      const sortedDays = Array.from(uniqueDays).sort().reverse();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      // Streak starts from today or yesterday
      if (sortedDays[0] === todayStr || sortedDays[0] === yesterdayStr) {
        streak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const curr = new Date(sortedDays[i - 1].replace(/-/g, '/'));
          const prev = new Date(sortedDays[i].replace(/-/g, '/'));
          const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate XP from various activities
    const [assessments, interviews, portfolios, milestones, badges, logins] = await Promise.all([
      prisma.quizResult.count({ where: { userId } }),
      prisma.interviewSession.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.portfolioAnalysis.count({ where: { userId } }),
      prisma.roadmapMilestone.count({ where: { roadmap: { userId }, status: 'COMPLETED' } }),
      prisma.badge.count({ where: { userId } }),
      prisma.loginLog.count({ where: { userId, success: true } }),
    ]);

    const xp = (assessments * 50) + (interviews * 30) + (portfolios * 40) + (milestones * 25) + (badges * 20) + Math.min(logins, 30) * 5 + (streak * 10);

    // Level calculation: 0-99 = L1, 100-299 = L2, 300-599 = L3, 600-999 = L4, 1000+ = L5
    const levels = [
      { min: 0, max: 99, level: 1, label: 'Beginner' },
      { min: 100, max: 299, level: 2, label: 'Explorer' },
      { min: 300, max: 599, level: 3, label: 'Builder' },
      { min: 600, max: 999, level: 4, label: 'Achiever' },
      { min: 1000, max: Infinity, level: 5, label: 'Master' },
    ];
    const currentLevel = levels.find(l => xp >= l.min && xp <= l.max) || levels[0];
    const xpForNextLevel = currentLevel.max === Infinity ? xp : currentLevel.max + 1;
    const xpInLevel = xp - currentLevel.min;
    const xpNeeded = currentLevel.max === Infinity ? 1 : (currentLevel.max - currentLevel.min + 1);

    res.json({
      streak,
      xp,
      level: currentLevel.level,
      levelLabel: currentLevel.label,
      xpForNextLevel,
      xpInLevel,
      xpNeeded,
      xpProgress: Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)),
      breakdown: { assessments, interviews, portfolios, milestones, badges, logins: Math.min(logins, 30) },
    });
  } catch (err: any) {
    console.error('[UserRoutes] streak:', err.message);
    res.status(500).json({ message: 'Failed to get streak data' });
  }
});

// ─── GET /user/notifications — Get user notifications ───────
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Build notifications from real activity
    const notifications: Array<{ id: string; type: string; title: string; message: string; time: string; read: boolean; icon: string; color: string }> = [];

    const [latestBadge, latestInterview, latestPortfolio, user] = await Promise.all([
      prisma.badge.findFirst({ where: { userId }, orderBy: { earnedAt: 'desc' } }),
      prisma.interviewSession.findFirst({ where: { userId, status: 'COMPLETED' }, orderBy: { completedAt: 'desc' } }),
      prisma.portfolioAnalysis.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.user.findUnique({ where: { id: userId }, select: { githubUsername: true, linkedinUrl: true, profileSetupCompleted: true } }),
    ]);

    if (latestBadge) {
      notifications.push({
        id: latestBadge.id,
        type: 'badge',
        title: 'New Badge Earned!',
        message: `You earned the "${latestBadge.name}" badge.`,
        time: latestBadge.earnedAt.toISOString(),
        read: false,
        icon: 'emoji_events',
        color: '#F59E0B',
      });
    }

    if (latestInterview && latestInterview.overallScore) {
      notifications.push({
        id: latestInterview.id,
        type: 'interview',
        title: 'Interview Completed',
        message: `You scored ${Math.round(latestInterview.overallScore)}% in your ${latestInterview.type.toLowerCase()} interview.`,
        time: (latestInterview.completedAt || latestInterview.createdAt).toISOString(),
        read: false,
        icon: 'record_voice_over',
        color: '#8B5CF6',
      });
    }

    if (latestPortfolio) {
      notifications.push({
        id: latestPortfolio.id,
        type: 'portfolio',
        title: 'Portfolio Analyzed',
        message: `GitHub analysis complete. Overall score: ${Math.round(latestPortfolio.overallScore)}%`,
        time: latestPortfolio.createdAt.toISOString(),
        read: false,
        icon: 'code',
        color: '#10B981',
      });
    }

    if (!user?.githubUsername) {
      notifications.push({
        id: 'connect-github',
        type: 'action',
        title: 'Connect GitHub',
        message: 'Link your GitHub account to get AI-powered portfolio analysis.',
        time: new Date().toISOString(),
        read: false,
        icon: 'link',
        color: '#0da2e7',
      });
    }

    if (!user?.linkedinUrl) {
      notifications.push({
        id: 'connect-linkedin',
        title: 'Connect LinkedIn',
        type: 'action',
        message: 'Add your LinkedIn profile for career insights and optimization.',
        time: new Date().toISOString(),
        read: false,
        icon: 'person_add',
        color: '#0A66C2',
      });
    }

    if (!user?.profileSetupCompleted) {
      notifications.push({
        id: 'complete-profile',
        type: 'action',
        title: 'Complete Your Profile',
        message: 'Finish setting up your profile to unlock all features.',
        time: new Date().toISOString(),
        read: false,
        icon: 'account_circle',
        color: '#EF4444',
      });
    }

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({ notifications });
  } catch (err: any) {
    console.error('[UserRoutes] notifications:', err.message);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

// ─── PATCH /user/settings — Update profile settings (github, linkedin, etc.) ─
router.patch('/settings', validate(settingsUpdateSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { githubUsername, linkedinUrl, bio, phone, college, degree, branch, graduationYear, name } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (githubUsername !== undefined) data.githubUsername = githubUsername || null;
    if (linkedinUrl !== undefined) data.linkedinUrl = linkedinUrl || null;
    if (bio !== undefined) data.bio = bio || null;
    if (phone !== undefined) data.phone = phone || null;
    if (college !== undefined) data.college = college || null;
    if (degree !== undefined) data.degree = degree || null;
    if (branch !== undefined) data.branch = branch || null;
    if (graduationYear !== undefined) data.graduationYear = graduationYear ? parseInt(graduationYear) : null;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, name: true, email: true, avatarUrl: true, age: true,
        college: true, degree: true, branch: true, graduationYear: true,
        githubUsername: true, linkedinUrl: true, bio: true, phone: true,
        profileSetupCompleted: true, createdAt: true, role: true,
      },
    });

    res.json({ success: true, user });
  } catch (err: any) {
    console.error('[UserRoutes] settings:', err.message);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// ─── GET /user/settings — Get user settings ─────────────────
router.get('/settings', async (req: Request, res: Response) => {
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
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to get settings' });
  }
});

export default router;
