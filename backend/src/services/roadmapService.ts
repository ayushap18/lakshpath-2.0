import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';
import { safeParse, safeStringify } from '@utils/json';
import { geminiService } from './geminiService';
import { DOMAIN_THEMES, DomainKey } from '@lib/domainThemes';
import { notificationService } from './notificationService';

const DEFAULT_DOMAIN: DomainKey = 'Technology & Software';

const parseDurationWeeks = (duration?: string | null) => {
  if (!duration) return 4;
  const value = Number(duration.match(/\d+/)?.[0] ?? 4);
  if (duration.toLowerCase().includes('month')) {
    return value * 4;
  }
  return value;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatGoalContract = (contract: {
  id: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  successCriteria: string;
  startDate: Date;
  endDate: Date;
  status: string;
  nudges: string | null;
}) => ({
  id: contract.id,
  milestoneId: contract.milestoneId,
  title: contract.title,
  description: contract.description,
  successCriteria: contract.successCriteria,
  startDate: contract.startDate,
  endDate: contract.endDate,
  status: contract.status,
  nudges: safeParse<string[]>(contract.nudges, []),
});

const resolveDomainTheme = (summary: Record<string, unknown>) => {
  const domainFocus = (summary?.fieldInterest as string) || DEFAULT_DOMAIN;
  const theme = DOMAIN_THEMES[domainFocus as DomainKey] || DOMAIN_THEMES.default;
  return { domainFocus, theme };
};

const ensureGoalForNextMilestone = async (
  completedMilestone: any,
  summary: Record<string, unknown>,
  strengths: string[] = [],
  weaknesses: string[] = []
) => {
  const nextMilestone = await prisma.roadmapMilestone.findFirst({
    where: {
      roadmapId: completedMilestone.roadmapId,
      position: { gt: completedMilestone.position },
    },
    orderBy: { position: 'asc' },
  });

  if (!nextMilestone) return null;

  const existing = await prisma.goalContract.findUnique({ where: { milestoneId: nextMilestone.id } });
  if (existing) {
    return existing;
  }

  const { domainFocus, theme } = resolveDomainTheme(summary);

  let aiGoal: Awaited<ReturnType<typeof geminiService.goalSuccessCriteria>> | null = null;
  const profile = {
    name: completedMilestone.roadmap.user.name ?? undefined,
    education: (summary?.educationLevel as string) ?? undefined,
    strengths,
    weaknesses,
    preferredWorkStyle: (summary?.workStyle as string) ?? undefined,
    motivation: (summary?.motivation as string) ?? undefined,
    targetSalary: (summary?.salaryExpectation as string) ?? undefined,
  };

  try {
    aiGoal = await geminiService.goalSuccessCriteria({
      milestoneTitle: nextMilestone.title,
      durationWeeks: parseDurationWeeks(nextMilestone.duration),
      profile,
    });
  } catch (error) {
    console.error('Goal automation failed, falling back to defaults', error);
  }

  const nudgePool = new Set<string>();
  (aiGoal?.parsed.weeklyNudges ?? []).forEach((nudge) => nudge && nudgePool.add(nudge));
  if (theme.aiHook) nudgePool.add(theme.aiHook);
  theme.nudges.forEach((nudge) => nudge && nudgePool.add(nudge));

  const nudgeList = Array.from(nudgePool).slice(0, 5);
  const successCriteria = aiGoal?.parsed.successCriteria ?? `Complete ${nextMilestone.title} with measurable outputs.`;

  const goalContract = await prisma.goalContract.create({
    data: {
      userId: completedMilestone.roadmap.userId,
      milestoneId: nextMilestone.id,
      title: nextMilestone.title,
      description: nextMilestone.description,
      startDate: new Date(),
      endDate: addDays(new Date(), parseDurationWeeks(nextMilestone.duration) * 7),
      successCriteria,
      nudges: safeStringify(nudgeList),
      status: 'ACTIVE',
    },
  });

  if (aiGoal) {
    await prisma.insight.create({
      data: {
        userId: completedMilestone.roadmap.userId,
        source: 'GEMINI',
        prompt: aiGoal.prompt,
        response: aiGoal.raw,
        summary: `SMART goal created for ${nextMilestone.title}`,
        type: 'GOAL_CONTRACT',
        metadata: safeStringify({
          nudges: nudgeList,
          domainFocus,
          mission: theme.mission,
        }),
      },
    });
  }

  await notificationService.sendGoalContractNotification({
    user: {
      id: completedMilestone.roadmap.user.id,
      name: completedMilestone.roadmap.user.name,
      email: completedMilestone.roadmap.user.email,
    },
    goal: {
      title: goalContract.title,
      successCriteria: goalContract.successCriteria,
      nudges: nudgeList,
      startDate: goalContract.startDate,
      endDate: goalContract.endDate,
    },
    tone: theme.tone,
  });

  return goalContract;
};

/* ─── Group flat milestones into phases ─── */
const groupMilestonesIntoPhases = (milestones: any[]) => {
  const sorted = [...milestones].sort((a, b) => a.position - b.position);
  const MILESTONES_PER_PHASE = 3;
  const phases: any[] = [];

  for (let i = 0; i < sorted.length; i += MILESTONES_PER_PHASE) {
    const chunk = sorted.slice(i, i + MILESTONES_PER_PHASE);
    const phaseIndex = Math.floor(i / MILESTONES_PER_PHASE);
    const phaseNames = ['Foundation', 'Core Skills', 'Advanced', 'Mastery', 'Specialization', 'Expert'];
    const phaseDurations = ['2-3 weeks', '3-4 weeks', '3-4 weeks', '4-5 weeks', '4-6 weeks', '4-6 weeks'];

    phases.push({
      id: `phase-${phaseIndex}`,
      name: phaseNames[phaseIndex] || `Phase ${phaseIndex + 1}`,
      title: phaseNames[phaseIndex] || `Phase ${phaseIndex + 1}`,
      duration: phaseDurations[phaseIndex] || '3-4 weeks',
      milestones: chunk.map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        duration: m.duration,
        status: m.status?.toLowerCase(),
        completed: m.status === 'COMPLETED',
        resources: safeParse(m.resources, []),
        position: m.position,
      })),
    });
  }

  return phases;
};

/* ─── Demo roadmap data for when no quiz/career match exists ─── */
const DEMO_ROADMAP_MILESTONES = [
  // Phase 1: Foundation
  { title: 'HTML & CSS Fundamentals', description: 'Master semantic HTML5, CSS3 flexbox, grid, and responsive design principles', duration: '1 week', resources: JSON.stringify([{ title: 'MDN Web Docs', url: 'https://developer.mozilla.org', platform: 'MDN' }, { title: 'CSS Tricks Flexbox Guide', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', platform: 'CSS-Tricks' }]) },
  { title: 'JavaScript Core Concepts', description: 'Learn variables, functions, closures, promises, async/await, and ES6+ features', duration: '2 weeks', resources: JSON.stringify([{ title: 'JavaScript.info', url: 'https://javascript.info', platform: 'javascript.info' }, { title: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net', platform: 'Book' }]) },
  { title: 'Git & Version Control', description: 'Master branching, merging, rebasing, and collaborative workflows with GitHub', duration: '1 week', resources: JSON.stringify([{ title: 'Git Documentation', url: 'https://git-scm.com/doc', platform: 'Git' }, { title: 'GitHub Skills', url: 'https://skills.github.com', platform: 'GitHub' }]) },
  // Phase 2: Core Skills
  { title: 'React.js Framework', description: 'Build component-based UIs with hooks, state management, routing, and context API', duration: '2 weeks', resources: JSON.stringify([{ title: 'React Docs', url: 'https://react.dev', platform: 'React' }, { title: 'React Tutorial', url: 'https://react.dev/learn', platform: 'React' }]) },
  { title: 'Node.js & Express Backend', description: 'Create REST APIs with Express, middleware patterns, authentication, and database integration', duration: '2 weeks', resources: JSON.stringify([{ title: 'Node.js Docs', url: 'https://nodejs.org/en/docs', platform: 'Node.js' }, { title: 'Express Guide', url: 'https://expressjs.com/en/guide/routing.html', platform: 'Express' }]) },
  { title: 'Database Design & SQL', description: 'Learn relational databases, SQL queries, Prisma ORM, and database design patterns', duration: '1 week', resources: JSON.stringify([{ title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', platform: 'W3Schools' }, { title: 'Prisma Docs', url: 'https://www.prisma.io/docs', platform: 'Prisma' }]) },
  // Phase 3: Advanced
  { title: 'TypeScript', description: 'Add type safety to your projects with interfaces, generics, utility types, and strict mode', duration: '1 week', resources: JSON.stringify([{ title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/', platform: 'TypeScript' }, { title: 'Type Challenges', url: 'https://github.com/type-challenges/type-challenges', platform: 'GitHub' }]) },
  { title: 'Testing & CI/CD', description: 'Write unit tests, integration tests with Jest/Vitest, and set up GitHub Actions CI/CD pipelines', duration: '1 week', resources: JSON.stringify([{ title: 'Vitest Docs', url: 'https://vitest.dev', platform: 'Vitest' }, { title: 'GitHub Actions', url: 'https://docs.github.com/en/actions', platform: 'GitHub' }]) },
  { title: 'Deployment & DevOps Basics', description: 'Deploy apps on Vercel/Railway, understand Docker basics, environment management, and monitoring', duration: '1 week', resources: JSON.stringify([{ title: 'Vercel Docs', url: 'https://vercel.com/docs', platform: 'Vercel' }, { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', platform: 'Docker' }]) },
  // Phase 4: Portfolio & Interview Prep
  { title: 'Build Portfolio Projects', description: 'Create 2-3 full-stack projects demonstrating your skills: a CRUD app, an API-driven project, and a real-time app', duration: '3 weeks', resources: JSON.stringify([{ title: 'Project Ideas', url: 'https://github.com/florinpop17/app-ideas', platform: 'GitHub' }]) },
  { title: 'Data Structures & Algorithms', description: 'Practice arrays, linked lists, trees, graphs, and common algorithm patterns for technical interviews', duration: '2 weeks', resources: JSON.stringify([{ title: 'NeetCode', url: 'https://neetcode.io', platform: 'NeetCode' }, { title: 'LeetCode', url: 'https://leetcode.com', platform: 'LeetCode' }]) },
  { title: 'Interview Preparation', description: 'Practice system design, behavioral questions, resume optimization, and mock interviews', duration: '2 weeks', resources: JSON.stringify([{ title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org', platform: 'Handbook' }]) },
];

export const roadmapService = {
  async getActiveRoadmap(userId: string) {
    if (!userId) throw new AppError('userId is required', 400);

    const roadmap = await prisma.learningRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { milestones: true },
    });

    if (!roadmap) {
      throw new AppError('No roadmap found', 404);
    }

    const milestones = roadmap.milestones.sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    );
    const phases = groupMilestonesIntoPhases(milestones);
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m: any) => m.status === 'COMPLETED').length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      id: roadmap.id,
      title: roadmap.title,
      careerTitle: roadmap.title,
      duration: roadmap.duration,
      summary: roadmap.summary,
      progress,
      totalMilestones,
      completedMilestones,
      phases,
      ai_plan: safeParse(roadmap.aiPlan, null),
    };
  },

  async generateRoadmap(userId: string, careerId: string) {
    if (!userId) throw new AppError('userId is required', 400);
    if (!careerId) throw new AppError('careerId is required', 400);

    // Check if user already has a roadmap
    const existingAny = await prisma.learningRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { milestones: true },
    });
    if (existingAny) {
      const phases = groupMilestonesIntoPhases(existingAny.milestones);
      const total = existingAny.milestones.length;
      const completed = existingAny.milestones.filter((m: any) => m.status === 'COMPLETED').length;
      return {
        id: existingAny.id,
        title: existingAny.title,
        careerTitle: existingAny.title,
        duration: existingAny.duration,
        summary: existingAny.summary,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        totalMilestones: total,
        completedMilestones: completed,
        phases,
        ai_plan: safeParse(existingAny.aiPlan, null),
      };
    }

    // Look up the career match to get title and context (skip for 'demo')
    let careerTitle = 'Full-Stack Developer';
    let quizResultId: string | null = null;
    let keySkills: string[] = [];

    if (careerId !== 'demo') {
      const careerMatch = await prisma.careerMatch.findUnique({
        where: { id: careerId },
        include: { quizResult: true },
      });

      if (careerMatch) {
        careerTitle = careerMatch.title;
        quizResultId = careerMatch.quizResultId;
        keySkills = safeParse<string[]>(careerMatch.keySkills, []);
        if (!Array.isArray(keySkills) && typeof careerMatch.keySkills === 'string') {
          keySkills = careerMatch.keySkills.split(',').map((s: string) => s.trim());
        }
      }
    }

    // Check for existing roadmap for this quiz result
    if (quizResultId) {
      const existing = await prisma.learningRoadmap.findFirst({
        where: { quizResultId },
        include: { milestones: true },
      });
      if (existing) {
        const phases = groupMilestonesIntoPhases(existing.milestones);
        const total = existing.milestones.length;
        const completed = existing.milestones.filter((m: any) => m.status === 'COMPLETED').length;
        return {
          id: existing.id,
          title: existing.title,
          careerTitle: existing.title,
          duration: existing.duration,
          summary: existing.summary,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
          totalMilestones: total,
          completedMilestones: completed,
          phases,
          ai_plan: safeParse(existing.aiPlan, null),
        };
      }
    }

    // Try AI generation, fallback to demo milestones
    let milestoneData = DEMO_ROADMAP_MILESTONES;
    let aiPlan: string | null = null;
    let summary = `Personalized learning roadmap for ${careerTitle}. This step-by-step plan covers fundamentals through advanced topics, with curated resources for each milestone.`;
    let duration = '3-6 months';

    try {
      const aiResult = await geminiService.generateRoadmap({
        careerTitle,
        seniority: 'beginner',
        durationMonths: 6,
        profile: {
          strengths: keySkills,
        },
      });

      // The AI result comes as months, convert to milestones
      if (aiResult.parsed?.months?.length > 0) {
        milestoneData = aiResult.parsed.months.map((month: any) => ({
          title: month.theme || `Month ${month.month}`,
          description: (month.skills || []).join(', ') + (month.project ? `. Project: ${month.project}` : ''),
          duration: '4 weeks',
          resources: JSON.stringify((month.resources || []).map((r: string) => ({ title: r, url: '#', platform: 'Resource' }))),
        }));
        summary = aiResult.parsed.headline || summary;
        aiPlan = aiResult.raw;
      }
    } catch (err) {
      console.log('AI roadmap generation failed, using demo milestones:', (err as Error).message);
    }

    // Create roadmap in DB
    const roadmap = await prisma.learningRoadmap.create({
      data: {
        userId,
        quizResultId: quizResultId || undefined,
        title: careerTitle,
        duration,
        summary,
        source: aiPlan ? 'gemini' : 'demo',
        aiPlan,
        milestones: {
          create: milestoneData.map((m: any, i: number) => ({
            title: m.title,
            description: m.description,
            duration: m.duration || '1 week',
            status: 'PENDING',
            resources: typeof m.resources === 'string' ? m.resources : JSON.stringify(m.resources || []),
            position: i,
          })),
        },
      },
      include: { milestones: true },
    });

    const phases = groupMilestonesIntoPhases(roadmap.milestones);

    return {
      id: roadmap.id,
      title: roadmap.title,
      careerTitle: roadmap.title,
      duration: roadmap.duration,
      summary: roadmap.summary,
      progress: 0,
      totalMilestones: roadmap.milestones.length,
      completedMilestones: 0,
      phases,
      ai_plan: safeParse(roadmap.aiPlan, null),
    };
  },

  async updateMilestoneStatus(milestoneId: string, status: string) {
    if (!milestoneId) throw new AppError('milestoneId is required', 400);

    const milestone = await prisma.roadmapMilestone.update({
      where: { id: milestoneId },
      data: { status },
      include: {
        roadmap: {
          include: {
            user: true,
            quizResult: true,
          },
        },
      },
    });

    const summary = safeParse<Record<string, unknown>>(milestone.roadmap.quizResult?.summary, {});
    const strengths = safeParse<string[]>(milestone.roadmap.quizResult?.strengths, []);
    const weaknesses = safeParse<string[]>(milestone.roadmap.quizResult?.weaknesses, []);

    let nextGoalContract = null;
    if (status === 'COMPLETED') {
      nextGoalContract = await ensureGoalForNextMilestone(milestone, summary, strengths, weaknesses);
    }

    return {
      milestone: {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        duration: milestone.duration,
        status: milestone.status,
        position: milestone.position,
        updatedAt: milestone.updatedAt,
      },
      goalContract: nextGoalContract ? formatGoalContract(nextGoalContract) : null,
    };
  },
};
