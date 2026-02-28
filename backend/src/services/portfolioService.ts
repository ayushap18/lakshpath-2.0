import prisma from '@lib/prisma';
import { geminiService } from './geminiService';
import { PortfolioAnalysisRequest } from '@shared-types/ai';
import { AppError } from '@middleware/errorHandler';
import env from '@config/env';

// GitHub API headers (with optional token for higher rate limits)
const getGitHubHeaders = () => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'LakshPath-Career-Platform',
  };
  if (env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
  }
  return headers;
};

// Badge assets for GitHub achievements
const BADGE_SLUGS = [
  'pull-shark',
  'starstruck',
  'pair-extraordinaire',
  'galaxy-brain',
  'yolo',
  'quickdraw',
  'highlight',
  'community',
  'deep-diver',
  'arctic-code-vault-contributor',
  'public-sponsor',
  'heart-on-your-sleeve',
  'open-sourcerer',
];

export const portfolioService = {
  /**
   * Analyze GitHub portfolio with advanced features
   */
  async analyzeGitHubPortfolio(
    userId: string,
    githubUsername: string,
    targetRole?: string
  ) {
    try {
      // Fetch comprehensive GitHub data (graceful failures for badges/forks)
      let repos: any[] = [];
      let userData: any = {};
      let badges: any[] = [];

      try {
        [repos, userData] = await Promise.all([
          this.fetchGitHubRepos(githubUsername),
          this.fetchGitHubUser(githubUsername),
        ]);
      } catch (fetchError: any) {
        // If the original error is a 404 (user not found), pass it through
        if (fetchError instanceof AppError && fetchError.statusCode === 404) {
          throw fetchError;
        }
        throw new AppError(
          `Cannot reach GitHub API for "${githubUsername}". You may be rate-limited (60 req/hr without token). Add GITHUB_TOKEN to .env for 5000 req/hr.`,
          502,
          fetchError
        );
      }

      // Badge and fork checks are optional - don't fail the whole analysis
      try {
        badges = await this.validateBadges(githubUsername);
      } catch {
        badges = [];
      }

      // Separate original repos and forks
      const originalRepos = repos.filter((r: any) => !r.fork);
      const forkRepos = repos.filter((r: any) => r.fork);

      // Check authored forks (gracefully skip if rate-limited)
      let authoredForks: any[] = [];
      try {
        authoredForks = await this.checkAuthoredForks(githubUsername, forkRepos);
      } catch {
        authoredForks = [];
      }

      const allRepos = [...originalRepos, ...authoredForks];

      // Prepare enhanced analysis request
      const analysisRequest: PortfolioAnalysisRequest = {
        githubUsername,
        repositories: allRepos.map((repo: any) => ({
          name: repo.name,
          description: repo.description || '',
          language: repo.language || '',
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          hasReadme: true,
          hasTests: false,
          hasCi: false,
          lastCommit: repo.pushed_at,
          isFork: repo.fork || false,
        })),
        targetRole,
      };

      // Get AI analysis (with fallback)
      let analysis: any;
      try {
        const analysisResult = await geminiService.analyzePortfolio(analysisRequest);
        analysis = analysisResult.parsed;
      } catch (aiError: any) {
        console.warn('[PortfolioService] AI analysis failed, using generated fallback:', aiError.message?.slice(0, 120));
        const languages = [...new Set(allRepos.map((r: any) => r.language).filter(Boolean))];

        // Calculate real scores based on actual data
        const totalStars = allRepos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);
        const hasDescriptions = allRepos.filter((r: any) => r.description).length;
        const recentRepos = allRepos.filter((r: any) => {
          const pushed = new Date(r.pushed_at || 0);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return pushed > sixMonthsAgo;
        }).length;

        const diversityScore = Math.min(100, 30 + languages.length * 8);
        const contributionScore = Math.min(100, 20 + allRepos.length * 1.5 + recentRepos * 3);
        const codeQualityScore = Math.min(100, 40 + (hasDescriptions / Math.max(allRepos.length, 1)) * 30 + Math.min(totalStars, 20) * 1.5);
        const overallScore = Math.round((diversityScore + contributionScore + codeQualityScore) / 3);

        analysis = {
          overallScore,
          codeQualityScore: Math.round(codeQualityScore),
          diversityScore: Math.round(diversityScore),
          contributionScore: Math.round(contributionScore),
          summary: `GitHub portfolio for ${githubUsername}: ${originalRepos.length} original repos across ${languages.length} languages${totalStars > 0 ? ` with ${totalStars} total stars` : ''}. ${recentRepos > 3 ? 'Active developer with recent contributions.' : 'Room for more frequent contributions.'}`,
          strengths: [
            `Active GitHub presence with ${originalRepos.length} original repositories`,
            languages.length > 0 ? `Multi-language proficiency: ${languages.slice(0, 5).join(', ')}` : 'Getting started with coding projects',
            recentRepos > 0 ? `${recentRepos} repositories updated in the last 6 months` : 'Consistent commit history',
            totalStars > 0 ? `${totalStars} stars across repositories` : 'Building portfolio visibility',
          ].filter(Boolean),
          weaknesses: [
            hasDescriptions < allRepos.length * 0.5 ? 'Add descriptions to repositories for discoverability' : null,
            'Include unit tests and CI/CD pipelines',
            'Add comprehensive README files with screenshots',
            authoredForks.length === 0 ? 'Contribute to open-source projects' : null,
          ].filter(Boolean),
          missingProjectTypes: ['Full-stack web application', 'API/Backend service', 'Open-source contribution'],
          recommendations: [
            'Add detailed README with screenshots to your top projects',
            'Set up GitHub Actions for automated testing',
            'Pin your 6 best repositories on your profile',
            'Build a portfolio website showcasing your best work',
            'Contribute to beginner-friendly open-source projects',
          ],
          // Generate insights for ALL repos (sorted by stars then recency)
          repositoryInsights: allRepos
            .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
            .map((r: any) => {
              const hasDesc = !!r.description;
              const isPushedRecently = new Date(r.pushed_at || 0) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
              const stars = r.stargazers_count || 0;
              const repoScore = Math.min(100, 40 + (hasDesc ? 15 : 0) + (isPushedRecently ? 15 : 0) + Math.min(stars * 5, 20) + (r.language ? 10 : 0));
              return {
                repoName: r.name,
                codeQualityScore: repoScore,
                complexity: stars > 5 || (r.size || 0) > 5000 ? 'high' : (r.size || 0) > 1000 ? 'moderate' : 'low',
                readmeQuality: hasDesc ? 'good' : 'needs improvement',
                improvements: [
                  !hasDesc ? 'Add repository description' : null,
                  'Add comprehensive README',
                  !isPushedRecently ? 'Update with recent commits' : null,
                  'Add unit tests',
                ].filter(Boolean),
                highlights: [
                  r.language ? `Built with ${r.language}` : null,
                  stars > 0 ? `${stars} star${stars > 1 ? 's' : ''}` : null,
                  isPushedRecently ? 'Recently updated' : null,
                  (r.forks_count || 0) > 0 ? `${r.forks_count} fork${r.forks_count > 1 ? 's' : ''}` : null,
                ].filter(Boolean),
              };
            }),
        };
      }

      // Enhance analysis with user data and badges
      const enhancedAnalysis = {
        ...analysis,
        userProfile: {
          name: userData.name,
          bio: userData.bio,
          company: userData.company,
          location: userData.location,
          blog: userData.blog,
          followers: userData.followers,
          following: userData.following,
          publicRepos: userData.public_repos,
        },
        badges: badges,
        originalReposCount: originalRepos.length,
        authoredForksCount: authoredForks.length,
        totalForksCount: forkRepos.length,
      };

      // Save to database
      const portfolioAnalysis = await prisma.portfolioAnalysis.create({
        data: {
          userId,
          githubUsername,
          targetRole,
          overallScore: analysis.overallScore,
          codeQualityScore: analysis.codeQualityScore,
          diversityScore: analysis.diversityScore,
          contributionScore: analysis.contributionScore,
          summary: analysis.summary,
          strengths: JSON.stringify(analysis.strengths),
          weaknesses: JSON.stringify(analysis.weaknesses),
          missingProjectTypes: JSON.stringify(analysis.missingProjectTypes),
          recommendations: JSON.stringify(analysis.recommendations),
        },
      });

      // Save repository insights
      if (analysis.repositoryInsights && analysis.repositoryInsights.length > 0) {
        await Promise.all(
          analysis.repositoryInsights.map((insight: any) => {
            const repo = allRepos.find(
              (r: any) => r.name === insight.repoName
            );
            return prisma.repositoryAnalysis.create({
              data: {
                portfolioId: portfolioAnalysis.id,
                repoName: insight.repoName,
                repoUrl:
                  repo?.html_url ||
                  `https://github.com/${githubUsername}/${insight.repoName}`,
                description: repo?.description || '',
                language: repo?.language || '',
                stars: repo?.stargazers_count || 0,
                forks: repo?.forks_count || 0,
                lastCommit: repo?.pushed_at ? new Date(repo.pushed_at) : null,
                codeQualityScore: insight.codeQualityScore,
                complexity: insight.complexity,
                hasReadme: true,
                hasTests: false,
                hasCi: false,
                readmeQuality: insight.readmeQuality,
                improvements: JSON.stringify(insight.improvements),
                highlights: JSON.stringify(insight.highlights),
              },
            });
          })
        );
      }

      const finalAnalysis = await this.getAnalysis(portfolioAnalysis.id, userId);
      return {
        ...finalAnalysis,
        ...enhancedAnalysis,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Failed to analyze GitHub portfolio: ${error.message}`,
        500,
        error
      );
    }
  },

  /**
   * Fetch GitHub user profile
   */
  async fetchGitHubUser(username: string) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: getGitHubHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new AppError('GitHub user not found', 404);
        }
        throw new AppError('Failed to fetch GitHub user', 502);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to connect to GitHub API', 502, error);
    }
  },

  /**
   * Fetch GitHub repositories for a user
   */
  async fetchGitHubRepos(username: string) {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
        { headers: getGitHubHeaders() }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new AppError('GitHub user not found', 404);
        }
        throw new AppError('Failed to fetch GitHub repositories', 502);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to connect to GitHub API', 502, error);
    }
  },

  /**
   * Check if user has actual commits in forked repositories
   */
  async checkAuthoredForks(username: string, forks: any[]) {
    const BATCH_SIZE = 10;
    const authoredForks: any[] = [];

    for (let i = 0; i < forks.length; i += BATCH_SIZE) {
      const batch = forks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (fork) => {
          const hasCommits = await this.userHasCommits(username, fork.name);
          return hasCommits ? fork : null;
        })
      );

      authoredForks.push(...batchResults.filter((f) => f !== null));
    }

    return authoredForks;
  },

  /**
   * Check if user has commits in a specific repository
   */
  async userHasCommits(username: string, repoName: string) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/commits?author=${username}&per_page=1`,
        { headers: getGitHubHeaders() }
      );

      if (!response.ok) return false;
      const commits = await response.json();
      return commits.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Validate GitHub achievement badges
   */
  async validateBadges(username: string) {
    const badges = await Promise.all(
      BADGE_SLUGS.map((slug) => this.checkAchievementStatus(username, slug))
    );

    return badges.filter(Boolean);
  },

  /**
   * Check if a user has unlocked a specific achievement badge
   */
  async checkAchievementStatus(username: string, slug: string) {
    try {
      const url = `https://github.com/${encodeURIComponent(
        username
      )}?tab=achievements&achievement=${slug}`;

      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'LakshPath-Career-Platform',
          Accept: '*/*',
        },
      });

      return response.status === 200 ? slug : null;
    } catch {
      return null;
    }
  },

  /**
   * Get portfolio analysis by ID
   */
  async getAnalysis(analysisId: string, userId: string) {
    const analysis = await prisma.portfolioAnalysis.findUnique({
      where: { id: analysisId },
      include: { repositories: true },
    });

    if (!analysis) {
      throw new AppError('Portfolio analysis not found', 404);
    }

    if (analysis.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return {
      ...analysis,
      strengths: JSON.parse(analysis.strengths),
      weaknesses: JSON.parse(analysis.weaknesses),
      missingProjectTypes: analysis.missingProjectTypes
        ? JSON.parse(analysis.missingProjectTypes)
        : [],
      recommendations: JSON.parse(analysis.recommendations),
      repositories: analysis.repositories.map((repo) => ({
        ...repo,
        improvements: repo.improvements ? JSON.parse(repo.improvements) : [],
        highlights: repo.highlights ? JSON.parse(repo.highlights) : [],
      })),
    };
  },

  /**
   * Get all portfolio analyses for a user
   */
  async getUserAnalyses(userId: string, limit = 10) {
    const analyses = await prisma.portfolioAnalysis.findMany({
      where: { userId },
      include: {
        repositories: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return analyses.map((analysis) => ({
      ...analysis,
      strengths: JSON.parse(analysis.strengths),
      weaknesses: JSON.parse(analysis.weaknesses),
      recommendations: JSON.parse(analysis.recommendations),
      missingProjectTypes: analysis.missingProjectTypes
        ? JSON.parse(analysis.missingProjectTypes)
        : [],
      repositories: analysis.repositories.map((repo) => ({
        ...repo,
        improvements: repo.improvements ? JSON.parse(repo.improvements) : [],
        highlights: repo.highlights ? JSON.parse(repo.highlights) : [],
      })),
    }));
  },

  /**
   * Get portfolio statistics
   */
  async getUserStats(userId: string) {
    const analyses = await prisma.portfolioAnalysis.findMany({
      where: { userId },
      include: { repositories: true },
      orderBy: { createdAt: 'desc' },
    });

    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        avgScore: 0,
        topLanguages: [],
        totalRepositories: 0,
        improvement: 0,
      };
    }

    const totalAnalyses = analyses.length;
    const avgScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / totalAnalyses;
    const totalRepositories = analyses.reduce((sum, a) => sum + a.repositories.length, 0);

    // Calculate improvement (latest vs oldest)
    const improvement =
      analyses.length >= 2
        ? analyses[0].overallScore - analyses[analyses.length - 1].overallScore
        : 0;

    // Get top languages across all repositories
    const languageCounts: Record<string, number> = {};
    analyses.forEach((a) => {
      a.repositories.forEach((repo) => {
        if (repo.language) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
      });
    });

    const topLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, count }));

    return {
      totalAnalyses,
      avgScore: Math.round(avgScore * 10) / 10,
      topLanguages,
      totalRepositories,
      improvement: Math.round(improvement * 10) / 10,
      recentAnalyses: analyses.slice(0, 3).map((a) => ({
        id: a.id,
        githubUsername: a.githubUsername,
        score: a.overallScore,
        createdAt: a.createdAt,
      })),
    };
  },

  /**
   * Delete portfolio analysis
   */
  async deleteAnalysis(analysisId: string, userId: string) {
    const analysis = await prisma.portfolioAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      throw new AppError('Portfolio analysis not found', 404);
    }

    if (analysis.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.portfolioAnalysis.delete({
      where: { id: analysisId },
    });

    return { message: 'Portfolio analysis deleted successfully' };
  },
};
