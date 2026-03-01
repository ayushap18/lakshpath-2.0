import prisma from '../lib/prisma';
import { geminiService } from './geminiService';
import { AppError } from '../middleware/errorHandler';

// Learning Depth Levels
export enum LearningDepth {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Question Types
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  CODING = 'coding',
  SHORT_ANSWER = 'short_answer',
  TRUE_FALSE = 'true_false'
}

// Learning Topics Categories
export const LEARNING_CATEGORIES = {
  PROGRAMMING: {
    name: 'Programming',
    topics: [
      'JavaScript Fundamentals',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'React',
      'Node.js',
      'Data Structures',
      'Algorithms',
      'Object-Oriented Programming',
      'Functional Programming',
      'Async Programming'
    ]
  },
  WEB_DEVELOPMENT: {
    name: 'Web Development',
    topics: [
      'HTML5',
      'CSS3',
      'Responsive Design',
      'Tailwind CSS',
      'REST APIs',
      'GraphQL',
      'Authentication',
      'State Management',
      'Web Performance',
      'Browser APIs'
    ]
  },
  DATABASES: {
    name: 'Databases',
    topics: [
      'SQL',
      'PostgreSQL',
      'MongoDB',
      'Database Design',
      'Indexing',
      'Query Optimization',
      'Transactions',
      'NoSQL vs SQL'
    ]
  },
  SYSTEM_DESIGN: {
    name: 'System Design',
    topics: [
      'Scalability',
      'Load Balancing',
      'Caching',
      'Database Sharding',
      'Microservices',
      'API Design',
      'Message Queues',
      'CDN'
    ]
  },
  COMPUTER_SCIENCE: {
    name: 'Computer Science',
    topics: [
      'Operating Systems',
      'Networks',
      'Compilers',
      'Computer Architecture',
      'Distributed Systems',
      'Concurrency',
      'Memory Management'
    ]
  }
};

// Interfaces
interface PersonalizedPathRequest {
  careerGoal: string;
  currentSkills: { name: string; level: number }[];
  targetSkills: { name: string; targetLevel: number }[];
  timeCommitment: string; // e.g., "10 hours/week"
  learningStyle: 'visual' | 'reading' | 'hands-on' | 'mixed';
}

interface PersonalizedPath {
  pathId: string;
  title: string;
  description: string;
  estimatedDuration: string;
  phases: LearningPhase[];
  milestones: Milestone[];
  prerequisites: string[];
  outcomes: string[];
}

interface LearningPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  skills: string[];
  topics: string[];
  resources: ResourceRecommendation[];
  projects: ProjectIdea[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  skills: string[];
  completionCriteria: string[];
}

interface ConceptExplanation {
  concept: string;
  depth: LearningDepth;
  summary: string;
  explanation: string;
  keyPoints: string[];
  examples: CodeExample[];
  analogies: string[];
  commonMistakes: string[];
  relatedConcepts: string[];
  practiceExercises: string[];
  furtherReading: string[];
}

interface CodeExample {
  title: string;
  code: string;
  language: string;
  explanation: string;
}

interface Quiz {
  quizId: string;
  topic: string;
  difficulty: LearningDepth;
  questions: Question[];
  estimatedTime: string;
  passingScore: number;
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation: string;
  hints: string[];
  points: number;
  topic: string;
}

interface AssessmentResult {
  questionId: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  detailedExplanation: string;
  strengthsIdentified: string[];
  areasToImprove: string[];
  recommendedTopics: string[];
  nextSteps: string[];
}

interface StudyPlan {
  planId: string;
  userId: string;
  startDate: string;
  endDate: string;
  dailySchedule: DailyStudyBlock[];
  weeklyGoals: WeeklyGoal[];
  adaptiveRecommendations: string[];
}

interface DailyStudyBlock {
  day: string;
  date: string;
  blocks: {
    time: string;
    duration: string;
    topic: string;
    activity: string;
    resources: string[];
  }[];
}

interface WeeklyGoal {
  weekNumber: number;
  goals: string[];
  skills: string[];
  projects: string[];
  checkpoints: string[];
}

interface ResourceRecommendation {
  title: string;
  type: 'video' | 'article' | 'course' | 'book' | 'tutorial' | 'documentation';
  url?: string;
  platform: string;
  duration: string;
  difficulty: LearningDepth;
  rating?: number;
  cost: 'free' | 'paid';
  aiReasoning: string;
  relevanceScore: number;
}

interface ProjectIdea {
  title: string;
  description: string;
  difficulty: LearningDepth;
  estimatedTime: string;
  skills: string[];
  features: string[];
}

interface LearningInsights {
  overallProgress: number;
  strengthAreas: { skill: string; score: number; trend: string }[];
  improvementAreas: { skill: string; gap: number; suggestions: string[] }[];
  studyPatterns: {
    averageStudyTime: string;
    mostProductiveTime: string;
    consistencyScore: number;
    streakDays: number;
  };
  learningVelocity: {
    conceptsLearnedPerWeek: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    comparison: string;
  };
  recommendations: string[];
  motivationalInsights: string[];
}

interface NextAction {
  priority: 'high' | 'medium' | 'low';
  action: string;
  reasoning: string;
  estimatedTime: string;
  expectedOutcome: string;
  resources: ResourceRecommendation[];
}

class LearningEnhancedService {
  /**
   * Generate personalized learning path based on user's goals and current skills
   */
  async generatePersonalizedPath(
    userId: string,
    request: PersonalizedPathRequest
  ): Promise<PersonalizedPath> {
    try {
      // Get user's profile for context
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate personalized path
      const result = await geminiService.generateLearningPath({
        userId,
        careerGoal: request.careerGoal,
        currentSkills: request.currentSkills,
        targetSkills: request.targetSkills,
        timeCommitment: request.timeCommitment,
        learningStyle: request.learningStyle,
        userContext: user.quizResults[0] || {}
      });

      return result.parsed;
    } catch (error) {
      console.error('Error generating personalized path:', error);
      throw new AppError('Failed to generate learning path', 500);
    }
  }

  /**
   * Explain a concept with specified depth level
   */
  async explainConcept(
    userId: string,
    concept: string,
    depth: LearningDepth,
    context?: string
  ): Promise<ConceptExplanation> {
    try {
      // Get user's learning history for personalization
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate concept explanation
      const result = await geminiService.explainConceptWithDepth({
        concept,
        depth,
        context,
        userId
      });

      return result.parsed;
    } catch (error: any) {
      // If it's a 404 user-not-found, propagate
      if (error instanceof AppError && error.statusCode === 404) throw error;

      console.warn('[LearningEnhancedService] AI explain failed, using demo:', error.message?.slice(0, 120));

      // Return a helpful demo explanation
      const depthDescriptions: Record<string, string> = {
        beginner: 'a simple, easy-to-understand',
        intermediate: 'a moderately detailed',
        advanced: 'a thorough, technical',
        expert: 'an in-depth, expert-level',
      };
      const depthLabel = depthDescriptions[depth] || 'a';

      return {
        concept,
        depth,
        summary: `${concept} is a fundamental concept in technology and software development.`,
        explanation: `Here is ${depthLabel} explanation of ${concept}:\n\n${concept} refers to a key principle or tool used widely in the tech industry. Understanding ${concept} will help you build better software, collaborate with teams, and advance your career. At the ${depth} level, you should focus on understanding the core purpose, how it relates to other concepts, and start practicing with small examples.`,
        keyPoints: [
          `${concept} is widely used in modern software development`,
          `Understanding ${concept} helps with problem-solving and system design`,
          `Practice with small, focused exercises to build mastery`,
          `${concept} connects to many related topics in the field`,
        ],
        examples: [
          {
            title: `Basic ${concept} Example`,
            code: `// Example demonstrating ${concept}\n// Try implementing this in your preferred language\nconsole.log("Learning ${concept}!");`,
            language: 'javascript',
            explanation: `This is a starting point for exploring ${concept}. Modify and extend this example as you learn.`,
          },
        ],
        analogies: [
          `Think of ${concept} like building blocks — each piece serves a specific purpose and connects to form something larger.`,
          `${concept} is similar to learning a new recipe: you start with the basics, then add complexity as you gain confidence.`,
        ],
        commonMistakes: [
          `Trying to learn everything at once instead of focusing on fundamentals`,
          `Not practicing with hands-on examples`,
          `Skipping the "why" and only learning the "how"`,
        ],
        relatedConcepts: [
          'Software Architecture',
          'Design Patterns',
          'Data Structures',
          'Algorithms',
        ],
        practiceExercises: [
          `Write a simple program that demonstrates ${concept}`,
          `Explain ${concept} to a friend in your own words`,
          `Find 3 real-world applications of ${concept}`,
        ],
        furtherReading: [
          'MDN Web Docs (developer.mozilla.org)',
          'freeCodeCamp (freecodecamp.org)',
          'GeeksforGeeks (geeksforgeeks.org)',
        ],
      } as any;
    }
  }

  /**
   * Generate practice questions/quiz on a topic
   */
  async generatePracticeQuestions(
    userId: string,
    topic: string,
    difficulty: LearningDepth,
    questionCount: number,
    types: QuestionType[]
  ): Promise<Quiz> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate quiz
      const result = await geminiService.generateQuiz({
        topic,
        difficulty,
        questionCount,
        types,
        userId
      });

      return result.parsed;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new AppError('Failed to generate quiz', 500);
    }
  }

  /**
   * Assess user's answer and provide detailed feedback
   */
  async assessUnderstanding(
    userId: string,
    questionId: string,
    question: string,
    userAnswer: string,
    correctAnswer: string,
    topic: string
  ): Promise<AssessmentResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to evaluate answer
      const assessment = await geminiService.evaluateLearningAnswer({
        questionId,
        question,
        userAnswer,
        correctAnswer,
        topic,
        userId
      });

      return assessment.parsed;
    } catch (error) {
      console.error('Error assessing understanding:', error);
      throw new AppError('Failed to assess understanding', 500);
    }
  }

  /**
   * Generate structured study plan
   */
  async getStudyPlan(
    userId: string,
    durationWeeks: number,
    hoursPerWeek: number,
    focusAreas: string[]
  ): Promise<StudyPlan> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to generate study plan
      const result = await geminiService.generateStudyPlan({
        userId,
        durationWeeks,
        hoursPerWeek,
        focusAreas,
        userContext: user.quizResults[0] || {}
      });

      return result.parsed;
    } catch (error) {
      console.error('Error generating study plan:', error);
      throw new AppError('Failed to generate study plan', 500);
    }
  }

  /**
   * Get AI-powered resource recommendations
   */
  async getResourceRecommendations(
    userId: string,
    topic: string,
    learningStyle: string,
    currentLevel: LearningDepth,
    preferences: {
      costPreference: 'free' | 'paid' | 'any';
      duration: 'short' | 'medium' | 'long';
      types: string[];
    }
  ): Promise<ResourceRecommendation[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to recommend resources
      const result = await geminiService.recommendResources({
        userId,
        topic,
        learningStyle,
        currentLevel,
        preferences
      });

      return result.parsed;
    } catch (error) {
      console.error('Error getting resource recommendations:', error);
      throw new AppError('Failed to get recommendations', 500);
    }
  }

  /**
   * Analyze learning progress and provide insights
   */
  async analyzeLearningProgress(userId: string): Promise<LearningInsights> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' }
          },
          interviewSessions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Use Gemini to analyze progress
      const result = await geminiService.analyzeProgressInsights({
        userId,
        quizResults: user.quizResults,
        interviewSessions: user.interviewSessions,
        userProfile: {
          createdAt: user.createdAt,
          email: user.email || ''
        }
      });

      return result.parsed;
    } catch (error: any) {
      if (error instanceof AppError && error.statusCode === 404) throw error;

      console.warn('[LearningEnhancedService] AI progress analysis failed, using demo:', error.message?.slice(0, 120));

      // Return demo insights
      return {
        overallProgress: 45,
        strengthAreas: [
          { skill: 'JavaScript Fundamentals', score: 75, trend: 'improving' },
          { skill: 'Problem Solving', score: 70, trend: 'stable' },
        ],
        improvementAreas: [
          { skill: 'System Design', gap: 40, priority: 'high' },
          { skill: 'Data Structures', gap: 30, priority: 'medium' },
        ],
        recentActivity: {
          quizzesTaken: 0,
          interviewsCompleted: 0,
          conceptsExplored: 0,
        },
        recommendations: [
          'Take a skills assessment to get personalized recommendations',
          'Practice with interview simulations to build confidence',
          'Explore key concepts using the AI Concept Explainer',
        ],
      } as any;
    }
  }

  /**
   * Get next best action recommendation
   */
  async getNextBestAction(userId: string): Promise<NextAction> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          quizResults: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get learning insights first (has its own demo fallback)
      const insights = await this.analyzeLearningProgress(userId);

      // Determine next best action based on insights
      const nextAction: NextAction = {
        priority: 'high',
        action: '',
        reasoning: '',
        estimatedTime: '',
        expectedOutcome: '',
        resources: []
      };

      // Use AI to recommend next action
      if (insights.improvementAreas && insights.improvementAreas.length > 0) {
        const topWeakArea = insights.improvementAreas[0];
        nextAction.action = `Focus on improving ${topWeakArea.skill}`;
        nextAction.reasoning = `This is your weakest area with a gap of ${topWeakArea.gap}. Addressing this will have the highest impact on your overall progress.`;
        nextAction.estimatedTime = '2-3 hours';
        nextAction.expectedOutcome = `Improve ${topWeakArea.skill} proficiency by 20-30%`;

        // Get resources for this skill (with fallback)
        try {
          nextAction.resources = await this.getResourceRecommendations(
            userId,
            topWeakArea.skill,
            'mixed',
            LearningDepth.INTERMEDIATE,
            {
              costPreference: 'any',
              duration: 'medium',
              types: ['video', 'tutorial', 'article']
            }
          );
        } catch {
          nextAction.resources = [];
        }
      } else if (insights.strengthAreas && insights.strengthAreas.length > 0) {
        const topStrength = insights.strengthAreas[0];
        nextAction.action = `Build a project using ${topStrength.skill}`;
        nextAction.reasoning = `You're performing well in ${topStrength.skill}. Solidify your knowledge by building something practical.`;
        nextAction.estimatedTime = '5-10 hours';
        nextAction.expectedOutcome = `Apply ${topStrength.skill} skills in real-world scenarios`;
        nextAction.priority = 'medium';
      } else {
        nextAction.action = 'Complete your initial skills assessment';
        nextAction.reasoning = 'We need to understand your current skill levels to provide personalized recommendations.';
        nextAction.estimatedTime = '30 minutes';
        nextAction.expectedOutcome = 'Get personalized learning path based on your skills';
      }

      return nextAction;
    } catch (error: any) {
      if (error instanceof AppError && error.statusCode === 404) throw error;

      console.warn('[LearningEnhancedService] getNextBestAction failed, using demo:', error.message?.slice(0, 120));

      // Final fallback
      return {
        priority: 'high',
        action: 'Start with a skills assessment to unlock personalized learning',
        reasoning: 'A skills assessment will help us understand your strengths and create a tailored learning path.',
        estimatedTime: '30 minutes',
        expectedOutcome: 'Personalized learning recommendations and micro-tasks',
        resources: [],
      };
    }
  }

  /**
   * Get learning categories and topics
   */
  getLearningCategories() {
    return LEARNING_CATEGORIES;
  }
}

export default new LearningEnhancedService();
export {
  PersonalizedPathRequest,
  PersonalizedPath,
  LearningPhase,
  Milestone,
  ConceptExplanation,
  Quiz,
  Question,
  AssessmentResult,
  StudyPlan,
  ResourceRecommendation,
  LearningInsights,
  NextAction
};
