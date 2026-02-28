// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Assessment Types
export interface Question {
  id: string;
  category: 'demographics' | 'interests' | 'skills' | 'preferences' | 'expectations' | 'learning' | 'goals';
  question: string;
  type: 'single-choice' | 'multiple-choice' | 'rating' | 'text';
  options?: string[];
  required: boolean;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[] | number;
}

export interface AssessmentResult {
  userId: string;
  careerMatches: CareerMatch[];
  skillGaps: SkillGap[];
  learningRoadmap: Roadmap;
  completedAt: string;
}

// Career Types
export interface CareerMatch {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  avgSalary: string;
  demand: 'high' | 'medium' | 'low';
  growthRate: string;
  requiredSkills: string[];
  reasoning: string;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  courses: Course[];
}

// Roadmap Types
export interface Roadmap {
  id: string;
  userId: string;
  careerTitle: string;
  totalDuration: string;
  progress: number;
  phases: Phase[];
  createdAt: string;
  updatedAt: string;
}

export interface Phase {
  id: string;
  name: string;
  duration: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  estimatedTime: string;
  resources: Resource[];
  order: number;
}

export interface Resource {
  id: string;
  title: string;
  platform: string;
  type: 'course' | 'video' | 'article' | 'book' | 'project';
  url: string;
  duration?: string;
  cost: 'free' | 'paid';
}

export interface Course {
  id: string;
  title: string;
  platform: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  url: string;
  cost: number;
}

// Dashboard Types
export interface UserProgress {
  coursesCompleted: number;
  skillsAcquired: number;
  topMatchPercentage: number;
  streakDays: number;
  progressPercentage: number;
  targetCareer: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionPlan?: { title: string; detail: string; impact?: string; priority?: string }[];
  followUps?: { question: string; why: string }[];
}

// Market & Job Types
export interface MarketBrief {
  topSkills: { name: string; demand: number; growth: string }[];
  emergingRoles: { title: string; avgSalary: string; growth: string }[];
  industryTrends: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  matchScore: number;
  skills: string[];
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  postedDate: string;
}

// Micro-Coach Types
export interface MicroCoachTask {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'practice' | 'reading' | 'project';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  completed: boolean;
  skill: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}
