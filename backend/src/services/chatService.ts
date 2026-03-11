import prisma from '@lib/prisma';
import { geminiService } from './geminiService';
import { AppError } from '@middleware/errorHandler';
import { safeParse, safeStringify } from '@utils/json';
import { MentorChatRequest } from '@shared-types/ai';
import { DOMAIN_THEMES, DomainKey } from '@lib/domainThemes';

interface MentorChatPayload {
  userId: string;
  round: 'career' | 'interview' | 'scholarship';
  message: string;
  context?: Record<string, unknown>;
}

const DEFAULT_DOMAIN: DomainKey = 'Technology & Software';

const isForeignKeyConstraintError = (error: unknown): error is { code: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2003'
  );
};

const buildMentorContext = async (
  userId: string,
  baseContext: MentorChatRequest['context'] = {}
): Promise<MentorChatRequest['context']> => {
  const [quizResult, recentInsights] = await Promise.all([
    prisma.quizResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const summary = safeParse<Record<string, unknown>>(quizResult?.summary, {});
  const domainFocus = (summary?.fieldInterest as string) || DEFAULT_DOMAIN;
  const domainTheme = DOMAIN_THEMES[domainFocus as DomainKey] || DOMAIN_THEMES.default;
  const domainInterests = (summary?.domainInterests as Record<string, number>) ?? undefined;

  const insightHighlights = recentInsights.map((insight: { type: string; summary: string; metadata: string | null }) => {
    const metadata = safeParse<Record<string, unknown>>(insight.metadata, {});
    const shortMeta = metadata?.headline || metadata?.summary;
    return `${insight.type}: ${shortMeta ?? insight.summary}`;
  });

  return {
    ...baseContext,
    assessmentSummary: summary,
    domainFocus,
    domainTheme: {
      mission: domainTheme.mission,
      personalityTag: domainTheme.personalityTag,
      aiHook: domainTheme.aiHook,
      tone: domainTheme.tone,
    },
    domainInterests,
    recentInsights: insightHighlights,
  };
};

export const chatService = {
  async mentorRound(payload: MentorChatPayload) {
    if (!payload.userId) throw new AppError('userId is required', 400);
    if (!payload.message) throw new AppError('message is required', 400);

    const context = payload.context ?? {};
    const enrichedContext = await buildMentorContext(payload.userId, context as MentorChatRequest['context']);

    const request: MentorChatRequest = {
      round: payload.round,
      message: payload.message,
      context: enrichedContext,
    };

    let parsedReply: any;
    let rawPrompt = '';
    let rawResponse = '';

    try {
      const aiResponse = await geminiService.mentorChat(request);
      parsedReply = aiResponse.parsed;
      rawPrompt = aiResponse.prompt;
      rawResponse = aiResponse.raw;
    } catch (error: any) {
      console.warn('[chatService] AI mentor failed, using demo reply:', error.message?.slice(0, 120));
      const demoReplies: Record<string, any> = {
        career: {
          headline: "Let's map your career path!",
          summary: "Based on your interests in technology and problem-solving, there are several exciting career paths available. Focus on building a strong foundation in data structures, algorithms, and system design while exploring areas like full-stack development, AI/ML, or cloud computing.",
          actionPlan: [
            "Complete a structured DSA course (Striver's A2Z sheet recommended)",
            "Build 2-3 full-stack projects showcasing your skills",
            "Contribute to open-source projects on GitHub",
            "Practice mock interviews regularly",
            "Network with professionals on LinkedIn",
          ],
          followUps: ["What specific tech stack interests you most?", "Have you considered any internship opportunities?", "Would you like help creating a 90-day skill-building plan?"],
          nudges: ["Start with one small project today", "Set a daily coding goal of 1-2 hours"],
          confidence: 0.85,
          references: ["Striver's A2Z DSA Sheet", "roadmap.sh", "LeetCode"],
          tone: "encouraging",
        },
        interview: {
          headline: "Let's ace your interviews!",
          summary: "Interview preparation requires a balanced approach: technical skills, communication, and confidence. Focus on understanding core concepts deeply rather than memorizing solutions. Practice explaining your thought process out loud.",
          actionPlan: [
            "Solve 2-3 LeetCode problems daily, focusing on patterns",
            "Practice behavioral questions using the STAR method",
            "Do mock interviews with peers or on platforms like Pramp",
            "Review system design basics for senior roles",
            "Prepare your 'Tell me about yourself' pitch",
          ],
          followUps: ["Which companies are you targeting?", "What's your timeline for interviews?", "Shall we practice a mock interview question?"],
          nudges: ["Start with easy problems and gradually increase difficulty", "Record yourself answering questions to improve delivery"],
          confidence: 0.82,
          references: ["LeetCode", "NeetCode", "Grokking the Coding Interview"],
          tone: "motivating",
        },
        scholarship: {
          headline: "Let's find the right scholarships!",
          summary: "There are numerous scholarship opportunities for students in technology and engineering. Key factors include academic performance, project portfolio, community involvement, and a compelling personal statement.",
          actionPlan: [
            "Research scholarships on platforms like Buddy4Study and ScholarshipPortal",
            "Maintain a strong academic record (8.0+ CGPA)",
            "Document all your projects, achievements, and extracurriculars",
            "Write a compelling personal statement highlighting your journey",
            "Apply to multiple scholarships to increase your chances",
          ],
          followUps: ["What's your current academic standing?", "Are you looking for merit-based or need-based scholarships?", "Do you have any specific countries in mind for studying abroad?"],
          nudges: ["Start applications early - many deadlines are months ahead", "Ask professors for recommendation letters now"],
          confidence: 0.80,
          references: ["Buddy4Study", "ScholarshipPortal.com", "Commonwealth Scholarships"],
          tone: "supportive",
        },
      };
      parsedReply = demoReplies[payload.round] || demoReplies.career;
    }

    const replySummary = parsedReply.headline ?? `AI mentor (${payload.round}) reply`;

    try {
      await prisma.$transaction([
        // Persist user message
        prisma.chatMessage.create({
          data: {
            userId: payload.userId,
            role: 'user',
            content: payload.message,
            round: payload.round,
          },
        }),
        // Persist assistant reply
        prisma.chatMessage.create({
          data: {
            userId: payload.userId,
            role: 'assistant',
            content: parsedReply.summary ?? replySummary,
            round: payload.round,
            metadata: safeStringify(parsedReply),
          },
        }),
        // Keep existing Insight record for analytics
        prisma.insight.create({
          data: {
            userId: payload.userId,
            source: 'GEMINI',
            prompt: rawPrompt || `Mentor chat: ${payload.message}`,
            response: rawResponse || JSON.stringify(parsedReply),
            summary: replySummary,
            type: 'CHAT',
            metadata: safeStringify({ message: payload.message, reply: parsedReply }),
          },
        }),
      ]);
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        console.warn(`[chatService] Skipping persistence for missing user ${payload.userId}`);
      } else {
        throw error;
      }
    }

    return parsedReply;
  },
};
