export interface UserProfileSummary {
  name?: string;
  education?: string;
  interests?: string[];
  strengths?: string[];
  weaknesses?: string[];
  preferredWorkStyle?: string;
  motivation?: string;
  targetSalary?: string;
  skillRatings?: Record<string, number>;
}

export interface CareerExplanationRequest {
  profile: UserProfileSummary;
  quizInsights: Record<string, unknown>;
  topCareers: Array<{
    title: string;
    matchScore: number;
    description?: string;
    keySkills?: string[];
  }>;
}

export interface CareerExplanationResponse {
  careers: Array<{
    title: string;
    whyItFits: string;
    strengths: string[];
    weaknesses: string[];
    personalizedAdvice: string;
  }>;
}

export interface RoadmapRequest {
  careerTitle: string;
  seniority: 'beginner' | 'intermediate' | 'advanced';
  durationMonths?: number;
  profile: UserProfileSummary;
}

export interface RoadmapResponse {
  headline: string;
  months: Array<{
    month: number;
    theme: string;
    skills: string[];
    resources: string[];
    project: string;
  }>;
}

export interface GoalSuccessCriteriaRequest {
  milestoneTitle: string;
  durationWeeks: number;
  profile: UserProfileSummary;
}

export interface GoalSuccessCriteriaResponse {
  successCriteria: string;
  weeklyNudges: string[];
}

export interface JDComparatorRequest {
  jobTitle: string;
  company?: string;
  jobDescription: string;
  profile: UserProfileSummary;
  roadmapHighlights?: string[];
}

export interface JDComparatorResponse {
  summary: string;
  matches: string[];
  gaps: string[];
  fastTrackMilestones: string[];
  suggestions: string[];
}

export interface SkillMicroTaskRequest {
  weakSkills: Array<{ name: string; score: number }>;
}

export interface SkillMicroTaskResponse {
  heatmap: Array<{ name: string; score: number; sentiment: string }>;
  microTasks: Array<{
    skill: string;
    title: string;
    description: string;
    resourceUrl: string;
  }>;
}

export interface MentorChatRequest {
  round: 'career' | 'interview' | 'scholarship';
  message: string;
  context: UserProfileSummary & {
    currentCareerGoal?: string;
    recentMilestones?: string[];
    jdHighlights?: string[];
    domainFocus?: string;
    domainTheme?: {
      mission: string;
      personalityTag: string;
      aiHook: string;
      tone: string;
    };
    domainInterests?: Record<string, number>;
    recentInsights?: string[];
    assessmentSummary?: Record<string, unknown>;
  };
}

export interface MentorActionStep {
  title: string;
  detail: string;
  impact?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface MentorFollowUp {
  question: string;
  why: string;
}

export interface MentorChatResponse {
  headline: string;
  summary: string;
  actionPlan: MentorActionStep[];
  followUps: MentorFollowUp[];
  nudges: string[];
  confidence: number;
  references?: string[];
  tone?: string;
}

export interface MarketBriefResponse {
  title: string;
  deltaSummary: string;
  recommendations: string[];
}

// ============================================
// INTERVIEW PRACTICE AI TYPES
// ============================================

export interface InterviewQuestionGenerationRequest {
  type: 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'CODING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  role?: string;
  count?: number;
  profile?: UserProfileSummary;
}

export interface InterviewQuestionGenerationResponse {
  questions: Array<{
    questionText: string;
    questionType: string;
    difficulty: string;
    expectedAnswer: string;
    evaluationCriteria: string[];
    hints?: string[];
  }>;
}

export interface InterviewAnswerEvaluationRequest {
  questionText: string;
  questionType: string;
  userAnswer: string;
  expectedAnswer?: string;
  profile?: UserProfileSummary;
}

export interface InterviewAnswerEvaluationResponse {
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  starAnalysis?: {
    situation: string;
    task: string;
    action: string;
    result: string;
    score: number;
  };
  codeQuality?: {
    timeComplexity: string;
    spaceComplexity: string;
    codeStyle: string;
    edgeCases: string[];
    score: number;
  };
}

export interface SpeechAnalysisRequest {
  transcript: string;
  duration: number; // seconds
}

export interface SpeechAnalysisResponse {
  confidence: number; // 0-100
  fillerWords: { word: string; count: number }[];
  pace: string; // 'TOO_FAST', 'GOOD', 'TOO_SLOW'
  clarity: number; // 0-100
  suggestions: string[];
}

// ============================================
// PORTFOLIO / GITHUB ANALYSIS AI TYPES
// ============================================

export interface PortfolioAnalysisRequest {
  githubUsername?: string;
  repositories?: Array<{
    name: string;
    description?: string;
    language?: string;
    stars: number;
    forks: number;
    hasReadme: boolean;
    hasTests: boolean;
    hasCi: boolean;
    lastCommit?: string;
    readmeContent?: string;
    codeSnippets?: string[];
  }>;
  targetRole?: string;
  profile?: UserProfileSummary;
}

export interface PortfolioAnalysisResponse {
  overallScore: number; // 0-100
  codeQualityScore: number;
  diversityScore: number;
  contributionScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingProjectTypes: string[];
  recommendations: Array<{
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    impact: string;
  }>;
  repositoryInsights: Array<{
    repoName: string;
    score: number;
    codeQualityScore: number;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    readmeQuality: 'POOR' | 'GOOD' | 'EXCELLENT';
    improvements: string[];
    highlights: string[];
  }>;
  projectIdeas?: Array<{
    title: string;
    description: string;
    techStack: string[];
    impact: string;
  }>;
  developerType?: string;
  tag?: {
    tagName: string;
    description: string;
  };
}

// ============================================
// LINKEDIN PROFILE OPTIMIZER AI TYPES
// ============================================

export interface LinkedInOptimizationRequest {
  targetRole?: string;
  targetIndustry?: string;
  currentHeadline?: string;
  currentAbout?: string;
  currentExperience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    achievements?: string[];
  }>;
  skills?: string[];
  education?: string[];
  profile?: UserProfileSummary;
}

export interface LinkedInOptimizationResponse {
  optimizedHeadline: string;
  optimizedAbout: string;
  optimizedExperience?: Array<{
    title: string;
    company: string;
    duration: string;
    optimizedDescription: string;
    optimizedAchievements: string[];
    improvements: string[];
  }>;
  keywords: string[];
  overallScore: number; // 0-100
  beforeScore: number;
  afterScore: number;
  improvements: Array<{
    category: string;
    before: string;
    after: string;
    reason: string;
  }>;
  missingElements: string[];
  atsOptimizationTips: string[];
}

// ============================================
// CODING INTERVIEW AI TYPES
// ============================================

export interface CodingQuestionGenerationRequest {
  company: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  language: string;
  questionIndex: number;
  count?: number;
}

export interface CodingQuestion {
  problemStatement: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  difficulty: string;
  tags: string[];
  starterCode?: Record<string, string>;
}

export interface CodingQuestionGenerationResponse {
  questions: CodingQuestion[];
}

export interface CodeAnalysisRequest {
  problemStatement: string;
  code: string;
  language: string;
  testResults: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
  }>;
  timeTaken: number;
}

export interface CodeAnalysisResponse {
  score: number;
  feedback: string;
  correctness: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: number;
  edgeCaseHandling: number;
  namingConventions: number;
  strengths: string[];
  improvements: string[];
  optimalApproach?: string;
}

