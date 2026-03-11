import { z } from 'zod';
import prisma from '@lib/prisma';
import {
  generateCareerMatches,
  buildRoadmapFromCareer,
  QuizAnswers,
} from '@lib/careerEngine';
import { geminiService } from './geminiService';
import { mlRankCareers } from './mlService';
import { AppError } from '@middleware/errorHandler';
import { CareerExplanationResponse, RoadmapResponse, GoalSuccessCriteriaResponse } from '@shared-types/ai';
import { safeStringify, safeParse } from '@utils/json';
import type { Prisma } from '@prisma/client';

const submitSchema = z.object({
  user: z
    .object({
      id: z.string().optional(),
      email: z.string().email().optional(),
      name: z.string().optional(),
    })
    .optional(),
  answers: z.record(z.any()),
  profile: z
    .object({
      name: z.string().optional(),
      education: z.string().optional(),
      interests: z.array(z.string()).optional(),
    })
    .optional(),
  demo: z.boolean().optional(),
});

type SubmitInput = z.infer<typeof submitSchema>;

type QuizResultRecord = { id: string };
type CareerMatchRecord = {
  id: string;
  title: string;
  matchScore: number;
  description: string;
  avgSalary: string | null;
  growthRate: string | null;
  keySkills: string;
};
type RoadmapMilestoneRecord = {
  id: string;
  title: string;
  description: string;
  duration: string | null;
  status: string;
  resources: string | null;
  position: number;
};
type RoadmapRecord = {
  id: string;
  title: string;
  duration: string | null;
  summary: string | null;
  aiPlan: string | null;
  milestones: RoadmapMilestoneRecord[];
};
type GoalContractRecord = {
  id: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  successCriteria: string;
  nudges: string | null;
  status: string;
};

type AssessmentTransactionResult = {
  quizResult: QuizResultRecord;
  careerMatches: CareerMatchRecord[];
  roadmap: RoadmapRecord;
  goalContract: GoalContractRecord | null;
};

const stringify = safeStringify;

const buildProfileSummary = (parsed: ReturnType<typeof generateCareerMatches>['parsed'], overrides?: SubmitInput['profile']) => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (parsed.technicalSkill >= 4) strengths.push('Technical problem solving');
  else weaknesses.push('Deep technical foundations');
  if (parsed.communicationSkill >= 4) strengths.push('Communication & storytelling');
  else weaknesses.push('Narrative confidence');
  if (parsed.analyticalSkill >= 4) strengths.push('Analytical reasoning');
  else weaknesses.push('Structured analysis');
  if (parsed.creativitySkill >= 4) strengths.push('Creative experimentation');
  else weaknesses.push('Divergent thinking');

  const domainRanking = Object.entries(parsed.domainInterestScores ?? {})
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

  return {
    name: overrides?.name,
    education: overrides?.education ?? parsed.educationLevel,
    interests: overrides?.interests ?? [parsed.fieldInterest],
    strengths,
    weaknesses,
    preferredWorkStyle: parsed.workStyle,
    motivation: parsed.motivation,
    targetSalary: parsed.salaryExpectation,
    domainFocus: domainRanking[0]?.[0],
    domainInterests: parsed.domainInterestScores,
    skillRatings: {
      technical: parsed.technicalSkill,
      communication: parsed.communicationSkill,
      analytical: parsed.analyticalSkill,
      creativity: parsed.creativitySkill,
    },
  };
};

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

const ensureUser = async (payload?: SubmitInput['user'], demo?: boolean) => {
  if (payload?.id) {
    const existing = await prisma.user.findUnique({ where: { id: payload.id } });
    if (existing) return existing;
  }

  if (payload?.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: payload.email } });
    if (byEmail) return byEmail;
  }

  const name = payload?.name ?? (demo ? 'Demo Learner' : 'Student');
  return prisma.user.create({
    data: {
      name,
      email: payload?.email,
      role: demo ? 'DEMO' : 'USER',
    },
  });
};

export const assessmentService = {
  async submitAssessment(input: SubmitInput) {
    const payload = submitSchema.parse(input);
    const user = await ensureUser(payload.user, payload.demo);

    // Try ML service first; fall back to local careerEngine
    const mlResult = await mlRankCareers(payload.answers);
    const { parsed, topCareers } = generateCareerMatches(payload.answers as QuizAnswers);
    if (mlResult?.topCareers?.length) {
      // Merge ML scores into topCareers list when both agree on a title
      const mlScoreMap = new Map(mlResult.topCareers.map(m => [m.title.toLowerCase(), m.matchScore]));
      for (const career of topCareers) {
        const mlScore = mlScoreMap.get(career.title.toLowerCase());
        if (mlScore !== undefined) {
          // Blend: 60% ML, 40% rule-based
          career.matchScore = Math.round(mlScore * 0.6 + career.matchScore * 0.4);
        }
      }
      topCareers.sort((a, b) => b.matchScore - a.matchScore);
    }
    if (!topCareers.length) {
      throw new AppError('Unable to compute career matches', 400);
    }

    const avgSkillScore = (
      parsed.technicalSkill +
      parsed.communicationSkill +
      parsed.analyticalSkill +
      parsed.creativitySkill
    ) / 4;

    const summary = {
      educationLevel: parsed.educationLevel,
      fieldInterest: parsed.fieldInterest,
      motivation: parsed.motivation,
      workEnvironment: parsed.workEnvironment,
      workStyle: parsed.workStyle,
      salaryExpectation: parsed.salaryExpectation,
      avgSkillScore: avgSkillScore.toFixed(1),
      skillRatings: {
        technical: parsed.technicalSkill,
        communication: parsed.communicationSkill,
        analytical: parsed.analyticalSkill,
        creativity: parsed.creativitySkill,
      },
      domainInterests: parsed.domainInterestScores,
    };

    const profileSummary = buildProfileSummary(parsed, payload.profile);

    let explanationAi: { prompt: string; raw: string; parsed: CareerExplanationResponse } | null = null;
    let aiRoadmap: { prompt: string; raw: string; parsed: RoadmapResponse } | null = null;
    let goalAi: { prompt: string; raw: string; parsed: GoalSuccessCriteriaResponse } | null = null;

    try {
      explanationAi = await geminiService.explainCareers({
        profile: profileSummary,
        quizInsights: summary,
        topCareers: topCareers.map((career) => ({
          title: career.title,
          matchScore: career.matchScore,
          description: career.description,
          keySkills: career.keySkills,
        })),
      });
    } catch (error) {
      console.error('Gemini career explanation failed', error);
    }

    try {
      aiRoadmap = await geminiService.generateRoadmap({
        careerTitle: topCareers[0].title,
        seniority: avgSkillScore >= 4 ? 'intermediate' : 'beginner',
        durationMonths: 6,
        profile: profileSummary,
      });
    } catch (error) {
      console.error('Gemini roadmap failed', error);
    }

    const roadmapDraft = aiRoadmap
      ? aiRoadmap.parsed.months.map((month) => ({
          title: `Month ${month.month}: ${month.theme}`,
          description: `Focus on ${month.skills.join(', ')}`,
          duration: '4 weeks',
          status: month.month === 1 ? 'IN_PROGRESS' : 'PENDING',
          resources: month.resources.map((resource) => ({ title: resource, platform: 'Curated', link: '#' })),
        }))
      : buildRoadmapFromCareer(topCareers[0]).milestones;

    const primaryMilestone = roadmapDraft[0];

    if (primaryMilestone) {
      try {
        goalAi = await geminiService.goalSuccessCriteria({
          milestoneTitle: primaryMilestone.title,
          durationWeeks: parseDurationWeeks(primaryMilestone.duration),
          profile: profileSummary,
        });
      } catch (error) {
        console.error('Gemini goal criteria failed', error);
      }
    }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient): Promise<AssessmentTransactionResult> => {

      const quizResult = await tx.quizResult.create({
        data: {
          userId: user.id,
          answers: stringify(payload.answers),
          summary: stringify(summary),
          strengths: stringify(profileSummary.strengths),
          weaknesses: stringify(profileSummary.weaknesses),
          advice: stringify({ motivation: parsed.motivation }),
        },
        select: { id: true },
      });

      const careerMatches = await Promise.all(
        topCareers.map((career) =>
          tx.careerMatch.create({
            data: {
              quizResultId: quizResult.id,
              title: career.title,
              matchScore: career.matchScore,
              description: career.description,
              avgSalary: career.avgSalary,
              growthRate: career.growthRate,
              keySkills: stringify(career.keySkills),
            },
            select: {
              id: true,
              title: true,
              matchScore: true,
              description: true,
              avgSalary: true,
              growthRate: true,
              keySkills: true,
            },
          })
        )
      );

      const roadmap = await tx.learningRoadmap.create({
        data: {
          quizResultId: quizResult.id,
          userId: user.id,
          title: `${topCareers[0].title} Launch Plan`,
          duration: '6 months',
          summary: aiRoadmap?.parsed.headline ?? 'Personalized learning path',
          aiPlan: aiRoadmap ? stringify(aiRoadmap.parsed) : undefined,
          milestones: {
            create: roadmapDraft.map((milestone, index) => ({
              title: milestone.title,
              description: milestone.description,
              duration: milestone.duration,
              status: milestone.status ?? 'PENDING',
              resources: stringify(milestone.resources ?? []),
              position: index,
            })),
          },
        },
        select: {
          id: true,
          title: true,
          duration: true,
          summary: true,
          aiPlan: true,
          milestones: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              status: true,
              resources: true,
              position: true,
            },
          },
        },
      });

      if (explanationAi) {
        await tx.insight.create({
          data: {
            userId: user.id,
            source: 'GEMINI',
            prompt: explanationAi.prompt,
            response: explanationAi.raw,
            summary: 'AI explanation of career matches',
            type: 'CAREER_EXPLANATION',
            metadata: stringify(explanationAi.parsed),
          },
        });
      }

      if (aiRoadmap) {
        await tx.insight.create({
          data: {
            userId: user.id,
            source: 'GEMINI',
            prompt: aiRoadmap.prompt,
            response: aiRoadmap.raw,
            summary: 'AI generated roadmap plan',
            type: 'ROADMAP',
            metadata: stringify(aiRoadmap.parsed),
          },
        });
      }

      let goalContract: GoalContractRecord | null = null;
      if (goalAi && roadmap.milestones.length) {
        const firstMilestone = roadmap.milestones[0];
        goalContract = await tx.goalContract.create({
          data: {
            userId: user.id,
            milestoneId: firstMilestone.id,
            title: firstMilestone.title,
            description: firstMilestone.description,
            startDate: new Date(),
            endDate: addDays(new Date(), parseDurationWeeks(firstMilestone.duration) * 7),
            successCriteria: goalAi.parsed.successCriteria,
            nudges: stringify(goalAi.parsed.weeklyNudges),
            status: 'ACTIVE',
          },
          select: {
            id: true,
            milestoneId: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            successCriteria: true,
            nudges: true,
            status: true,
          },
        });

        await tx.insight.create({
          data: {
            userId: user.id,
            source: 'GEMINI',
            prompt: goalAi.prompt,
            response: goalAi.raw,
            summary: `SMART goal created for ${firstMilestone.title}`,
            type: 'TIP',
            metadata: stringify(goalAi.parsed),
          },
        });
      }

      return { quizResult, careerMatches, roadmap, goalContract };
    }, { timeout: 15000 });

  const normalizedMatches = result.careerMatches.map((cm: CareerMatchRecord) => ({
      id: cm.id,
      title: cm.title,
      match_score: cm.matchScore,
      description: cm.description,
      avg_salary: cm.avgSalary,
      growth_rate: cm.growthRate,
      key_skills: JSON.parse(cm.keySkills) as string[],
    }));

    const normalizedRoadmap = {
      id: result.roadmap.id,
      title: result.roadmap.title,
      duration: result.roadmap.duration,
      summary: result.roadmap.summary,
      ai_plan: result.roadmap.aiPlan ? JSON.parse(result.roadmap.aiPlan) : undefined,
      milestones: result.roadmap.milestones
        .sort((a: RoadmapMilestoneRecord, b: RoadmapMilestoneRecord) => a.position - b.position)
        .map((milestone: RoadmapMilestoneRecord) => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          duration: milestone.duration,
          status: milestone.status,
          resources: JSON.parse(milestone.resources ?? '[]'),
        })),
    };

    return {
      user: { id: user.id, name: user.name, email: user.email },
      quizResultId: result.quizResult.id,
      summary,
      career_matches: normalizedMatches,
      learning_roadmap: normalizedRoadmap,
      goal_contract: result.goalContract,
      ai_insights: {
        explanation: explanationAi?.parsed,
        roadmap: aiRoadmap?.parsed,
        successCriteria: goalAi?.parsed,
      },
    };
  },

  async getLatestForUser(userId: string) {
    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const quizResult = await prisma.quizResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        careerMatches: true,
        roadmap: {
          include: { milestones: true },
        },
      },
    });

    if (!quizResult) {
      throw new AppError('No assessment found for user', 404);
    }

    const goalContract = quizResult.roadmap?.milestones.length
      ? await prisma.goalContract.findFirst({
          where: {
            milestoneId: {
              in: quizResult.roadmap.milestones.map((milestone: { id: string }) => milestone.id),
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : null;

    const insights = await prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      quizResult: {
        id: quizResult.id,
        createdAt: quizResult.createdAt,
        summary: safeParse(quizResult.summary, {}),
        strengths: safeParse(quizResult.strengths, []),
        weaknesses: safeParse(quizResult.weaknesses, []),
      },
      career_matches: quizResult.careerMatches.map((match: {
        id: string;
        title: string;
        matchScore: number;
        description: string;
        avgSalary: string | null;
        growthRate: string | null;
        keySkills: string;
      }) => ({
        id: match.id,
        title: match.title,
        match_score: match.matchScore,
        description: match.description,
        avg_salary: match.avgSalary,
        growth_rate: match.growthRate,
        key_skills: safeParse<string[]>(match.keySkills, []),
      })),
      learning_roadmap: quizResult.roadmap
        ? {
            id: quizResult.roadmap.id,
            title: quizResult.roadmap.title,
            duration: quizResult.roadmap.duration,
            summary: quizResult.roadmap.summary,
            ai_plan: safeParse(quizResult.roadmap.aiPlan, null),
            milestones: quizResult.roadmap.milestones
              .sort(
                (
                  a: { position: number },
                  b: { position: number }
                ) => a.position - b.position
              )
              .map((milestone: RoadmapMilestoneRecord) => ({
                id: milestone.id,
                title: milestone.title,
                description: milestone.description,
                duration: milestone.duration,
                status: milestone.status,
                resources: safeParse(milestone.resources, []),
              })),
          }
        : null,
      goal_contract: goalContract,
      ai_insights: insights.map((insight: {
        id: string;
        summary: string;
        type: string;
        createdAt: Date;
        metadata: string | null;
      }) => ({
        id: insight.id,
        summary: insight.summary,
        type: insight.type,
        createdAt: insight.createdAt,
        metadata: safeParse(insight.metadata, {}),
      })),
    };
  },

  async generateMicroTasks(userId: string) {
    if (!userId) {
      throw new AppError('userId is required', 400);
    }

    const quizResult = await prisma.quizResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!quizResult) {
      // No quiz result — return demo tasks so the feature still works
      console.warn('[AssessmentService] No quiz result found, returning demo micro-tasks');
      const demoWeakSkills = [
        { name: 'Data Structures', score: 2 },
        { name: 'System Design', score: 2 },
        { name: 'Problem Solving', score: 3 },
      ];
      return {
        quizResultId: null,
        weakSkills: demoWeakSkills,
        heatmap: [
          { name: 'Data Structures', score: 2, sentiment: 'needs-work' },
          { name: 'System Design', score: 2, sentiment: 'needs-work' },
          { name: 'Problem Solving', score: 3, sentiment: 'developing' },
          { name: 'JavaScript', score: 4, sentiment: 'good' },
        ],
        microTasks: [
          { skill: 'Data Structures', title: 'Implement a Stack', description: 'Build a stack data structure from scratch using arrays or linked lists. Practice push, pop, and peek operations.', resourceUrl: 'https://www.geeksforgeeks.org/stack-data-structure/' },
          { skill: 'Data Structures', title: 'Master Binary Search', description: 'Implement binary search iteratively and recursively. Practice on sorted arrays with different edge cases.', resourceUrl: 'https://leetcode.com/problems/binary-search/' },
          { skill: 'System Design', title: 'Design a URL Shortener', description: 'Sketch a basic system design for a URL shortener. Consider database schema, API design, and encoding strategy.', resourceUrl: 'https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers' },
          { skill: 'System Design', title: 'Learn REST API Principles', description: 'Study RESTful API design patterns including proper HTTP methods, status codes, and resource naming.', resourceUrl: 'https://developer.mozilla.org/en-US/docs/Glossary/REST' },
          { skill: 'Problem Solving', title: 'Solve Two Sum Problem', description: 'Solve the classic Two Sum problem using multiple approaches: brute force, sorting, and hash map.', resourceUrl: 'https://leetcode.com/problems/two-sum/' },
          { skill: 'Problem Solving', title: 'Practice Array Manipulation', description: 'Solve 3 array manipulation problems focusing on sliding window and two-pointer techniques.', resourceUrl: 'https://leetcode.com/tag/array/' },
        ],
        insightId: null,
        generatedAt: new Date(),
      };
    }

    const summary = safeParse<Record<string, any>>(quizResult.summary, {});
    const skillRatings = summary?.skillRatings ?? {};
    const skillEntries = Object.entries(skillRatings).map(([name, rawScore]) => ({
      name,
      score: typeof rawScore === 'number' ? rawScore : Number(rawScore) || 0,
    }));

    if (!skillEntries.length) {
      throw new AppError('Skill ratings missing for this user', 400);
    }

    const weakSkills = skillEntries
      .filter((entry) => entry.score <= 3)
      .sort((a, b) => a.score - b.score)
      .slice(0, 4);

    const prioritizedSkills = weakSkills.length
      ? weakSkills
      : skillEntries.sort((a, b) => a.score - b.score).slice(0, Math.min(skillEntries.length, 3));

    if (!prioritizedSkills.length) {
      throw new AppError('Unable to determine skills for micro-coaching', 400);
    }

    // Try AI, fall back to demo tasks
    let aiParsed: any;
    try {
      const aiResponse = await geminiService.recommendMicroTasks({
        weakSkills: prioritizedSkills.map((skill) => ({ name: skill.name, score: skill.score })),
      });
      aiParsed = aiResponse.parsed;

      const insight = await prisma.insight.create({
        data: {
          userId,
          source: 'GEMINI',
          prompt: aiResponse.prompt,
          response: aiResponse.raw,
          summary: 'AI micro-coach tasks generated',
          type: 'MICRO_TASKS',
          metadata: stringify(aiResponse.parsed),
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      return {
        quizResultId: quizResult.id,
        weakSkills: prioritizedSkills,
        heatmap: aiParsed.heatmap,
        microTasks: aiParsed.microTasks,
        insightId: insight.id,
        generatedAt: insight.createdAt,
      };
    } catch (aiError: any) {
      console.warn('[AssessmentService] AI micro-tasks failed, using demo:', aiError.message?.slice(0, 120));

      // Generate demo tasks from prioritized skills
      const demoTasks = prioritizedSkills.flatMap((skill) => [
        {
          skill: skill.name,
          title: `Practice ${skill.name} Basics`,
          description: `Spend 20 minutes reviewing the fundamentals of ${skill.name}. Focus on understanding core concepts and terminology.`,
          resourceUrl: `https://www.google.com/search?q=${encodeURIComponent(skill.name + ' tutorial for beginners')}`,
        },
        {
          skill: skill.name,
          title: `${skill.name} Hands-On Exercise`,
          description: `Complete a practical exercise related to ${skill.name}. Build something small that demonstrates key principles.`,
          resourceUrl: `https://www.google.com/search?q=${encodeURIComponent(skill.name + ' practice exercises')}`,
        },
      ]);

      const demoHeatmap = prioritizedSkills.map((s) => ({
        name: s.name,
        score: s.score,
        sentiment: s.score <= 2 ? 'needs-work' : 'developing',
      }));

      return {
        quizResultId: quizResult.id,
        weakSkills: prioritizedSkills,
        heatmap: demoHeatmap,
        microTasks: demoTasks,
        insightId: null,
        generatedAt: new Date(),
      };
    }
  },
};
