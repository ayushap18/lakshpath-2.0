import { geminiService } from './geminiService';
import { AppError } from '../middleware/errorHandler';

/**
 * NSQF Pathway Service
 * Inspired by ShikshaDisha - AI-Powered NSQF-Integrated Learning Ecosystem
 * 
 * Integrates National Skills Qualifications Framework (NSQF) aligned vocational pathways
 * with AI-powered personalized learning recommendations.
 */

// NSQF Levels (1-10)
export enum NSQFLevel {
  LEVEL_1 = 1,  // Class 5
  LEVEL_2 = 2,  // Class 8
  LEVEL_3 = 3,  // Class 10
  LEVEL_4 = 4,  // Class 12
  LEVEL_5 = 5,  // Diploma/Certificate (1 year after 12th)
  LEVEL_6 = 6,  // Advanced Diploma (2 years after 12th)
  LEVEL_7 = 7,  // Bachelor's Degree
  LEVEL_8 = 8,  // Postgraduate Diploma
  LEVEL_9 = 9,  // Master's Degree
  LEVEL_10 = 10 // PhD/Research
}

// Vocational Sectors
export const VOCATIONAL_SECTORS = {
  AGRICULTURE: 'Agriculture',
  AUTOMOTIVE: 'Automotive',
  BEAUTY_WELLNESS: 'Beauty & Wellness',
  CONSTRUCTION: 'Construction',
  ELECTRONICS_HARDWARE: 'Electronics & Hardware',
  FOOD_PROCESSING: 'Food Processing',
  FURNITURE_FITTINGS: 'Furniture & Fittings',
  GEMS_JEWELLERY: 'Gems & Jewellery',
  HANDICRAFTS: 'Handicrafts & Carpet',
  HEALTHCARE: 'Healthcare',
  IT_ITES: 'IT/ITeS',
  LEATHER: 'Leather',
  LOGISTICS: 'Logistics',
  MEDIA_ENTERTAINMENT: 'Media & Entertainment',
  PLUMBING: 'Plumbing',
  RETAIL: 'Retail',
  TELECOM: 'Telecom',
  TEXTILE_HANDLOOM: 'Textile & Handloom',
  TOURISM_HOSPITALITY: 'Tourism & Hospitality',
  BANKING_FINANCE: 'Banking & Finance'
};

interface NSQFProfile {
  userId: string;
  currentEducationLevel: string; // e.g., "Class 10", "Class 12", "Graduate"
  currentNSQFLevel: NSQFLevel;
  targetNSQFLevel: NSQFLevel;
  interests: string[]; // Vocational sectors of interest
  skills: string[];
  location: string;
  preferredLanguage: string;
  experienceYears: number;
  learningMode: 'online' | 'offline' | 'hybrid';
  budget: 'free' | 'low' | 'medium' | 'high';
}

interface NSQFCourse {
  courseId: string;
  title: string;
  description: string;
  nsqfLevel: NSQFLevel;
  sector: string;
  skills: string[];
  duration: string;
  certifyingBody: string;
  employabilityScore: number; // 0-100
  avgSalaryRange: string;
  courseProvider: string;
  mode: 'online' | 'offline' | 'hybrid';
  cost: string;
  language: string;
  prerequisites: string[];
}

interface VocationalPathway {
  pathwayId: string;
  title: string;
  description: string;
  sector: string;
  startLevel: NSQFLevel;
  targetLevel: NSQFLevel;
  totalDuration: string;
  stages: PathwayStage[];
  employmentOpportunities: string[];
  salaryProgression: {
    entry: string;
    midLevel: string;
    senior: string;
  };
  requiredInvestment: string;
  certifications: string[];
  governmentSchemes: string[];
}

interface PathwayStage {
  stageNumber: number;
  nsqfLevel: NSQFLevel;
  title: string;
  courses: NSQFCourse[];
  duration: string;
  outcomes: string[];
  jobRoles: string[];
}

interface EmployabilityPrediction {
  overallScore: number; // 0-100
  factors: {
    skillMatch: number;
    marketDemand: number;
    educationLevel: number;
    experienceWeight: number;
    locationAdvantage: number;
  };
  employmentProbability: number; // 0-1
  salaryPrediction: {
    min: number;
    max: number;
    median: number;
    currency: string;
  };
  timeToEmployment: string;
  topJobRoles: Array<{
    role: string;
    probability: number;
    avgSalary: string;
    openings: number;
  }>;
  recommendations: string[];
}

interface SkillGapAnalysis {
  requiredSkills: string[];
  currentSkills: string[];
  missingSkills: string[];
  transferableSkills: string[];
  gapPercentage: number;
  prioritySkills: Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    learningPath: string[];
    estimatedTime: string;
  }>;
}

class NSQFPathwayService {
  /**
   * Generate NSQF-aligned vocational pathway based on user profile
   */
  async generateVocationalPathway(
    userId: string,
    profile: NSQFProfile
  ): Promise<VocationalPathway> {
    try {
      const result = await geminiService.generateNSQFPathway({
        userId,
        profile,
        vocationalSectors: VOCATIONAL_SECTORS
      });
      return result.parsed;
    } catch (error: any) {
      console.error('Error generating vocational pathway:', error);
      // Return a static fallback pathway based on the profile inputs
      return this.buildFallbackPathway(profile);
    }
  }

  private buildFallbackPathway(profile: NSQFProfile): VocationalPathway {
    const levelDiff = profile.targetNSQFLevel - profile.currentNSQFLevel;
    const primaryInterest = (profile.interests[0] || 'IT/ITeS').toLowerCase();

    // Map frontend interest labels → canonical VOCATIONAL_SECTORS values
    const INTEREST_MAP: Record<string, string> = {
      'it': 'IT/ITeS', 'software': 'IT/ITeS', 'tech': 'IT/ITeS',
      'health': 'Healthcare', 'medical': 'Healthcare',
      'manufactur': 'Electronics & Hardware', 'electron': 'Electronics & Hardware',
      'construct': 'Construction',
      'agricultur': 'Agriculture', 'farm': 'Agriculture',
      'tourism': 'Tourism & Hospitality', 'hotel': 'Tourism & Hospitality', 'hospital': 'Tourism & Hospitality',
      'retail': 'Retail',
      'beauty': 'Beauty & Wellness', 'wellness': 'Beauty & Wellness',
      'auto': 'Automotive', 'vehicle': 'Automotive',
      'banking': 'Banking & Finance', 'finance': 'Banking & Finance',
      'telecom': 'Telecom', 'logis': 'Logistics',
      'media': 'Media & Entertainment', 'entertain': 'Media & Entertainment',
      'textile': 'Textile & Handloom', 'leather': 'Leather',
      'food': 'Food Processing',
    };

    const sector = Object.entries(INTEREST_MAP).find(([key]) =>
      primaryInterest.includes(key)
    )?.[1] || 'IT/ITeS';

    const stages: PathwayStage[] = [];
    for (let i = 0; i < Math.min(levelDiff, 4); i++) {
      const lvl: NSQFLevel = (profile.currentNSQFLevel + i + 1) as NSQFLevel;
      stages.push({
        stageNumber: i + 1,
        nsqfLevel: lvl,
        title: `Level ${lvl} — ${sector}`,
        courses: [{
          courseId: `course-${lvl}-${i}`,
          title: `${sector} Foundation — Level ${lvl}`,
          description: `NSQF Level ${lvl} certified programme in ${sector}`,
          nsqfLevel: lvl,
          sector,
          skills: ['Communication', 'Digital Literacy', 'Domain Knowledge'],
          duration: '3 months',
          certifyingBody: 'NSDC / NCVT',
          employabilityScore: 70 + i * 5,
          avgSalaryRange: `₹${(15 + i * 5)},000 - ₹${(25 + i * 10)},000/month`,
          courseProvider: 'Skill India Digital',
          mode: profile.learningMode,
          cost: profile.budget === 'free' ? '₹0 (Govt funded)' : '₹5,000 - ₹15,000',
          language: profile.preferredLanguage,
          prerequisites: i === 0 ? [] : [`Level ${lvl - 1} certificate`]
        }],
        duration: `${3 + i} months`,
        outcomes: [`NSQF Level ${lvl} certificate`, 'Job-ready skills'],
        jobRoles: ['Entry-level practitioner', 'Skilled technician']
      });
    }

    return {
      pathwayId: `fallback-${Date.now()}`,
      title: `${sector} Career Pathway`,
      description: `A structured ${levelDiff}-level pathway from NSQF Level ${profile.currentNSQFLevel} to Level ${profile.targetNSQFLevel} in the ${sector} sector. Complete each stage to unlock higher-paying roles.`,
      sector,
      startLevel: profile.currentNSQFLevel,
      targetLevel: profile.targetNSQFLevel,
      totalDuration: `${levelDiff * 4} months`,
      stages,
      employmentOpportunities: [
        `Entry: ${sector} Trainee / Helper`,
        `Mid: ${sector} Associate / Technician`,
        `Senior: ${sector} Specialist / Team Lead`
      ],
      salaryProgression: {
        entry: '₹10,000 - ₹18,000/month',
        midLevel: '₹20,000 - ₹40,000/month',
        senior: '₹45,000 - ₹80,000/month'
      },
      requiredInvestment: profile.budget === 'free' ? 'Free (Govt funded via PMKVY)' : '₹15,000 - ₹50,000 total',
      certifications: ['NSQF Certificate', 'NSDC Certificate', 'Skill India Digital Badge'],
      governmentSchemes: [
        'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
        'National Apprenticeship Promotion Scheme (NAPS)',
        'DDU-GKY (Rural Youth)',
        'Jan Shikshan Sansthan'
      ]
    };
  }

  /**
   * Predict employability based on profile and pathway
   */
  async predictEmployability(
    userId: string,
    profile: NSQFProfile,
    targetSector: string
  ): Promise<EmployabilityPrediction> {
    try {
      const result = await geminiService.predictNSQFEmployability({
        userId,
        profile,
        targetSector,
        marketData: await this.getMarketIntelligence(targetSector)
      });

      return result.parsed;
    } catch (error) {
      console.error('Error predicting employability:', error);
      throw new AppError('Failed to predict employability', 500);
    }
  }

  /**
   * Perform skill gap analysis for target role
   */
  async analyzeSkillGap(
    userId: string,
    currentSkills: string[],
    targetRole: string,
    targetSector: string
  ): Promise<SkillGapAnalysis> {
    try {
      const result = await geminiService.analyzeNSQFSkillGap({
        userId,
        currentSkills,
        targetRole,
        targetSector
      });

      return result.parsed;
    } catch (error) {
      console.error('Error analyzing skill gap:', error);
      throw new AppError('Failed to analyze skill gap', 500);
    }
  }

  /**
   * Get course recommendations based on NSQF profile
   */
  async getRecommendedCourses(
    userId: string,
    profile: NSQFProfile,
    limit: number = 10
  ): Promise<NSQFCourse[]> {
    try {
      const result = await geminiService.recommendNSQFCourses({
        userId,
        profile,
        limit
      });

      return result.parsed;
    } catch (error) {
      console.error('Error getting course recommendations:', error);
      throw new AppError('Failed to get course recommendations', 500);
    }
  }

  /**
   * Get career progression forecast (3-5 years)
   */
  async getCareerForecast(
    userId: string,
    profile: NSQFProfile,
    targetSector: string,
    yearsAhead: number = 5
  ): Promise<any> {
    try {
      const result = await geminiService.forecastNSQFCareer({
        userId,
        profile,
        targetSector,
        yearsAhead
      });

      return result.parsed;
    } catch (error) {
      console.error('Error forecasting career:', error);
      throw new AppError('Failed to forecast career', 500);
    }
  }

  /**
   * Get applicable government schemes for user profile
   */
  async getGovernmentSchemes(
    userId: string,
    profile: NSQFProfile
  ): Promise<any[]> {
    try {
      const result = await geminiService.getApplicableSchemes({
        userId,
        profile
      });

      return result.parsed;
    } catch (error) {
      console.error('Error getting government schemes:', error);
      throw new AppError('Failed to get government schemes', 500);
    }
  }

  /**
   * Identify transferable skills for career transition
   */
  async identifyTransferableSkills(
    userId: string,
    currentSector: string,
    targetSector: string,
    currentSkills: string[]
  ): Promise<any> {
    try {
      const result = await geminiService.analyzeTransferableSkills({
        userId,
        currentSector,
        targetSector,
        currentSkills
      });

      return result.parsed;
    } catch (error) {
      console.error('Error identifying transferable skills:', error);
      throw new AppError('Failed to identify transferable skills', 500);
    }
  }

  /**
   * Get market intelligence for sector
   */
  private async getMarketIntelligence(sector: string): Promise<any> {
    // In production, this would fetch real-time data from APIs
    // For now, return structured data
    return {
      sector,
      demandTrend: 'increasing',
      avgSalary: '₹3-8 LPA',
      jobOpenings: 15000,
      topSkills: [],
      topEmployers: [],
      growthRate: '15% YoY'
    };
  }

  /**
   * Get all vocational sectors
   */
  getVocationalSectors() {
    return VOCATIONAL_SECTORS;
  }

  /**
   * Get NSQF level information
   */
  getNSQFLevelInfo(level: NSQFLevel): any {
    const levelInfo: Record<number, any> = {
      1: { education: 'Class 5', description: 'Basic functional literacy', typical: 'Entry level jobs' },
      2: { education: 'Class 8', description: 'Basic practical skills', typical: 'Semi-skilled jobs' },
      3: { education: 'Class 10', description: 'Practical skills with some theory', typical: 'Skilled jobs' },
      4: { education: 'Class 12', description: 'Vocational education with theory', typical: 'Supervisory roles' },
      5: { education: '1 year after 12th', description: 'Certificate/Diploma', typical: 'Technical roles' },
      6: { education: '2 years after 12th', description: 'Advanced Diploma', typical: 'Senior technical roles' },
      7: { education: "Bachelor's Degree", description: 'Professional knowledge', typical: 'Professional roles' },
      8: { education: 'PG Diploma', description: 'Specialized knowledge', typical: 'Specialist roles' },
      9: { education: "Master's Degree", description: 'Advanced expertise', typical: 'Expert/Manager roles' },
      10: { education: 'PhD/Research', description: 'Research & innovation', typical: 'Research/Leadership roles' }
    };
    return levelInfo[level] || {};
  }
}

export default new NSQFPathwayService();
export {
  NSQFProfile,
  NSQFCourse,
  VocationalPathway,
  PathwayStage,
  EmployabilityPrediction,
  SkillGapAnalysis
};
