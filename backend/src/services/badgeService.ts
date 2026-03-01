/**
 * Centralized Badge Service — checks all badge conditions and awards new badges.
 */
import prisma from '@lib/prisma';

interface BadgeDef {
  name: string;
  icon: string;
  description: string;
  category: string;
  rarity: string;
}

export const ALL_BADGES: BadgeDef[] = [
  // Profile badges (3)
  { name: 'Profile Complete', icon: 'person_check', description: 'Completed your tech profile setup', category: 'PROFILE', rarity: 'COMMON' },
  { name: 'GitHub Connected', icon: 'code', description: 'Connected your GitHub profile', category: 'PROFILE', rarity: 'COMMON' },
  { name: 'LinkedIn Linked', icon: 'link', description: 'Connected your LinkedIn profile', category: 'PROFILE', rarity: 'COMMON' },

  // Skill badges from assessment (2)
  { name: 'DSA Warrior', icon: 'functions', description: 'Rated 4+ in DSA & problem-solving', category: 'SKILL', rarity: 'RARE' },
  { name: 'Architect Mind', icon: 'architecture', description: 'Rated 4+ in system design', category: 'SKILL', rarity: 'RARE' },

  // GitHub badges (5)
  { name: 'Code Machine', icon: 'inventory_2', description: '10+ public repositories', category: 'ACHIEVEMENT', rarity: 'RARE' },
  { name: 'Open Source Champion', icon: 'emoji_events', description: '30+ public repositories', category: 'ACHIEVEMENT', rarity: 'EPIC' },
  { name: 'Star Collector', icon: 'star', description: '10+ total stars on repositories', category: 'ACHIEVEMENT', rarity: 'RARE' },
  { name: 'GitHub Celebrity', icon: 'celebration', description: '100+ total stars', category: 'ACHIEVEMENT', rarity: 'LEGENDARY' },
  { name: 'Polyglot Dev', icon: 'translate', description: 'Code in 5+ programming languages', category: 'SKILL', rarity: 'EPIC' },

  // Interview badges (2)
  { name: 'Interview Rookie', icon: 'record_voice_over', description: 'Completed your first interview session', category: 'ACHIEVEMENT', rarity: 'COMMON' },
  { name: 'Interview Pro', icon: 'mic', description: 'Completed 5 interview sessions', category: 'ACHIEVEMENT', rarity: 'RARE' },

  // Streak badges (1)
  { name: 'Streak Starter', icon: 'local_fire_department', description: 'Logged in 3 days in a row', category: 'STREAK', rarity: 'COMMON' },

  // Level badges (1)
  { name: 'Rising Star', icon: 'trending_up', description: 'Overall profile score 60+', category: 'ACHIEVEMENT', rarity: 'EPIC' },
];

async function computeEarnedBadges(userId: string): Promise<BadgeDef[]> {
  const earned: BadgeDef[] = [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileSetupCompleted: true,
      githubUsername: true,
      linkedinUrl: true,
    },
  });
  if (!user) return earned;

  // Profile badges
  if (user.profileSetupCompleted) {
    earned.push(ALL_BADGES.find(b => b.name === 'Profile Complete')!);
  }
  if (user.githubUsername) {
    earned.push(ALL_BADGES.find(b => b.name === 'GitHub Connected')!);
  }
  if (user.linkedinUrl) {
    earned.push(ALL_BADGES.find(b => b.name === 'LinkedIn Linked')!);
  }

  // Skill badges from latest analysis
  const analysis = await prisma.profileAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { skillLevels: true, overallScore: true, githubAnalysis: true },
  });

  if (analysis?.skillLevels) {
    try {
      const skills = JSON.parse(analysis.skillLevels);
      if (skills.dsa >= 4) earned.push(ALL_BADGES.find(b => b.name === 'DSA Warrior')!);
      if (skills.systemDesign >= 4) earned.push(ALL_BADGES.find(b => b.name === 'Architect Mind')!);
    } catch {}
  }

  // GitHub badges from analysis
  if (analysis?.githubAnalysis) {
    try {
      const gh = JSON.parse(analysis.githubAnalysis);
      if (gh.publicRepos >= 10) earned.push(ALL_BADGES.find(b => b.name === 'Code Machine')!);
      if (gh.publicRepos >= 30) earned.push(ALL_BADGES.find(b => b.name === 'Open Source Champion')!);
      if (gh.totalStars >= 10) earned.push(ALL_BADGES.find(b => b.name === 'Star Collector')!);
      if (gh.totalStars >= 100) earned.push(ALL_BADGES.find(b => b.name === 'GitHub Celebrity')!);
      if (gh.languages?.length >= 5) earned.push(ALL_BADGES.find(b => b.name === 'Polyglot Dev')!);
    } catch {}
  }

  // Level badge
  if (analysis?.overallScore && analysis.overallScore >= 60) {
    earned.push(ALL_BADGES.find(b => b.name === 'Rising Star')!);
  }

  // Interview badges
  const interviewCount = await prisma.interviewSession.count({
    where: { userId, status: 'COMPLETED' },
  });
  if (interviewCount >= 1) earned.push(ALL_BADGES.find(b => b.name === 'Interview Rookie')!);
  if (interviewCount >= 5) earned.push(ALL_BADGES.find(b => b.name === 'Interview Pro')!);

  // Streak badge — calculate from login logs
  const recentLogins = await prisma.loginLog.findMany({
    where: { userId, success: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { createdAt: true },
  });

  if (recentLogins.length > 0) {
    const uniqueDays = new Set(recentLogins.map(l => l.createdAt.toISOString().slice(0, 10)));
    const sortedDays = [...uniqueDays].sort().reverse();
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const curr = new Date(sortedDays[i - 1]);
      const prev = new Date(sortedDays[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1) streak++;
      else break;
    }
    if (streak >= 3) earned.push(ALL_BADGES.find(b => b.name === 'Streak Starter')!);
  }

  return earned.filter(Boolean);
}

export const badgeService = {
  /**
   * Check all badge conditions and award newly earned badges.
   * Returns only the badges that were newly awarded in this call.
   */
  async checkAndAward(userId: string): Promise<BadgeDef[]> {
    const earnedDefs = await computeEarnedBadges(userId);
    const newBadges: BadgeDef[] = [];

    for (const badge of earnedDefs) {
      try {
        const existing = await prisma.badge.findUnique({
          where: { userId_name: { userId, name: badge.name } },
        });
        if (!existing) {
          await prisma.badge.create({
            data: { userId, ...badge },
          });
          newBadges.push(badge);
        }
      } catch {
        // Badge already exists or other race condition — skip
      }
    }

    return newBadges;
  },
};
