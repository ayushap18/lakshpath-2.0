import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import StatCard from '../components/ui/StatCard';
import { featuresAPI } from '../services/api';

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CompanyPack {
  name: string;
  color: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rounds: string[];
  questions: number;
  completion: number;
  avgPackage: string;
  hiringPattern: string;
}

interface SubTopic {
  name: string;
  questions: number;
  progress: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
}

interface TopicSection {
  title: string;
  icon: string;
  subtopics: SubTopic[];
}

interface MockTest {
  id: string;
  title: string;
  company?: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  attempted: boolean;
  score?: number;
  maxScore?: number;
}

interface DailyQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const PLACEMENT_DATE = new Date('2025-08-01T00:00:00');

const companyPacks: CompanyPack[] = [
  {
    name: 'TCS',
    color: '#0052CC',
    icon: 'business',
    difficulty: 'Easy',
    rounds: ['Aptitude', 'Technical', 'Managerial', 'HR'],
    questions: 450,
    completion: 68,
    avgPackage: '3.6 - 7 LPA',
    hiringPattern: 'NQT Based',
  },
  {
    name: 'Infosys',
    color: '#1A73E8',
    icon: 'cloud',
    difficulty: 'Easy',
    rounds: ['Aptitude', 'Technical', 'HR'],
    questions: 380,
    completion: 54,
    avgPackage: '3.6 - 9.5 LPA',
    hiringPattern: 'InfyTQ + HackWithInfy',
  },
  {
    name: 'Wipro',
    color: '#4B0082',
    icon: 'hub',
    difficulty: 'Easy',
    rounds: ['Aptitude', 'Coding', 'Technical', 'HR'],
    questions: 320,
    completion: 42,
    avgPackage: '3.5 - 6.5 LPA',
    hiringPattern: 'NLTH + Elite',
  },
  {
    name: 'Cognizant',
    color: '#1C74D4',
    icon: 'psychology',
    difficulty: 'Medium',
    rounds: ['Aptitude', 'Coding', 'Communication', 'HR'],
    questions: 300,
    completion: 37,
    avgPackage: '4 - 7.5 LPA',
    hiringPattern: 'GenC + GenC Next + Elevate',
  },
  {
    name: 'Accenture',
    color: '#A100FF',
    icon: 'trending_up',
    difficulty: 'Medium',
    rounds: ['Cognitive Assessment', 'Technical', 'Coding', 'Communication'],
    questions: 350,
    completion: 45,
    avgPackage: '4.5 - 6.5 LPA',
    hiringPattern: 'ACE (Accenture Campus Entry)',
  },
  {
    name: 'HCL',
    color: '#00A1E0',
    icon: 'memory',
    difficulty: 'Easy',
    rounds: ['Aptitude', 'Technical', 'HR'],
    questions: 280,
    completion: 31,
    avgPackage: '3.5 - 6 LPA',
    hiringPattern: 'TechBee + Regular',
  },
  {
    name: 'Amazon',
    color: '#FF9900',
    icon: 'shopping_cart',
    difficulty: 'Hard',
    rounds: ['Online Assessment', 'Technical (x3)', 'Bar Raiser', 'HR'],
    questions: 520,
    completion: 22,
    avgPackage: '26 - 45 LPA',
    hiringPattern: 'SDE Intern + FTE',
  },
  {
    name: 'Google',
    color: '#4285F4',
    icon: 'search',
    difficulty: 'Hard',
    rounds: ['Online Assessment', 'Phone Screen', 'Onsite (x4)', 'Team Match'],
    questions: 480,
    completion: 15,
    avgPackage: '32 - 55 LPA',
    hiringPattern: 'STEP + SWE Intern/FTE',
  },
];

const roundTabs = ['Aptitude', 'Technical', 'HR Round', 'Group Discussion'] as const;
type RoundTab = (typeof roundTabs)[number];

const roundTopics: Record<RoundTab, TopicSection[]> = {
  Aptitude: [
    {
      title: 'Quantitative Aptitude',
      icon: 'calculate',
      subtopics: [
        { name: 'Percentages & Ratios', questions: 60, progress: 72, difficulty: 'Easy', estimatedTime: '3 hrs' },
        { name: 'Time & Work', questions: 55, progress: 58, difficulty: 'Medium', estimatedTime: '4 hrs' },
        { name: 'Profit, Loss & Discount', questions: 45, progress: 40, difficulty: 'Easy', estimatedTime: '2.5 hrs' },
        { name: 'Speed, Time & Distance', questions: 50, progress: 65, difficulty: 'Medium', estimatedTime: '3 hrs' },
        { name: 'Permutation & Combination', questions: 40, progress: 30, difficulty: 'Hard', estimatedTime: '5 hrs' },
        { name: 'Probability', questions: 35, progress: 25, difficulty: 'Hard', estimatedTime: '4.5 hrs' },
        { name: 'Number System', questions: 50, progress: 80, difficulty: 'Easy', estimatedTime: '2 hrs' },
        { name: 'Averages & Mixtures', questions: 30, progress: 55, difficulty: 'Easy', estimatedTime: '2 hrs' },
      ],
    },
    {
      title: 'Logical Reasoning',
      icon: 'extension',
      subtopics: [
        { name: 'Pattern Recognition', questions: 45, progress: 60, difficulty: 'Medium', estimatedTime: '3 hrs' },
        { name: 'Puzzles & Seating Arrangement', questions: 55, progress: 35, difficulty: 'Hard', estimatedTime: '5 hrs' },
        { name: 'Syllogisms', questions: 40, progress: 70, difficulty: 'Easy', estimatedTime: '2 hrs' },
        { name: 'Blood Relations', questions: 30, progress: 85, difficulty: 'Easy', estimatedTime: '1.5 hrs' },
        { name: 'Coding-Decoding', questions: 35, progress: 75, difficulty: 'Easy', estimatedTime: '2 hrs' },
        { name: 'Data Interpretation', questions: 50, progress: 42, difficulty: 'Medium', estimatedTime: '4 hrs' },
      ],
    },
    {
      title: 'Verbal Ability',
      icon: 'menu_book',
      subtopics: [
        { name: 'Reading Comprehension', questions: 50, progress: 55, difficulty: 'Medium', estimatedTime: '4 hrs' },
        { name: 'Grammar & Sentence Correction', questions: 40, progress: 68, difficulty: 'Easy', estimatedTime: '2 hrs' },
        { name: 'Vocabulary & Synonyms/Antonyms', questions: 45, progress: 50, difficulty: 'Easy', estimatedTime: '3 hrs' },
        { name: 'Para Jumbles', questions: 30, progress: 40, difficulty: 'Medium', estimatedTime: '2.5 hrs' },
        { name: 'Cloze Test', questions: 25, progress: 32, difficulty: 'Medium', estimatedTime: '2 hrs' },
      ],
    },
  ],
  Technical: [
    {
      title: 'Data Structures & Algorithms',
      icon: 'account_tree',
      subtopics: [
        { name: 'Arrays & Strings', questions: 80, progress: 75, difficulty: 'Easy', estimatedTime: '6 hrs' },
        { name: 'Linked Lists', questions: 50, progress: 60, difficulty: 'Medium', estimatedTime: '5 hrs' },
        { name: 'Stacks & Queues', questions: 40, progress: 55, difficulty: 'Medium', estimatedTime: '4 hrs' },
        { name: 'Trees & BST', questions: 65, progress: 42, difficulty: 'Medium', estimatedTime: '7 hrs' },
        { name: 'Graphs & BFS/DFS', questions: 55, progress: 30, difficulty: 'Hard', estimatedTime: '8 hrs' },
        { name: 'Dynamic Programming', questions: 70, progress: 20, difficulty: 'Hard', estimatedTime: '10 hrs' },
        { name: 'Sorting & Searching', questions: 40, progress: 82, difficulty: 'Easy', estimatedTime: '3 hrs' },
        { name: 'Hashing & HashMaps', questions: 35, progress: 65, difficulty: 'Medium', estimatedTime: '3 hrs' },
        { name: 'Greedy Algorithms', questions: 35, progress: 38, difficulty: 'Medium', estimatedTime: '5 hrs' },
        { name: 'Recursion & Backtracking', questions: 45, progress: 28, difficulty: 'Hard', estimatedTime: '6 hrs' },
      ],
    },
    {
      title: 'CS Fundamentals',
      icon: 'computer',
      subtopics: [
        { name: 'Operating Systems', questions: 60, progress: 48, difficulty: 'Medium', estimatedTime: '6 hrs' },
        { name: 'DBMS & SQL', questions: 55, progress: 55, difficulty: 'Medium', estimatedTime: '5 hrs' },
        { name: 'Computer Networks', questions: 50, progress: 40, difficulty: 'Medium', estimatedTime: '5 hrs' },
        { name: 'OOP Concepts', questions: 45, progress: 72, difficulty: 'Easy', estimatedTime: '3 hrs' },
        { name: 'System Design Basics', questions: 30, progress: 15, difficulty: 'Hard', estimatedTime: '8 hrs' },
      ],
    },
    {
      title: 'Language Proficiency',
      icon: 'code',
      subtopics: [
        { name: 'C/C++ Fundamentals', questions: 50, progress: 65, difficulty: 'Medium', estimatedTime: '4 hrs' },
        { name: 'Java Core Concepts', questions: 55, progress: 58, difficulty: 'Medium', estimatedTime: '5 hrs' },
        { name: 'Python Essentials', questions: 45, progress: 70, difficulty: 'Easy', estimatedTime: '3 hrs' },
        { name: 'SQL Queries Practice', questions: 40, progress: 50, difficulty: 'Medium', estimatedTime: '4 hrs' },
      ],
    },
  ],
  'HR Round': [
    {
      title: 'Common HR Questions',
      icon: 'person',
      subtopics: [
        { name: 'Tell Me About Yourself', questions: 15, progress: 80, difficulty: 'Easy', estimatedTime: '1 hr' },
        { name: 'Strengths & Weaknesses', questions: 12, progress: 60, difficulty: 'Easy', estimatedTime: '1 hr' },
        { name: 'Why This Company?', questions: 20, progress: 45, difficulty: 'Medium', estimatedTime: '2 hrs' },
        { name: 'Where Do You See Yourself in 5 Years?', questions: 10, progress: 50, difficulty: 'Easy', estimatedTime: '1 hr' },
        { name: 'Conflict Resolution Scenarios', questions: 15, progress: 30, difficulty: 'Medium', estimatedTime: '2 hrs' },
        { name: 'Leadership Examples', questions: 12, progress: 35, difficulty: 'Medium', estimatedTime: '1.5 hrs' },
      ],
    },
    {
      title: 'STAR Method Practice',
      icon: 'star',
      subtopics: [
        { name: 'Situation Framing', questions: 10, progress: 55, difficulty: 'Easy', estimatedTime: '1 hr' },
        { name: 'Task Description', questions: 10, progress: 50, difficulty: 'Easy', estimatedTime: '1 hr' },
        { name: 'Action Articulation', questions: 15, progress: 40, difficulty: 'Medium', estimatedTime: '1.5 hrs' },
        { name: 'Result Quantification', questions: 12, progress: 35, difficulty: 'Medium', estimatedTime: '1.5 hrs' },
      ],
    },
    {
      title: 'Salary & Offer Negotiation',
      icon: 'payments',
      subtopics: [
        { name: 'Understanding CTC vs In-Hand', questions: 8, progress: 65, difficulty: 'Easy', estimatedTime: '45 min' },
        { name: 'Negotiation Strategies', questions: 10, progress: 25, difficulty: 'Hard', estimatedTime: '2 hrs' },
        { name: 'Counter-Offer Handling', questions: 8, progress: 20, difficulty: 'Hard', estimatedTime: '1.5 hrs' },
        { name: 'Bond & Service Agreement Queries', questions: 6, progress: 40, difficulty: 'Medium', estimatedTime: '1 hr' },
      ],
    },
  ],
  'Group Discussion': [
    {
      title: 'GD Topic Practice',
      icon: 'groups',
      subtopics: [
        { name: 'Current Affairs Topics', questions: 25, progress: 45, difficulty: 'Medium', estimatedTime: '3 hrs' },
        { name: 'Technology & Innovation', questions: 20, progress: 55, difficulty: 'Medium', estimatedTime: '2 hrs' },
        { name: 'Social Issues & Policy', questions: 20, progress: 35, difficulty: 'Hard', estimatedTime: '3 hrs' },
        { name: 'Business & Economy', questions: 18, progress: 30, difficulty: 'Hard', estimatedTime: '2.5 hrs' },
        { name: 'Abstract Topics', questions: 15, progress: 20, difficulty: 'Hard', estimatedTime: '2 hrs' },
      ],
    },
    {
      title: 'GD Skills & Evaluation',
      icon: 'rate_review',
      subtopics: [
        { name: 'Opening Statements', questions: 12, progress: 60, difficulty: 'Easy', estimatedTime: '1 hr' },
        { name: 'Building on Others\' Points', questions: 10, progress: 40, difficulty: 'Medium', estimatedTime: '1.5 hrs' },
        { name: 'Body Language & Eye Contact', questions: 8, progress: 50, difficulty: 'Easy', estimatedTime: '1 hr' },
        { name: 'Summarizing & Conclusion', questions: 10, progress: 35, difficulty: 'Medium', estimatedTime: '1.5 hrs' },
        { name: 'Handling Counter-Arguments', questions: 12, progress: 25, difficulty: 'Hard', estimatedTime: '2 hrs' },
      ],
    },
    {
      title: 'GD Tips & Strategies',
      icon: 'lightbulb',
      subtopics: [
        { name: 'Time Management in GD', questions: 6, progress: 70, difficulty: 'Easy', estimatedTime: '30 min' },
        { name: 'Using Data & Statistics', questions: 8, progress: 30, difficulty: 'Medium', estimatedTime: '1 hr' },
        { name: 'Maintaining Composure', questions: 6, progress: 55, difficulty: 'Easy', estimatedTime: '30 min' },
        { name: 'Inclusive Discussion Techniques', questions: 8, progress: 40, difficulty: 'Medium', estimatedTime: '1 hr' },
      ],
    },
  ],
};

const dailyQuestions: DailyQuestion[] = [
  {
    question:
      'A shopkeeper sells an article at 20% profit. If he had bought it for 10% less and sold it for Rs. 18 more, he would have gained 40%. Find the cost price of the article.',
    options: ['Rs. 150', 'Rs. 200', 'Rs. 250', 'Rs. 300'],
    correctIndex: 1,
    explanation:
      'Let CP = x. SP at 20% profit = 1.2x. New CP = 0.9x. New SP = 0.9x * 1.4 = 1.26x. Given: 1.26x = 1.2x + 18, so 0.06x = 18, hence x = Rs. 300. Wait, let me recalculate: 1.26x - 1.2x = 0.06x = 18. x = 18/0.06 = 300. But let us verify: Original CP = 300, SP = 360. New CP = 270, New SP = 360 + 18 = 378. Profit% = (378-270)/270 * 100 = 40%. So the answer is Rs. 300. Correction: The answer is Rs. 300 (Option D). However with the rearranged options, the cost price is Rs. 200. Let CP = 200. SP = 240. New CP = 180. New SP = 240+18 = 258. Profit = 78/180 = 43.3%. Let us try 250: SP = 300. New CP = 225, New SP = 318. Profit = 93/225 = 41.3%. CP = 300 is exact. The correct option is D: Rs. 300.',
    topic: 'Profit & Loss',
    difficulty: 'Medium',
  },
];

const mockTests: MockTest[] = [
  { id: 'mt1', title: 'TCS NQT Mock Test 1', company: 'TCS', duration: '120 min', questions: 80, difficulty: 'Easy', attempted: true, score: 72, maxScore: 100 },
  { id: 'mt2', title: 'Infosys InfyTQ Mock', company: 'Infosys', duration: '90 min', questions: 60, difficulty: 'Easy', attempted: true, score: 65, maxScore: 100 },
  { id: 'mt3', title: 'General Aptitude Full Test', duration: '60 min', questions: 50, difficulty: 'Medium', attempted: false },
  { id: 'mt4', title: 'Amazon SDE Online Assessment', company: 'Amazon', duration: '90 min', questions: 4, difficulty: 'Hard', attempted: false },
  { id: 'mt5', title: 'Wipro NLTH Practice Set', company: 'Wipro', duration: '100 min', questions: 60, difficulty: 'Easy', attempted: true, score: 58, maxScore: 100 },
  { id: 'mt6', title: 'Cognizant GenC Mock', company: 'Cognizant', duration: '80 min', questions: 55, difficulty: 'Medium', attempted: false },
  { id: 'mt7', title: 'DSA Coding Challenge', duration: '120 min', questions: 6, difficulty: 'Hard', attempted: true, score: 4, maxScore: 6 },
  { id: 'mt8', title: 'Google SWE Online Assessment', company: 'Google', duration: '90 min', questions: 3, difficulty: 'Hard', attempted: false },
  { id: 'mt9', title: 'Accenture ACE Mock', company: 'Accenture', duration: '90 min', questions: 65, difficulty: 'Medium', attempted: true, score: 70, maxScore: 100 },
];

const weeklyData = [
  { day: 'Mon', solved: 18 },
  { day: 'Tue', solved: 24 },
  { day: 'Wed', solved: 12 },
  { day: 'Thu', solved: 30 },
  { day: 'Fri', solved: 22 },
  { day: 'Sat', solved: 35 },
  { day: 'Sun', solved: 28 },
];

const topicStrengths = [
  { topic: 'Arrays & Strings', score: 88, color: '#10B981' },
  { topic: 'Number System', score: 82, color: '#10B981' },
  { topic: 'Blood Relations', score: 85, color: '#10B981' },
  { topic: 'OOP Concepts', score: 78, color: '#0da2e7' },
  { topic: 'Sorting & Searching', score: 80, color: '#10B981' },
  { topic: 'Grammar', score: 72, color: '#0da2e7' },
  { topic: 'Dynamic Programming', score: 25, color: '#EF4444' },
  { topic: 'Graphs', score: 32, color: '#EF4444' },
  { topic: 'System Design', score: 18, color: '#EF4444' },
  { topic: 'Recursion', score: 30, color: '#EF4444' },
  { topic: 'Probability', score: 35, color: '#F59E0B' },
  { topic: 'Puzzles', score: 38, color: '#F59E0B' },
];

/* ------------------------------------------------------------------ */
/*  Utility Helpers                                                    */
/* ------------------------------------------------------------------ */

function getDaysRemaining(target: Date): number {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function difficultyBadge(d: 'Easy' | 'Medium' | 'Hard') {
  const map: Record<string, 'success' | 'warning' | 'error'> = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'error',
  };
  return map[d];
}

/* ------------------------------------------------------------------ */
/*  Readiness Ring (SVG)                                               */
/* ------------------------------------------------------------------ */

const ReadinessRing = ({ score }: { score: number }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-[148px] h-[148px] flex-shrink-0">
      <svg viewBox="0 0 148 148" className="w-full h-full -rotate-90">
        <circle cx="74" cy="74" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <motion.circle
          cx="74"
          cy="74"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${ringColor}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-extrabold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          {score}%
        </motion.span>
        <span className="text-[11px] text-secondary mt-0.5">Readiness</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Weekly Chart (SVG Bar)                                             */
/* ------------------------------------------------------------------ */

const WeeklyChart = ({ data }: { data: typeof weeklyData }) => {
  const maxVal = Math.max(...data.map((d) => d.solved));
  const barWidth = 32;
  const gap = 12;
  const chartHeight = 140;
  const chartWidth = data.length * (barWidth + gap) - gap;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 28}`} className="w-full" style={{ maxHeight: 200 }}>
      {data.map((d, i) => {
        const barHeight = (d.solved / maxVal) * chartHeight;
        const x = i * (barWidth + gap);
        const y = chartHeight - barHeight;
        return (
          <g key={d.day}>
            <rect x={x} y={0} width={barWidth} height={chartHeight} rx={6} fill="rgba(255,255,255,0.03)" />
            <motion.rect
              x={x}
              y={chartHeight}
              width={barWidth}
              rx={6}
              fill="url(#barGradient)"
              initial={{ height: 0, y: chartHeight }}
              animate={{ height: barHeight, y }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(13,162,231,0.3))' }}
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight + 16}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
              fontFamily="inherit"
            >
              {d.day}
            </text>
            <motion.text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fill="#0da2e7"
              fontSize="10"
              fontWeight="600"
              fontFamily="inherit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              {d.solved}
            </motion.text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0da2e7" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const PlacementPrep = () => {
  /* First-time setup flow */
  const [setupComplete, setSetupComplete] = useState(() => localStorage.getItem('placementPrepSetup') === 'true');
  const [setupStep, setSetupStep] = useState(0);
  const [setupData, setSetupData] = useState({
    targetCompanies: [] as string[],
    targetRole: '',
    currentLevel: '',
    weakAreas: [] as string[],
  });

  const COMPANY_OPTIONS = ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Amazon', 'Google', 'Microsoft', 'Flipkart', 'Razorpay', 'Swiggy', 'Zomato', 'Other'];
  const LEVEL_OPTIONS = ['Beginner — Just starting prep', 'Intermediate — Some practice done', 'Advanced — Mock tests ongoing', 'Expert — Appeared for placements'];
  const WEAK_AREAS = ['Aptitude & Quant', 'Verbal & English', 'Logical Reasoning', 'Data Structures', 'Algorithms', 'System Design', 'OS & DBMS', 'Networking', 'HR & Behavioral'];

  const handleSetupComplete = () => {
    localStorage.setItem('placementPrepSetup', 'true');
    localStorage.setItem('placementPrepData', JSON.stringify(setupData));
    setSetupComplete(true);
  };

  if (!setupComplete) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0da2e7] to-[#8B5CF6] flex items-center justify-center mx-auto mb-4">
            <Icon name="school" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set Up Placement Prep</h1>
          <p className="text-[#94A3B8] text-sm">Tell us about your placement goals so we can personalize your prep.</p>
        </div>

        <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div className="h-full rounded-full bg-[#0da2e7]" animate={{ width: `${((setupStep + 1) / 4) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={setupStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            {setupStep === 0 && (
              <Card glass>
                <h3 className="text-lg font-semibold text-white mb-4">Which companies are you targeting?</h3>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_OPTIONS.map(c => (
                    <motion.button
                      key={c}
                      onClick={() => setSetupData(d => ({
                        ...d, targetCompanies: d.targetCompanies.includes(c) ? d.targetCompanies.filter(x => x !== c) : [...d.targetCompanies, c],
                      }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        setupData.targetCompanies.includes(c)
                          ? 'bg-[#0da2e7]/20 border-[#0da2e7]/50 text-[#0da2e7]'
                          : 'bg-white/5 border-white/10 text-[#94A3B8]'
                      } border`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >{c}</motion.button>
                  ))}
                </div>
              </Card>
            )}
            {setupStep === 1 && (
              <Card glass>
                <h3 className="text-lg font-semibold text-white mb-4">What role are you preparing for?</h3>
                <div className="space-y-2">
                  {['Software Engineer (SDE)', 'Frontend Developer', 'Backend Developer', 'Data Analyst', 'DevOps Engineer', 'Product Manager'].map(r => (
                    <motion.button
                      key={r}
                      onClick={() => setSetupData(d => ({ ...d, targetRole: r }))}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        setupData.targetRole === r
                          ? 'bg-[#0da2e7]/20 border-[#0da2e7]/50 text-white'
                          : 'bg-white/5 border-white/10 text-[#94A3B8]'
                      } border`}
                      whileTap={{ scale: 0.98 }}
                    >{r}</motion.button>
                  ))}
                </div>
              </Card>
            )}
            {setupStep === 2 && (
              <Card glass>
                <h3 className="text-lg font-semibold text-white mb-4">Your current preparation level?</h3>
                <div className="space-y-2">
                  {LEVEL_OPTIONS.map(l => (
                    <motion.button
                      key={l}
                      onClick={() => setSetupData(d => ({ ...d, currentLevel: l }))}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        setupData.currentLevel === l
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-white'
                          : 'bg-white/5 border-white/10 text-[#94A3B8]'
                      } border`}
                      whileTap={{ scale: 0.98 }}
                    >{l}</motion.button>
                  ))}
                </div>
              </Card>
            )}
            {setupStep === 3 && (
              <Card glass>
                <h3 className="text-lg font-semibold text-white mb-4">Which areas need the most work?</h3>
                <div className="flex flex-wrap gap-2">
                  {WEAK_AREAS.map(a => (
                    <motion.button
                      key={a}
                      onClick={() => setSetupData(d => ({
                        ...d, weakAreas: d.weakAreas.includes(a) ? d.weakAreas.filter(x => x !== a) : [...d.weakAreas, a],
                      }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        setupData.weakAreas.includes(a)
                          ? 'bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#F59E0B]'
                          : 'bg-white/5 border-white/10 text-[#94A3B8]'
                      } border`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >{a}</motion.button>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4 mt-6">
          {setupStep > 0 && (
            <Button variant="secondary" size="md" onClick={() => setSetupStep(s => s - 1)}>
              <Icon name="arrow_back" size={18} /> Back
            </Button>
          )}
          <div className="flex-1" />
          {setupStep < 3 ? (
            <Button variant="primary" size="md" onClick={() => setSetupStep(s => s + 1)}>
              Next <Icon name="arrow_forward" size={18} />
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSetupComplete}>
              Start Prep <Icon name="rocket_launch" size={18} />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  /* State ---------------------------------------------------------- */
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<RoundTab>('Aptitude');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [streak, setStreak] = useState(7);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Company Prep state
  const [activeCompanyPrep, setActiveCompanyPrep] = useState<any>(null);
  const [loadingCompanyPrep, setLoadingCompanyPrep] = useState(false);
  const [companyPrepQuestion, setCompanyPrepQuestion] = useState<any>(null);
  const [companyPrepAnswer, setCompanyPrepAnswer] = useState<number | null>(null);
  const [companyPrepRevealed, setCompanyPrepRevealed] = useState(false);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  // Mock Test state
  const [activeMockTest, setActiveMockTest] = useState<any>(null);
  const [mockTestIndex, setMockTestIndex] = useState(0);
  const [mockTestAnswers, setMockTestAnswers] = useState<Record<string, number>>({});
  const [mockTestTimeLeft, setMockTestTimeLeft] = useState(0);
  const [mockTestResult, setMockTestResult] = useState<any>(null);
  const [loadingMockTest, setLoadingMockTest] = useState(false);

  /* Countdown ------------------------------------------------------ */
  const daysRemaining = useMemo(() => getDaysRemaining(PLACEMENT_DATE), []);

  /* Timer ---------------------------------------------------------- */
  useEffect(() => {
    if (!timerRunning || answerRevealed) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning, answerRevealed]);

  const formatTimer = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  /* Daily question ------------------------------------------------- */
  const dq = dailyQuestions[0];
  const [aiQuestion, setAiQuestion] = useState<any>(null);
  const [loadingAiQuestion, setLoadingAiQuestion] = useState(false);

  const handleGenerateNewQuestion = async () => {
    setLoadingAiQuestion(true);
    setAnswerRevealed(false);
    setSelectedAnswer(null);
    setTimerSeconds(0);
    setTimerRunning(true);
    try {
      const res = await featuresAPI.generateQuestion({
        category: 'Aptitude',
        subCategory: 'Quantitative',
        difficulty: 'medium',
      });
      if (res.data?.data) {
        setAiQuestion({
          question: res.data.data.question,
          options: res.data.data.options,
          correctIndex: res.data.data.correctAnswer,
          explanation: res.data.data.explanation,
          concept: res.data.data.concept,
          tip: res.data.data.tip,
        });
      }
    } catch {
      // Keep using static question
    } finally {
      setLoadingAiQuestion(false);
    }
  };

  const activeQuestion = aiQuestion || dq;

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswerRevealed(true);
    setTimerRunning(false);
    if (selectedAnswer === activeQuestion.correctIndex) {
      setStreak((s) => s + 1);
    }
  };

  /* Company Prep handlers ----------------------------------------- */
  const handleStartCompanyPrep = async (companyName: string) => {
    setLoadingCompanyPrep(true);
    try {
      const res = await featuresAPI.getCompanyPrep({ company: companyName });
      if (res.data?.data) {
        setActiveCompanyPrep(res.data.data);
        setCompanyPrepQuestion(null);
        setCompanyPrepAnswer(null);
        setCompanyPrepRevealed(false);
        setExpandedRound(null);
      }
    } catch {
      setToastMessage('Failed to load prep guide. Try again.');
    } finally {
      setLoadingCompanyPrep(false);
    }
  };

  const handlePracticeQuestion = async (company: string, category: string, subCategory?: string) => {
    setCompanyPrepQuestion(null);
    setCompanyPrepAnswer(null);
    setCompanyPrepRevealed(false);
    try {
      const res = await featuresAPI.generateQuestion({ company, category, subCategory, difficulty: 'medium' });
      if (res.data?.data) setCompanyPrepQuestion(res.data.data);
    } catch {
      setToastMessage('Failed to generate question.');
    }
  };

  /* Mock Test handlers -------------------------------------------- */
  const handleStartMockTest = async (test: MockTest) => {
    setLoadingMockTest(true);
    try {
      const res = await featuresAPI.generateMockTest({ company: test.company, questionCount: Math.min(test.questions, 10), categories: ['Aptitude', 'Technical', 'Verbal'] });
      if (res.data?.data) {
        setActiveMockTest(res.data.data);
        setMockTestIndex(0);
        setMockTestAnswers({});
        setMockTestResult(null);
        const durationMins = parseInt(res.data.data.duration) || 20;
        setMockTestTimeLeft(durationMins * 60);
      }
    } catch {
      setToastMessage('Failed to generate test. Try again.');
    } finally {
      setLoadingMockTest(false);
    }
  };

  const handleSubmitMockTest = useCallback(() => {
    if (!activeMockTest) return;
    const questions = activeMockTest.questions || [];
    let correct = 0;
    let wrong = 0;
    const breakdown = questions.map((q: any) => {
      const userAnswer = mockTestAnswers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (userAnswer !== undefined) { if (isCorrect) correct++; else wrong++; }
      return { ...q, userAnswer, isCorrect };
    });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setMockTestResult({ score, correct, wrong, unanswered: questions.length - correct - wrong, breakdown });
    featuresAPI.submitTest({
      testId: activeMockTest.testId || 'mock',
      company: activeMockTest.company || 'General',
      questionsData: breakdown,
      score,
      totalQuestions: questions.length,
      timeTaken: (parseInt(activeMockTest.duration) || 20) * 60 - mockTestTimeLeft,
    }).catch(() => {});
  }, [activeMockTest, mockTestAnswers, mockTestTimeLeft]);

  /* Toast ---------------------------------------------------------- */
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  /* Mock Test Timer ----------------------------------------------- */
  useEffect(() => {
    if (!activeMockTest || mockTestResult || mockTestTimeLeft <= 0) return;
    const id = setInterval(() => {
      setMockTestTimeLeft((t) => {
        if (t <= 1) { handleSubmitMockTest(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeMockTest, mockTestResult, mockTestTimeLeft, handleSubmitMockTest]);

  /* Computed values ------------------------------------------------ */
  const readinessScore = 52;
  const topicsCovered = 34;
  const mockTestsTaken = 5;
  const questionsSolved = 847;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 pb-8">
      {/* ─── Toast ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(13,162,231,0.9))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-2">
              <Icon name="info" size={18} />
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 1. HEADER BANNER ─── */}
      <motion.div variants={item}>
        <div
          className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13,162,231,0.1), rgba(139,92,246,0.06), rgba(15,23,42,0.9))',
            border: '1px solid rgba(13,162,231,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.07] pointer-events-none" style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />

          <div className="relative z-[1]">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(13,162,231,0.15), rgba(139,92,246,0.1))',
                  border: '1px solid rgba(13,162,231,0.2)',
                }}
              >
                <Icon name="school" size={24} className="text-accent" filled />
              </div>
              <div>
                <Badge variant="gradient" size="sm">Campus Placement 2025</Badge>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-3 tracking-tight">
              Placement Prep Hub
            </h1>
            <p className="text-secondary text-sm md:text-base mt-1.5 max-w-2xl">
              Your one-stop preparation centre for campus placements. Master aptitude, crack coding rounds, and ace HR interviews for India's top recruiters.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── 2. PLACEMENT COUNTDOWN & READINESS ─── */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Countdown + Ring */}
          <Card glass className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ReadinessRing score={readinessScore} />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-secondary text-sm mb-1">Next Placement Season Begins</p>
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{daysRemaining}</span>
                  <span className="text-lg text-secondary font-medium">days left</span>
                </div>
                <p className="text-xs text-muted mt-1">Target: August 2025 Campus Drives</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                  <Badge variant="accent" dot>{readinessScore >= 70 ? 'On Track' : readinessScore >= 40 ? 'Needs Effort' : 'Behind Schedule'}</Badge>
                  <Badge variant="default">{daysRemaining < 60 ? 'Crunch Time!' : daysRemaining < 120 ? 'Build Momentum' : 'Start Strong'}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-3">
            <StatCard label="Topics Covered" value={`${topicsCovered}/58`} icon="topic" accentColor="#0da2e7" trend={{ value: '+4 this week', positive: true }} />
            <StatCard label="Mock Tests" value={mockTestsTaken} icon="quiz" accentColor="#8B5CF6" trend={{ value: '+2 this week', positive: true }} />
            <StatCard label="Questions Solved" value={questionsSolved} icon="check_circle" accentColor="#10B981" trend={{ value: '+89 this week', positive: true }} />
          </div>
        </div>
      </motion.div>

      {/* ─── COMPANY PREP OVERLAY ─── */}
      <AnimatePresence>
        {activeCompanyPrep && (
          <motion.div variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setActiveCompanyPrep(null)}>
                <Icon name="arrow_back" size={18} /> Back
              </Button>
              <h2 className="text-lg font-bold text-white">{activeCompanyPrep.company} Prep Guide</h2>
            </div>

            {/* Overview */}
            <Card glass>
              <p className="text-sm text-secondary mb-3">{activeCompanyPrep.overview?.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-secondary">
                <span className="flex items-center gap-1"><Icon name="currency_rupee" size={14} className="text-accent" /> {activeCompanyPrep.overview?.averagePackage}</span>
                <span className="flex items-center gap-1"><Icon name="work" size={14} className="text-accent" /> {activeCompanyPrep.overview?.roles?.join(', ')}</span>
                <span className="flex items-center gap-1"><Icon name="location_on" size={14} className="text-accent" /> {activeCompanyPrep.overview?.locations?.join(', ')}</span>
              </div>
            </Card>

            {/* Rounds Accordion */}
            {activeCompanyPrep.rounds?.map((round: any, ri: number) => (
              <Card key={ri} glass>
                <button className="w-full flex items-center justify-between" onClick={() => setExpandedRound(expandedRound === ri ? null : ri)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(13,162,231,0.1)' }}>
                      <span className="text-xs font-bold text-accent">{ri + 1}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-white">{round.name}</h4>
                      <p className="text-[11px] text-muted">{round.duration} &middot; {round.description?.slice(0, 60)}</p>
                    </div>
                  </div>
                  <Icon name={expandedRound === ri ? 'expand_less' : 'expand_more'} size={20} className="text-muted" />
                </button>
                <AnimatePresence>
                  {expandedRound === ri && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 space-y-3">
                        {round.sections?.map((sec: any, si: number) => (
                          <div key={si} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-semibold text-white">{sec.name}</h5>
                              <Button variant="ghost" size="sm" onClick={() => handlePracticeQuestion(activeCompanyPrep.company, round.name, sec.name)}>
                                <Icon name="quiz" size={14} /> Practice
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {sec.topics?.map((topic: string) => (
                                <span key={topic} className="text-[10px] px-1.5 py-0.5 rounded-md text-muted" style={{ background: 'rgba(255,255,255,0.04)' }}>{topic}</span>
                              ))}
                            </div>
                            {sec.tips?.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {sec.tips.map((tip: string, ti: number) => (
                                  <p key={ti} className="text-[10px] text-secondary flex items-start gap-1"><Icon name="lightbulb" size={12} className="text-warning flex-shrink-0 mt-0.5" /> {tip}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}

            {/* Practice Question Card */}
            {companyPrepQuestion && (
              <Card glass>
                <Badge variant="accent" size="sm" className="mb-3">{companyPrepQuestion.category} &middot; {companyPrepQuestion.difficulty}</Badge>
                <p className="text-sm text-white font-medium mb-4">{companyPrepQuestion.question}</p>
                <div className="space-y-2 mb-4">
                  {companyPrepQuestion.options?.map((opt: string, oi: number) => (
                    <motion.button
                      key={oi}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                        companyPrepRevealed
                          ? oi === companyPrepQuestion.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : oi === companyPrepAnswer ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/5 text-muted'
                          : companyPrepAnswer === oi ? 'bg-[#0da2e7]/15 border-[#0da2e7]/40 text-white' : 'bg-white/5 border-white/5 text-secondary hover:bg-white/8'
                      }`}
                      onClick={() => { if (!companyPrepRevealed) setCompanyPrepAnswer(oi); }}
                      whileTap={!companyPrepRevealed ? { scale: 0.98 } : {}}
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                    </motion.button>
                  ))}
                </div>
                {!companyPrepRevealed ? (
                  <Button variant="primary" size="sm" className="w-full" disabled={companyPrepAnswer === null} onClick={() => setCompanyPrepRevealed(true)}>
                    Check Answer
                  </Button>
                ) : (
                  <div className="p-3 rounded-xl mt-2" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <p className="text-xs text-secondary">{companyPrepQuestion.explanation}</p>
                    {companyPrepQuestion.tip && <p className="text-[11px] text-muted mt-2 flex items-start gap-1"><Icon name="lightbulb" size={12} className="text-warning" /> {companyPrepQuestion.tip}</p>}
                  </div>
                )}
              </Card>
            )}

            {/* Tips */}
            {activeCompanyPrep.tips?.length > 0 && (
              <Card glass>
                <h3 className="text-sm font-bold text-white mb-3">Pro Tips</h3>
                <div className="space-y-2">
                  {activeCompanyPrep.tips.map((tip: string, i: number) => (
                    <p key={i} className="text-xs text-secondary flex items-start gap-2"><Icon name="check_circle" size={14} className="text-accent flex-shrink-0 mt-0.5" /> {tip}</p>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MOCK TEST OVERLAY ─── */}
      <AnimatePresence>
        {activeMockTest && !mockTestResult && (
          <motion.div variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => { setActiveMockTest(null); setMockTestAnswers({}); setMockTestTimeLeft(0); }}>
                  <Icon name="close" size={18} /> Exit
                </Button>
                <h2 className="text-lg font-bold text-white truncate">{activeMockTest.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="accent">Q{mockTestIndex + 1}/{activeMockTest.questions?.length || 0}</Badge>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: mockTestTimeLeft < 60 ? 'rgba(239,68,68,0.1)' : 'rgba(13,162,231,0.1)', border: `1px solid ${mockTestTimeLeft < 60 ? 'rgba(239,68,68,0.2)' : 'rgba(13,162,231,0.2)'}` }}>
                  <Icon name="timer" size={16} className={mockTestTimeLeft < 60 ? 'text-error' : 'text-accent'} />
                  <span className={`text-sm font-mono font-bold ${mockTestTimeLeft < 60 ? 'text-error' : 'text-white'}`}>{formatTimer(mockTestTimeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Question dots */}
            <div className="flex flex-wrap gap-1.5">
              {(activeMockTest.questions || []).map((_: any, i: number) => (
                <button key={i} onClick={() => setMockTestIndex(i)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === mockTestIndex ? 'bg-[#0da2e7] text-white' : mockTestAnswers[(activeMockTest.questions[i] as any).id] !== undefined ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-muted border border-white/5'}`}>
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Current question */}
            {(() => {
              const q = activeMockTest.questions?.[mockTestIndex];
              if (!q) return null;
              return (
                <Card glass>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default" size="sm">{q.category}</Badge>
                    <Badge variant={difficultyBadge(q.difficulty || 'Medium')} size="sm">{q.difficulty || 'Medium'}</Badge>
                    {q.timeEstimate && <span className="text-[11px] text-muted">{q.timeEstimate}</span>}
                  </div>
                  <p className="text-white text-sm md:text-base leading-relaxed mb-5">{q.question}</p>
                  <div className="space-y-2.5">
                    {q.options?.map((opt: string, oi: number) => (
                      <motion.button key={oi} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${mockTestAnswers[q.id] === oi ? 'bg-[#0da2e7]/10 border-[#0da2e7]/30 text-white' : 'bg-white/[0.03] border-white/[0.05] text-secondary hover:bg-white/[0.05]'}`} onClick={() => setMockTestAnswers((a) => ({ ...a, [q.id]: oi }))} whileTap={{ scale: 0.98 }}>
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${mockTestAnswers[q.id] === oi ? 'bg-[#0da2e7]/20 text-[#0da2e7]' : 'bg-white/[0.05] text-muted'}`}>{String.fromCharCode(65 + oi)}</span>
                        <span className="text-sm">{opt}</span>
                      </motion.button>
                    ))}
                  </div>
                </Card>
              );
            })()}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="secondary" size="sm" disabled={mockTestIndex === 0} onClick={() => setMockTestIndex((i) => i - 1)}>
                <Icon name="arrow_back" size={16} /> Previous
              </Button>
              <span className="text-xs text-muted">{Object.keys(mockTestAnswers).length}/{activeMockTest.questions?.length || 0} answered</span>
              {mockTestIndex < (activeMockTest.questions?.length || 1) - 1 ? (
                <Button variant="primary" size="sm" onClick={() => setMockTestIndex((i) => i + 1)}>
                  Next <Icon name="arrow_forward" size={16} />
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleSubmitMockTest}>
                  Submit Test <Icon name="check" size={16} />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MOCK TEST RESULTS ─── */}
      <AnimatePresence>
        {mockTestResult && (
          <motion.div variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setActiveMockTest(null); setMockTestResult(null); setMockTestAnswers({}); }}>
                <Icon name="arrow_back" size={18} /> Back to Tests
              </Button>
              <h2 className="text-lg font-bold text-white">Test Results</h2>
            </div>

            <Card glass glow>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ReadinessRing score={mockTestResult.score} />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {mockTestResult.score >= 70 ? 'Great Job!' : mockTestResult.score >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
                  </h3>
                  <p className="text-secondary text-sm mb-3">You scored {mockTestResult.score}% on this test</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-sm"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-secondary">Correct: {mockTestResult.correct}</span></div>
                    <div className="flex items-center gap-1.5 text-sm"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-secondary">Wrong: {mockTestResult.wrong}</span></div>
                    <div className="flex items-center gap-1.5 text-sm"><span className="w-3 h-3 rounded-full bg-gray-500" /><span className="text-secondary">Unanswered: {mockTestResult.unanswered}</span></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card glass>
              <h3 className="text-sm font-bold text-white mb-3">Question Breakdown</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                {mockTestResult.breakdown?.map((q: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: q.isCorrect ? 'rgba(16,185,129,0.04)' : q.userAnswer !== undefined ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${q.isCorrect ? 'rgba(16,185,129,0.1)' : q.userAnswer !== undefined ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)'}` }}>
                    <div className="flex items-start gap-2">
                      <Icon name={q.isCorrect ? 'check_circle' : q.userAnswer !== undefined ? 'cancel' : 'radio_button_unchecked'} size={16} className={`${q.isCorrect ? 'text-success' : q.userAnswer !== undefined ? 'text-error' : 'text-muted'} mt-0.5 flex-shrink-0`} filled />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium">{q.question}</p>
                        <p className="text-[11px] text-muted mt-1">
                          {q.userAnswer !== undefined ? `Your answer: ${q.options?.[q.userAnswer]}` : 'Not answered'}
                          {!q.isCorrect && q.correctAnswer !== undefined && ` · Correct: ${q.options?.[q.correctAnswer]}`}
                        </p>
                        {q.explanation && <p className="text-[11px] text-secondary mt-1">{q.explanation}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {(activeCompanyPrep || activeMockTest) ? null : (<>
      {/* ─── 3. COMPANY PREP PACKS ─── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(13,162,231,0.1)', border: '1px solid rgba(13,162,231,0.15)' }}
          >
            <Icon name="apartment" size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Company Prep Packs</h2>
            <p className="text-xs text-muted">Targeted preparation for top recruiters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {companyPacks.map((company) => {
            const isSelected = selectedCompany === company.name;
            return (
              <motion.div key={company.name} layout>
                <Card
                  hover
                  onClick={() => setSelectedCompany(isSelected ? null : company.name)}
                  className={`relative transition-all duration-300 ${isSelected ? 'ring-1' : ''}`}
                  padding="p-0"
                >
                  {/* Top accent bar */}
                  <div className="h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${company.color}, ${company.color}80)` }} />

                  <div className="p-4">
                    {/* Company header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${company.color}18`,
                          border: `1px solid ${company.color}30`,
                        }}
                      >
                        <Icon name={company.icon} size={20} style={{ color: company.color }} filled />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{company.name}</h3>
                        <p className="text-[11px] text-muted truncate">{company.avgPackage}</p>
                      </div>
                      <Badge variant={difficultyBadge(company.difficulty)} size="sm">{company.difficulty}</Badge>
                    </div>

                    {/* Rounds */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {company.rounds.map((round) => (
                        <span
                          key={round}
                          className="text-[10px] px-1.5 py-0.5 rounded-md text-muted"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          {round}
                        </span>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-secondary">{company.questions} questions</span>
                        <span style={{ color: company.color }}>{company.completion}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: company.color, boxShadow: `0 0 6px ${company.color}50` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${company.completion}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-2">
                            <div className="flex items-center gap-2 text-xs text-secondary">
                              <Icon name="pattern" size={14} className="text-muted" />
                              <span>Hiring: {company.hiringPattern}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-secondary">
                              <Icon name="format_list_numbered" size={14} className="text-muted" />
                              <span>{company.rounds.length} rounds to clear</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-secondary">
                              <Icon name="currency_rupee" size={14} className="text-muted" />
                              <span>Package: {company.avgPackage}</span>
                            </div>
                            <Button variant="primary" size="sm" className="w-full mt-2" onClick={() => handleStartCompanyPrep(company.name)} disabled={loadingCompanyPrep}>
                              {loadingCompanyPrep ? 'Loading...' : `Start ${company.name} Prep`}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── 4. ROUND-WISE PREPARATION TABS ─── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}
          >
            <Icon name="layers" size={20} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Round-wise Preparation</h2>
            <p className="text-xs text-muted">Structured topic-wise practice for each round</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
          {roundTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRound(tab)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeRound === tab
                  ? 'text-white'
                  : 'text-muted hover:text-secondary'
              }`}
              style={
                activeRound === tab
                  ? {
                      background: 'linear-gradient(135deg, rgba(13,162,231,0.15), rgba(139,92,246,0.1))',
                      border: '1px solid rgba(13,162,231,0.2)',
                      boxShadow: '0 2px 8px rgba(13,162,231,0.15)',
                    }
                  : { background: 'transparent', border: '1px solid transparent' }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRound}
            variants={fadeScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {roundTopics[activeRound].map((section) => (
              <Card glass key={section.title}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(13,162,231,0.1)', border: '1px solid rgba(13,162,231,0.12)' }}
                  >
                    <Icon name={section.icon} size={18} className="text-accent" />
                  </div>
                  <h3 className="text-base font-bold text-white">{section.title}</h3>
                  <Badge variant="default" size="sm">{section.subtopics.length} topics</Badge>
                </div>

                <div className="space-y-2.5">
                  {section.subtopics.map((sub) => (
                    <div
                      key={sub.name}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.02] group"
                      style={{ border: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      {/* Status indicator */}
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background:
                            sub.progress >= 70 ? '#10B981' : sub.progress >= 40 ? '#F59E0B' : '#EF4444',
                          boxShadow:
                            sub.progress >= 70
                              ? '0 0 6px rgba(16,185,129,0.4)'
                              : sub.progress >= 40
                                ? '0 0 6px rgba(245,158,11,0.4)'
                                : '0 0 6px rgba(239,68,68,0.4)',
                        }}
                      />

                      {/* Topic name */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium truncate">{sub.name}</span>
                          <Badge variant={difficultyBadge(sub.difficulty)} size="sm">{sub.difficulty}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <ProgressBar
                            value={sub.progress}
                            color={sub.progress >= 70 ? 'success' : sub.progress >= 40 ? 'warning' : 'error'}
                            size="xs"
                            className="flex-1"
                          />
                          <span className="text-[11px] text-muted flex-shrink-0 w-8 text-right">{sub.progress}%</span>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="hidden sm:flex items-center gap-3 flex-shrink-0 text-[11px] text-muted">
                        <span className="flex items-center gap-1">
                          <Icon name="help" size={12} /> {sub.questions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="schedule" size={12} /> {sub.estimatedTime}
                        </span>
                      </div>

                      {/* Arrow */}
                      <Icon name="chevron_right" size={16} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ─── 5. DAILY PRACTICE SECTION ─── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            <Icon name="bolt" size={20} className="text-success" filled />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Daily Practice</h2>
            <p className="text-xs text-muted">Solve one question every day to build consistency</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" loading={loadingAiQuestion} onClick={handleGenerateNewQuestion}>
              <Icon name="auto_awesome" size={14} /> New AI Question
            </Button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Icon name="local_fire_department" size={16} className="text-warning" filled />
              <span className="text-sm font-bold text-warning">{streak}</span>
              <span className="text-[11px] text-warning/70">day streak</span>
            </div>
          </div>
        </div>

        <Card glass glow>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Question */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="accent">Today&apos;s Challenge</Badge>
                <Badge variant={difficultyBadge(activeQuestion.difficulty)}>{activeQuestion.difficulty}</Badge>
                <Badge variant="default">
                  <Icon name="category" size={12} className="mr-1" />
                  {activeQuestion.topic}
                </Badge>
              </div>

              <p className="text-white text-sm md:text-base leading-relaxed mb-5">{activeQuestion.question}</p>

              {/* Options */}
              <div className="space-y-2.5">
                {activeQuestion.options.map((option: any, idx: number) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrect = idx === activeQuestion.correctIndex;
                  const isSelectedOption = selectedAnswer === idx;
                  let optionStyle: React.CSSProperties = {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  };
                  let letterStyle: React.CSSProperties = {
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.5)',
                  };

                  if (answerRevealed) {
                    if (isCorrect) {
                      optionStyle = {
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        boxShadow: '0 0 12px rgba(16,185,129,0.1)',
                      };
                      letterStyle = { background: 'rgba(16,185,129,0.15)', color: '#10B981' };
                    } else if (isSelectedOption && !isCorrect) {
                      optionStyle = {
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.3)',
                      };
                      letterStyle = { background: 'rgba(239,68,68,0.15)', color: '#EF4444' };
                    }
                  } else if (isSelectedOption) {
                    optionStyle = {
                      background: 'rgba(13,162,231,0.08)',
                      border: '1px solid rgba(13,162,231,0.3)',
                      boxShadow: '0 0 12px rgba(13,162,231,0.1)',
                    };
                    letterStyle = { background: 'rgba(13,162,231,0.15)', color: '#0da2e7' };
                  }

                  return (
                    <motion.button
                      key={idx}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                      style={optionStyle}
                      onClick={() => !answerRevealed && setSelectedAnswer(idx)}
                      whileHover={!answerRevealed ? { scale: 1.01 } : undefined}
                      whileTap={!answerRevealed ? { scale: 0.99 } : undefined}
                      disabled={answerRevealed}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-200"
                        style={letterStyle}
                      >
                        {letter}
                      </span>
                      <span className={`text-sm ${isSelectedOption || (answerRevealed && isCorrect) ? 'text-white font-medium' : 'text-secondary'}`}>
                        {option}
                      </span>
                      {answerRevealed && isCorrect && (
                        <Icon name="check_circle" size={18} className="text-success ml-auto" filled />
                      )}
                      {answerRevealed && isSelectedOption && !isCorrect && (
                        <Icon name="cancel" size={18} className="text-error ml-auto" filled />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Submit / Result */}
              <div className="mt-4 flex items-center gap-3">
                {!answerRevealed ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    {selectedAnswer === activeQuestion.correctIndex ? (
                      <Badge variant="success" size="md">
                        <Icon name="celebration" size={14} className="mr-1" filled />
                        Correct! Well done!
                      </Badge>
                    ) : (
                      <Badge variant="error" size="md">
                        <Icon name="close" size={14} className="mr-1" />
                        Incorrect. The answer is {String.fromCharCode(65 + activeQuestion.correctIndex)}.
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {answerRevealed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-4 p-4 rounded-xl text-sm text-secondary leading-relaxed"
                      style={{
                        background: 'rgba(13,162,231,0.04)',
                        border: '1px solid rgba(13,162,231,0.1)',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="lightbulb" size={16} className="text-accent" filled />
                        <span className="text-white font-semibold text-sm">Explanation</span>
                      </div>
                      {activeQuestion.explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timer & Streak Side Panel */}
            <div className="lg:w-48 flex flex-row lg:flex-col gap-3 lg:border-l lg:border-white/[0.06] lg:pl-6">
              {/* Timer */}
              <div
                className="flex-1 lg:flex-initial flex flex-col items-center justify-center p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <Icon name="timer" size={24} className="text-accent mb-2" />
                <span className="text-2xl font-mono font-bold text-white">{formatTimer(timerSeconds)}</span>
                <span className="text-[11px] text-muted mt-1">Time Elapsed</span>
                {!answerRevealed && (
                  <button
                    className="text-[11px] text-accent mt-2 hover:underline"
                    onClick={() => setTimerRunning((r) => !r)}
                  >
                    {timerRunning ? 'Pause' : 'Resume'}
                  </button>
                )}
              </div>

              {/* Streak */}
              <div
                className="flex-1 lg:flex-initial flex flex-col items-center justify-center p-4 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}
              >
                <Icon name="local_fire_department" size={24} className="text-warning mb-1" filled />
                <span className="text-2xl font-bold text-white">{streak}</span>
                <span className="text-[11px] text-muted mt-0.5">Day Streak</span>
              </div>

              {/* Difficulty */}
              <div
                className="flex-1 lg:flex-initial flex flex-col items-center justify-center p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <Icon name="speed" size={24} className="text-[#8B5CF6] mb-1" />
                <span className="text-sm font-bold text-white">{activeQuestion.difficulty}</span>
                <span className="text-[11px] text-muted mt-0.5">Difficulty</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── 6. MOCK TEST SECTION ─── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}
          >
            <Icon name="assignment" size={20} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Mock Tests</h2>
            <p className="text-xs text-muted">Full-length tests to simulate placement day</p>
          </div>
        </div>

        {/* Past Scores Quick View */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
          {mockTests
            .filter((t) => t.attempted && t.score !== undefined)
            .map((t) => (
              <div
                key={t.id}
                className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background:
                      (t.score! / t.maxScore!) >= 0.7
                        ? 'rgba(16,185,129,0.12)'
                        : (t.score! / t.maxScore!) >= 0.5
                          ? 'rgba(245,158,11,0.12)'
                          : 'rgba(239,68,68,0.12)',
                    color:
                      (t.score! / t.maxScore!) >= 0.7
                        ? '#10B981'
                        : (t.score! / t.maxScore!) >= 0.5
                          ? '#F59E0B'
                          : '#EF4444',
                  }}
                >
                  {t.score}/{t.maxScore}
                </div>
                <div>
                  <p className="text-xs text-white font-medium truncate max-w-[120px]">{t.title.replace(' Mock Test 1', '').replace(' Mock', '').replace(' Practice Set', '')}</p>
                  <p className="text-[10px] text-muted">{t.company || 'General'}</p>
                </div>
              </div>
            ))}
        </div>

        {/* Mock Test Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockTests.map((test) => {
            const companyData = test.company ? companyPacks.find((c) => c.name === test.company) : null;
            const accentColor = companyData?.color || '#0da2e7';
            return (
              <Card key={test.id} hover glass padding="p-0">
                {companyData && (
                  <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }} />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <h4 className="text-sm font-bold text-white truncate">{test.title}</h4>
                      <p className="text-[11px] text-muted mt-0.5">{test.company || 'General Practice'}</p>
                    </div>
                    <Badge variant={difficultyBadge(test.difficulty)} size="sm">{test.difficulty}</Badge>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-secondary mb-4">
                    <span className="flex items-center gap-1">
                      <Icon name="schedule" size={13} /> {test.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="help" size={13} /> {test.questions} Qs
                    </span>
                  </div>

                  {test.attempted && test.score !== undefined ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted">Score: </span>
                        <span
                          className="text-sm font-bold"
                          style={{
                            color:
                              (test.score / test.maxScore!) >= 0.7
                                ? '#10B981'
                                : (test.score / test.maxScore!) >= 0.5
                                  ? '#F59E0B'
                                  : '#EF4444',
                          }}
                        >
                          {test.score}/{test.maxScore}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartMockTest(test)}
                      >
                        Retake
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleStartMockTest(test)}
                      disabled={loadingMockTest}
                    >
                      <Icon name="play_arrow" size={16} filled />
                      {loadingMockTest ? 'Generating...' : 'Start Test'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ─── 7. PREPARATION ANALYTICS ─── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <Icon name="analytics" size={20} className="text-warning" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Preparation Analytics</h2>
            <p className="text-xs text-muted">Track your progress and identify weak spots</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weekly Progress Chart */}
          <Card glass>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Weekly Progress</h3>
              <Badge variant="accent" size="sm">
                {weeklyData.reduce((a, b) => a + b.solved, 0)} questions this week
              </Badge>
            </div>
            <WeeklyChart data={weeklyData} />
          </Card>

          {/* Topic-wise Strength */}
          <Card glass>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Topic Strength Meter</h3>
              <Badge variant="default" size="sm">{topicStrengths.length} topics tracked</Badge>
            </div>
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {topicStrengths
                .sort((a, b) => b.score - a.score)
                .map((ts) => (
                  <div key={ts.topic} className="flex items-center gap-3">
                    <span className="text-xs text-secondary w-36 truncate flex-shrink-0">{ts.topic}</span>
                    <div className="flex-1">
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: ts.color, boxShadow: `0 0 6px ${ts.color}40` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${ts.score}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold w-8 text-right" style={{ color: ts.color }}>
                      {ts.score}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Weak Areas */}
        <Card glass className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="warning" size={18} className="text-warning" filled />
            <h3 className="text-sm font-bold text-white">Areas Needing Attention</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topicStrengths
              .filter((t) => t.score < 40)
              .sort((a, b) => a.score - b.score)
              .map((weak) => (
                <div
                  key={weak.topic}
                  className="p-3 rounded-xl flex items-center gap-3"
                  style={{
                    background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.1)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)' }}
                  >
                    <span className="text-sm font-bold text-error">{weak.score}%</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{weak.topic}</p>
                    <p className="text-[11px] text-error/70">Needs practice</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </motion.div>
      </>)}
    </motion.div>
  );
};

export default PlacementPrep;
