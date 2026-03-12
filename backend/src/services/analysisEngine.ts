/**
 * Analysis Engine — Central intelligence that processes user profile data,
 * assessment answers, GitHub repos, and produces a unified ProfileAnalysis.
 */
import prisma from '@lib/prisma';
import { VertexAI } from '@google-cloud/vertexai';
import env from '@config/env';

const vertexAI = new VertexAI({ project: env.GCP_PROJECT_ID, location: env.GCP_REGION });

// ─── Helpers ──────────────────────────────────────────────
async function callAI(prompt: string): Promise<any | null> {
  try {
    const model = vertexAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
    });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const raw = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return JSON.parse(raw.replace(/^```json/gm, '').replace(/```$/gm, '').trim());
  } catch (err) {
    console.error('[AnalysisEngine] AI call failed, using heuristic:', (err as Error).message);
    return null;
  }
}

function determineLevel(score: number): string {
  if (score >= 80) return 'EXPERT';
  if (score >= 60) return 'ADVANCED';
  if (score >= 40) return 'INTERMEDIATE';
  return 'BEGINNER';
}

// ─── GitHub Public API Fetcher ────────────────────────────
export async function fetchGitHubProfile(username: string) {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'LakshPath' },
      }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, {
        headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'LakshPath' },
      }),
    ]);

    if (!userRes.ok) return null;

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    const languages: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    const repoData = (repos as any[]).map((r: any) => {
      if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
      totalStars += r.stargazers_count || 0;
      totalForks += r.forks_count || 0;
      return {
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        url: r.html_url,
        updatedAt: r.updated_at,
        hasReadme: true, // assume if repo exists
        topics: r.topics || [],
      };
    });

    return {
      username: user.login,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      languages: Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .map(([lang, count]) => ({ language: lang, repoCount: count })),
      totalStars,
      totalForks,
      repos: repoData,
      profileUrl: user.html_url,
    };
  } catch (err) {
    console.error('[AnalysisEngine] GitHub fetch failed:', (err as Error).message);
    return null;
  }
}

// ─── Badge Awarding Logic ─────────────────────────────────
interface BadgeDef {
  name: string;
  icon: string;
  description: string;
  category: string;
  rarity: string;
}

function computeBadges(user: any, analysis: any, githubData: any): BadgeDef[] {
  const badges: BadgeDef[] = [];

  // Profile badges
  if (user.profileSetupCompleted) {
    badges.push({ name: 'Profile Complete', icon: 'person_check', description: 'Completed your tech profile setup', category: 'PROFILE', rarity: 'COMMON' });
  }
  if (user.githubUsername) {
    badges.push({ name: 'GitHub Connected', icon: 'code', description: 'Connected your GitHub profile', category: 'PROFILE', rarity: 'COMMON' });
  }
  if (user.linkedinUrl) {
    badges.push({ name: 'LinkedIn Linked', icon: 'link', description: 'Connected your LinkedIn profile', category: 'PROFILE', rarity: 'COMMON' });
  }

  // Skill badges from assessment
  const skillLevels = analysis?.skillLevels ? JSON.parse(analysis.skillLevels) : {};
  if (skillLevels.dsa >= 4) {
    badges.push({ name: 'DSA Warrior', icon: 'functions', description: 'Rated 4+ in DSA & problem-solving', category: 'SKILL', rarity: 'RARE' });
  }
  if (skillLevels.systemDesign >= 4) {
    badges.push({ name: 'Architect Mind', icon: 'architecture', description: 'Rated 4+ in system design', category: 'SKILL', rarity: 'RARE' });
  }

  // GitHub badges
  if (githubData) {
    if (githubData.publicRepos >= 10) {
      badges.push({ name: 'Code Machine', icon: 'inventory_2', description: '10+ public repositories', category: 'ACHIEVEMENT', rarity: 'RARE' });
    }
    if (githubData.publicRepos >= 30) {
      badges.push({ name: 'Open Source Champion', icon: 'emoji_events', description: '30+ public repositories', category: 'ACHIEVEMENT', rarity: 'EPIC' });
    }
    if (githubData.totalStars >= 10) {
      badges.push({ name: 'Star Collector', icon: 'star', description: '10+ total stars on repositories', category: 'ACHIEVEMENT', rarity: 'RARE' });
    }
    if (githubData.totalStars >= 100) {
      badges.push({ name: 'GitHub Celebrity', icon: 'celebration', description: '100+ total stars', category: 'ACHIEVEMENT', rarity: 'LEGENDARY' });
    }
    if (githubData.languages?.length >= 5) {
      badges.push({ name: 'Polyglot Dev', icon: 'translate', description: 'Code in 5+ programming languages', category: 'SKILL', rarity: 'EPIC' });
    }
    if (githubData.followers >= 10) {
      badges.push({ name: 'Community Builder', icon: 'groups', description: '10+ GitHub followers', category: 'ACHIEVEMENT', rarity: 'RARE' });
    }
  }

  // Level badges
  const score = analysis?.overallScore || 0;
  if (score >= 80) {
    badges.push({ name: 'Elite Developer', icon: 'military_tech', description: 'Overall profile score 80+', category: 'ACHIEVEMENT', rarity: 'LEGENDARY' });
  } else if (score >= 60) {
    badges.push({ name: 'Rising Star', icon: 'trending_up', description: 'Overall profile score 60+', category: 'ACHIEVEMENT', rarity: 'EPIC' });
  } else if (score >= 40) {
    badges.push({ name: 'Getting Started', icon: 'rocket_launch', description: 'Overall profile score 40+', category: 'ACHIEVEMENT', rarity: 'COMMON' });
  }

  return badges;
}

// ─── Main Analysis Runner ─────────────────────────────────
export async function runFullAnalysis(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      quizResults: { orderBy: { createdAt: 'desc' }, take: 1 },
      portfolioAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!user) throw new Error('User not found');

  // 1. Gather all data sources
  const quiz = user.quizResults[0];
  const quizAnswers = quiz ? JSON.parse(quiz.answers) : null;

  // 2. Fetch GitHub if username present
  let githubData: any = null;
  if (user.githubUsername) {
    githubData = await fetchGitHubProfile(user.githubUsername);
  }

  // 3. Build assessment summary from quiz answers
  let assessmentSummary: any = null;
  if (quizAnswers) {
    assessmentSummary = {
      education: quizAnswers.q1 || null,
      languages: quizAnswers.q2 || [],
      domains: quizAnswers.q3 || [],
      dsaRating: quizAnswers.q4 || 0,
      systemDesignRating: quizAnswers.q5 || 0,
      targetRole: quizAnswers.q6 || null,
      placementTimeline: quizAnswers.q7 || null,
      challenge: quizAnswers.q8 || null,
    };
  }

  // 4. Build skill levels
  const skillLevels: Record<string, number> = {};
  if (assessmentSummary) {
    skillLevels.dsa = assessmentSummary.dsaRating || 0;
    skillLevels.systemDesign = assessmentSummary.systemDesignRating || 0;
    skillLevels.languages = (assessmentSummary.languages?.length || 0) >= 3 ? 4 : (assessmentSummary.languages?.length || 0) >= 1 ? 3 : 1;
  }
  if (githubData) {
    skillLevels.github = Math.min(5, Math.floor(githubData.publicRepos / 5) + 1);
    skillLevels.openSource = githubData.totalStars >= 10 ? 4 : githubData.totalStars >= 3 ? 3 : 2;
  }

  // 5. Build tech stack
  const techStack: any = {
    languages: assessmentSummary?.languages || [],
    githubLanguages: githubData?.languages?.map((l: any) => l.language) || [],
    domains: assessmentSummary?.domains || [],
  };

  // 6. Compute overall score (heuristic, can be overridden by AI)
  let overallScore = 0;
  const factors: number[] = [];
  if (skillLevels.dsa) factors.push(skillLevels.dsa * 20);
  if (skillLevels.systemDesign) factors.push(skillLevels.systemDesign * 20);
  if (skillLevels.languages) factors.push(skillLevels.languages * 15);
  if (githubData) factors.push(Math.min(100, githubData.publicRepos * 3 + githubData.totalStars * 2));
  if (user.profileSetupCompleted) factors.push(60);
  overallScore = factors.length > 0 ? Math.round(factors.reduce((a, b) => a + b, 0) / factors.length) : 20;

  // 7. Career profile
  const careerProfile: any = {
    targetRole: assessmentSummary?.targetRole || null,
    domains: assessmentSummary?.domains || [],
    education: user.degree || assessmentSummary?.education || null,
    college: user.college || null,
    graduationYear: user.graduationYear || null,
    placementTimeline: assessmentSummary?.placementTimeline || null,
  };

  // 8. Try AI-powered deep analysis
  let aiInsights: any = null;
  let careerMatches: any = null;
  let strengthAreas: string[] = [];
  let improvementAreas: string[] = [];
  let recommendations: string[] = [];

  const aiResult = await callAI(`You are an AI career analysis engine for Indian tech students. Analyze this student's complete profile and provide career guidance.

STUDENT PROFILE:
${JSON.stringify({
  name: user.name,
  education: careerProfile.education,
  college: user.college,
  branch: user.branch,
  graduationYear: user.graduationYear,
  targetRole: careerProfile.targetRole,
  domains: careerProfile.domains,
  skillLevels,
  techStack,
  githubData: githubData ? {
    repos: githubData.publicRepos,
    stars: githubData.totalStars,
    topLanguages: githubData.languages?.slice(0, 5),
    topRepos: githubData.repos?.slice(0, 5).map((r: any) => ({ name: r.name, language: r.language, stars: r.stars, desc: r.description })),
  } : null,
  placementTimeline: careerProfile.placementTimeline,
  challenge: assessmentSummary?.challenge,
}, null, 2)}

Return JSON:
{
  "overallScore": <0-100>,
  "level": "BEGINNER|INTERMEDIATE|ADVANCED|EXPERT",
  "careerMatches": [
    { "role": "", "matchScore": 0-100, "reason": "", "avgSalary": "", "companies": [] }
  ],
  "strengthAreas": ["strength1", "strength2"],
  "improvementAreas": ["area1", "area2"],
  "recommendations": ["actionable rec 1", "actionable rec 2"],
  "profileSummary": "",
  "readinessScore": 0-100,
  "focusAreas": ["area1", "area2"],
  "weeklyPlan": ["task1", "task2", "task3"]
}`);

  if (aiResult) {
    aiInsights = aiResult;
    overallScore = aiResult.overallScore || overallScore;
    careerMatches = aiResult.careerMatches || null;
    strengthAreas = aiResult.strengthAreas || [];
    improvementAreas = aiResult.improvementAreas || [];
    recommendations = aiResult.recommendations || [];
  } else {
    // Fallback heuristic career matches
    const role = assessmentSummary?.targetRole || 'Software Engineer (SDE)';
    careerMatches = [
      { role, matchScore: 75, reason: 'Based on your selected target role and skills', avgSalary: '8-15 LPA', companies: ['TCS', 'Infosys', 'Wipro', 'Startups'] },
      { role: 'Full Stack Developer', matchScore: 70, reason: 'Strong web dev interest matches this role', avgSalary: '6-18 LPA', companies: ['Startups', 'Product Companies'] },
      { role: 'Data Scientist', matchScore: 55, reason: 'Analytical skills can transition to data science', avgSalary: '8-20 LPA', companies: ['Analytics firms', 'Big Tech'] },
    ];
    strengthAreas = techStack.languages?.length > 0 ? [`Knows ${techStack.languages.join(', ')}`] : ['Eager to learn'];
    if (skillLevels.dsa >= 3) strengthAreas.push('Good DSA fundamentals');
    if (githubData?.publicRepos >= 5) strengthAreas.push('Active GitHub presence');
    improvementAreas = [];
    if (skillLevels.dsa < 3) improvementAreas.push('Improve DSA skills for placements');
    if (skillLevels.systemDesign < 3) improvementAreas.push('Learn system design basics');
    if (!githubData) improvementAreas.push('Connect GitHub to showcase projects');
    recommendations = ['Practice 2 DSA problems daily on LeetCode', 'Build 1 full-stack project this month', 'Prepare for behavioral interviews'];
  }

  const level = aiResult?.level || determineLevel(overallScore);

  // 9. Upsert ProfileAnalysis
  const existing = await prisma.profileAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const analysisData = {
    techStack: JSON.stringify(techStack),
    skillLevels: JSON.stringify(skillLevels),
    careerProfile: JSON.stringify(careerProfile),
    githubAnalysis: githubData ? JSON.stringify(githubData) : null,
    assessmentSummary: assessmentSummary ? JSON.stringify(assessmentSummary) : null,
    overallScore,
    level,
    aiInsights: aiInsights ? JSON.stringify(aiInsights) : null,
    careerMatches: JSON.stringify(careerMatches),
    strengthAreas: JSON.stringify(strengthAreas),
    improvementAreas: JSON.stringify(improvementAreas),
    recommendations: JSON.stringify(recommendations),
    version: (existing?.version || 0) + 1,
  };

  const analysis = existing
    ? await prisma.profileAnalysis.update({ where: { id: existing.id }, data: analysisData })
    : await prisma.profileAnalysis.create({ data: { userId, ...analysisData } });

  // 10. Award badges
  const badgeDefs = computeBadges(user, { ...analysis, skillLevels: JSON.stringify(skillLevels) }, githubData);
  for (const badge of badgeDefs) {
    try {
      await prisma.badge.upsert({
        where: { userId_name: { userId, name: badge.name } },
        create: { userId, ...badge },
        update: {},
      });
    } catch {
      // Badge already exists — skip
    }
  }

  const badges = await prisma.badge.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } });

  return {
    analysis,
    badges,
    githubData,
    parsed: {
      techStack,
      skillLevels,
      careerProfile,
      assessmentSummary,
      careerMatches,
      strengthAreas,
      improvementAreas,
      recommendations,
      aiInsights,
    },
  };
}

// ─── Get Latest Analysis (fast, no re-compute) ───────────
export async function getLatestAnalysis(userId: string) {
  const analysis = await prisma.profileAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const badges = await prisma.badge.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } });

  if (!analysis) return null;

  return {
    analysis,
    badges,
    parsed: {
      techStack: analysis.techStack ? JSON.parse(analysis.techStack) : null,
      skillLevels: analysis.skillLevels ? JSON.parse(analysis.skillLevels) : null,
      careerProfile: analysis.careerProfile ? JSON.parse(analysis.careerProfile) : null,
      githubAnalysis: analysis.githubAnalysis ? JSON.parse(analysis.githubAnalysis) : null,
      assessmentSummary: analysis.assessmentSummary ? JSON.parse(analysis.assessmentSummary) : null,
      careerMatches: analysis.careerMatches ? JSON.parse(analysis.careerMatches) : null,
      strengthAreas: analysis.strengthAreas ? JSON.parse(analysis.strengthAreas) : null,
      improvementAreas: analysis.improvementAreas ? JSON.parse(analysis.improvementAreas) : null,
      recommendations: analysis.recommendations ? JSON.parse(analysis.recommendations) : null,
      aiInsights: analysis.aiInsights ? JSON.parse(analysis.aiInsights) : null,
    },
  };
}
