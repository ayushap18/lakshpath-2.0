import prisma from '@lib/prisma';
import { geminiService } from './geminiService';
import { LinkedInOptimizationRequest } from '@shared-types/ai';
import { AppError } from '@middleware/errorHandler';

// Demo fallback for when Gemini API is unavailable
const DEMO_OPTIMIZATION = {
  optimizedHeadline: 'Software Engineer | Full-Stack Developer | Building scalable web applications with React & Node.js',
  optimizedAbout: `Passionate software engineer with expertise in building scalable web applications. I specialize in React, Node.js, and cloud technologies, with a focus on creating impactful products that solve real-world problems.

With experience across the full stack, I bring a unique perspective to every project — from architecting robust backend systems to crafting intuitive user interfaces. I'm driven by continuous learning and thrive in collaborative, fast-paced environments.

Currently exploring opportunities in product-focused engineering roles where I can make a meaningful impact.`,
  keywords: ['Software Engineer', 'Full-Stack Developer', 'React', 'Node.js', 'TypeScript', 'Cloud Computing', 'System Design', 'API Development', 'Agile', 'Problem Solving'],
  overallScore: 72,
  beforeScore: 52,
  afterScore: 82,
  improvements: [
    { category: 'Headline', before: 'Student | Developer', after: 'Software Engineer | Full-Stack Developer | Building scalable web applications', reason: 'A specific, keyword-rich headline improves discoverability and clearly communicates your value proposition.' },
    { category: 'About Section', before: 'No about section provided', after: 'Comprehensive summary highlighting skills, experience, and career goals', reason: 'The about section is prime real estate for ATS keywords and personal branding.' },
    { category: 'Keywords', before: 'Minimal keyword usage', after: '10+ industry-relevant keywords strategically placed', reason: 'Recruiters use keyword searches; optimized profiles appear 40x more in searches.' },
    { category: 'Professional Tone', before: 'Informal or missing descriptions', after: 'Action-oriented, achievement-focused language', reason: 'Professional tone builds credibility and demonstrates communication skills.' },
  ],
  missingElements: ['Professional headshot', 'Custom profile URL', 'Featured section with projects', 'Skills endorsements (aim for 10+)', 'At least 3 recommendations'],
  atsOptimizationTips: [
    'Use exact job title keywords in your headline (e.g., "Software Engineer" not just "Developer")',
    'Include both spelled-out and abbreviated versions of technologies (e.g., "JavaScript (JS)")',
    'Add certifications with full names and issuing organizations',
    'List specific tools and frameworks rather than generic terms',
    'Keep formatting simple — avoid special characters that ATS systems may not parse',
  ],
};

export const linkedinService = {
  async optimizeProfile(userId: string, profileData: LinkedInOptimizationRequest) {
    try {
      let optimization: any;
      try {
        const optimizationResult = await geminiService.optimizeLinkedInProfile(profileData);
        optimization = optimizationResult.parsed;
      } catch (aiError: any) {
        console.warn('[LinkedinService] AI optimization failed, using demo fallback:', aiError.message?.slice(0, 120));
        const role = profileData.targetRole || 'Software Engineer';
        optimization = {
          ...DEMO_OPTIMIZATION,
          optimizedHeadline: `${role} | Building impactful solutions with modern technologies`,
          keywords: [...DEMO_OPTIMIZATION.keywords.slice(0, 5), role],
        };
      }

      const linkedinOptimization = await prisma.linkedInOptimization.create({
        data: {
          userId,
          targetRole: profileData.targetRole,
          targetIndustry: profileData.targetIndustry,
          currentHeadline: profileData.currentHeadline,
          optimizedHeadline: optimization.optimizedHeadline,
          currentAbout: profileData.currentAbout,
          optimizedAbout: optimization.optimizedAbout,
          currentExperience: profileData.currentExperience
            ? JSON.stringify(profileData.currentExperience)
            : null,
          optimizedExperience: optimization.optimizedExperience
            ? JSON.stringify(optimization.optimizedExperience)
            : null,
          keywords: JSON.stringify(optimization.keywords),
          overallScore: optimization.overallScore,
          beforeScore: optimization.beforeScore,
          afterScore: optimization.afterScore,
          improvements: JSON.stringify(optimization.improvements),
          missingElements: optimization.missingElements
            ? JSON.stringify(optimization.missingElements)
            : null,
          status: 'DRAFT',
        },
      });

      return await this.getOptimization(linkedinOptimization.id, userId);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Failed to optimize LinkedIn profile: ${error.message}`,
        500,
        error
      );
    }
  },

  async getOptimization(optimizationId: string, userId: string) {
    const optimization = await prisma.linkedInOptimization.findUnique({
      where: { id: optimizationId },
    });

    if (!optimization) {
      throw new AppError('LinkedIn optimization not found', 404);
    }

    if (optimization.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return {
      ...optimization,
      currentExperience: optimization.currentExperience
        ? JSON.parse(optimization.currentExperience)
        : null,
      optimizedExperience: optimization.optimizedExperience
        ? JSON.parse(optimization.optimizedExperience)
        : null,
      keywords: JSON.parse(optimization.keywords),
      improvements: JSON.parse(optimization.improvements),
      missingElements: optimization.missingElements
        ? JSON.parse(optimization.missingElements)
        : null,
    };
  },

  async getUserOptimizations(userId: string, limit = 10) {
    const optimizations = await prisma.linkedInOptimization.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return optimizations.map((opt) => ({
      ...opt,
      keywords: JSON.parse(opt.keywords),
      improvements: JSON.parse(opt.improvements),
      missingElements: opt.missingElements ? JSON.parse(opt.missingElements) : null,
    }));
  },

  async updateStatus(optimizationId: string, userId: string, status: string) {
    const optimization = await prisma.linkedInOptimization.findUnique({
      where: { id: optimizationId },
    });

    if (!optimization) {
      throw new AppError('LinkedIn optimization not found', 404);
    }

    if (optimization.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return await prisma.linkedInOptimization.update({
      where: { id: optimizationId },
      data: { status },
    });
  },

  async getUserStats(userId: string) {
    const optimizations = await prisma.linkedInOptimization.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (optimizations.length === 0) {
      return {
        totalOptimizations: 0,
        avgImprovement: 0,
        appliedCount: 0,
        draftCount: 0,
      };
    }

    const totalOptimizations = optimizations.length;
    const avgImprovement =
      optimizations.reduce((sum, o) => sum + (o.afterScore - (o.beforeScore || 0)), 0) /
      totalOptimizations;
    const appliedCount = optimizations.filter((o) => o.status === 'APPLIED').length;
    const draftCount = optimizations.filter((o) => o.status === 'DRAFT').length;

    return {
      totalOptimizations,
      avgImprovement: Math.round(avgImprovement * 10) / 10,
      appliedCount,
      draftCount,
      recentOptimizations: optimizations.slice(0, 3).map((o) => ({
        id: o.id,
        targetRole: o.targetRole,
        status: o.status,
        improvement: o.afterScore - (o.beforeScore || 0),
        createdAt: o.createdAt,
      })),
    };
  },

  async deleteOptimization(optimizationId: string, userId: string) {
    const optimization = await prisma.linkedInOptimization.findUnique({
      where: { id: optimizationId },
    });

    if (!optimization) {
      throw new AppError('LinkedIn optimization not found', 404);
    }

    if (optimization.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.linkedInOptimization.delete({
      where: { id: optimizationId },
    });

    return { message: 'LinkedIn optimization deleted successfully' };
  },

  async compareVersions(userId: string, optimizationIds: string[]) {
    const optimizations = await Promise.all(
      optimizationIds.map((id) => this.getOptimization(id, userId))
    );

    return {
      comparison: optimizations.map((opt) => ({
        id: opt.id,
        targetRole: opt.targetRole,
        headline: opt.optimizedHeadline,
        score: opt.afterScore,
        improvement: opt.afterScore - (opt.beforeScore || 0),
        createdAt: opt.createdAt,
      })),
      bestScore: Math.max(...optimizations.map((o) => o.afterScore)),
      avgImprovement:
        optimizations.reduce((sum, o) => sum + (o.afterScore - (o.beforeScore || 0)), 0) /
        optimizations.length,
    };
  },
};
