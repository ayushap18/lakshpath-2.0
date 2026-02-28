import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useMarket } from '../hooks/useMarket';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tab = 'scout' | 'compare' | 'trends' | 'salary';

interface DemoJob {
  id: string;
  jobTitle: string;
  company: string;
  salary: string;
  location: string;
  skills: string[];
  matchScore: number;
  type: string;
  experience: string;
  posted: string;
  summary: string;
  matches: string[];
  gaps: string[];
  logo: string;
}

interface TrendingSkill {
  name: string;
  demand: number;
  color: string;
  growth: string;
  category: string;
}

interface HotRole {
  title: string;
  demandLevel: 'Very High' | 'High' | 'Medium';
  growth: string;
  avgSalary: string;
  openings: string;
  icon: string;
}

interface HiringCompany {
  name: string;
  openPositions: number;
  avgPackage: string;
  growth: string;
  logo: string;
  type: string;
}

interface SalaryData {
  role: string;
  fresher: string;
  mid: string;
  senior: string;
  fresherVal: number;
  midVal: number;
  seniorVal: number;
  icon: string;
}

interface CitySalary {
  city: string;
  avgSalary: string;
  avgVal: number;
  costOfLiving: string;
  topCompanies: string[];
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_JOBS: DemoJob[] = [
  {
    id: 'dj1',
    jobTitle: 'Full Stack Developer',
    company: 'Flipkart',
    salary: '12-20 LPA',
    location: 'Bangalore',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    matchScore: 92,
    type: 'Full-time',
    experience: '2-5 years',
    posted: '2 days ago',
    summary: 'Build scalable e-commerce applications powering millions of transactions daily. Work with cutting-edge tech stack.',
    matches: ['React.js', 'Node.js', 'TypeScript', 'REST APIs'],
    gaps: ['MongoDB Atlas', 'Kafka'],
    logo: 'shopping_cart',
  },
  {
    id: 'dj2',
    jobTitle: 'ML Engineer',
    company: 'Google India',
    salary: '25-45 LPA',
    location: 'Hyderabad',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'GCP'],
    matchScore: 78,
    type: 'Full-time',
    experience: '3-7 years',
    posted: '1 day ago',
    summary: 'Design and deploy ML models at scale for Search and Ads products. Collaborate with world-class research teams.',
    matches: ['Python', 'TensorFlow', 'Data Pipelines'],
    gaps: ['PyTorch Advanced', 'MLOps at Scale', 'GCP ML Services'],
    logo: 'psychology',
  },
  {
    id: 'dj3',
    jobTitle: 'Frontend Developer',
    company: 'Razorpay',
    salary: '10-18 LPA',
    location: 'Bangalore',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Testing'],
    matchScore: 88,
    type: 'Full-time',
    experience: '1-4 years',
    posted: '3 days ago',
    summary: 'Build beautiful dashboard experiences for merchants handling payments. Focus on performance and accessibility.',
    matches: ['React.js', 'TypeScript', 'CSS/Tailwind', 'Jest'],
    gaps: ['Payment Gateway APIs'],
    logo: 'payments',
  },
  {
    id: 'dj4',
    jobTitle: 'DevOps Engineer',
    company: 'Amazon',
    salary: '15-28 LPA',
    location: 'Hyderabad',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    matchScore: 71,
    type: 'Full-time',
    experience: '3-6 years',
    posted: '5 days ago',
    summary: 'Manage cloud infrastructure serving billions of requests. Build automated deployment pipelines and monitoring.',
    matches: ['Docker', 'AWS EC2/S3', 'CI/CD Pipelines'],
    gaps: ['Kubernetes at Scale', 'Terraform Modules', 'Service Mesh'],
    logo: 'cloud',
  },
  {
    id: 'dj5',
    jobTitle: 'Product Manager',
    company: 'Swiggy',
    salary: '18-30 LPA',
    location: 'Bangalore',
    skills: ['Product Strategy', 'Analytics', 'A/B Testing', 'SQL', 'Agile'],
    matchScore: 65,
    type: 'Full-time',
    experience: '4-8 years',
    posted: '1 day ago',
    summary: 'Drive product strategy for consumer-facing features. Own end-to-end delivery experience improvements.',
    matches: ['Analytical Thinking', 'SQL'],
    gaps: ['Product Strategy', 'A/B Testing Expertise', 'Stakeholder Management'],
    logo: 'inventory_2',
  },
  {
    id: 'dj6',
    jobTitle: 'Data Scientist',
    company: 'Walmart Labs',
    salary: '14-25 LPA',
    location: 'Bangalore',
    skills: ['Python', 'SQL', 'Machine Learning', 'Spark', 'Tableau'],
    matchScore: 82,
    type: 'Full-time',
    experience: '2-5 years',
    posted: '4 days ago',
    summary: 'Analyze massive retail datasets to optimize supply chain and pricing. Build predictive models for inventory management.',
    matches: ['Python', 'SQL', 'Machine Learning', 'Data Visualization'],
    gaps: ['Apache Spark', 'Supply Chain Domain'],
    logo: 'analytics',
  },
  {
    id: 'dj7',
    jobTitle: 'Backend Engineer',
    company: 'PhonePe',
    salary: '12-22 LPA',
    location: 'Pune',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Redis', 'Kafka'],
    matchScore: 75,
    type: 'Full-time',
    experience: '2-5 years',
    posted: '6 days ago',
    summary: 'Build high-throughput payment processing systems handling millions of transactions. Focus on reliability and latency.',
    matches: ['Java', 'Spring Boot', 'REST APIs'],
    gaps: ['Kafka', 'Redis Advanced', 'Distributed Systems'],
    logo: 'account_balance',
  },
  {
    id: 'dj8',
    jobTitle: 'Cloud Architect',
    company: 'Microsoft',
    salary: '20-40 LPA',
    location: 'Hyderabad',
    skills: ['Azure', 'System Design', 'Kubernetes', 'Networking', 'Security'],
    matchScore: 68,
    type: 'Full-time',
    experience: '5-10 years',
    posted: '2 days ago',
    summary: 'Design enterprise-grade cloud architectures on Azure. Guide customers through digital transformation journeys.',
    matches: ['Cloud Fundamentals', 'System Design'],
    gaps: ['Azure Certifications', 'Enterprise Architecture', 'Security Compliance'],
    logo: 'cloud_circle',
  },
];

const TRENDING_SKILLS: TrendingSkill[] = [
  { name: 'React.js', demand: 94, color: '#0da2e7', growth: '+12%', category: 'Frontend' },
  { name: 'Python', demand: 92, color: '#10B981', growth: '+15%', category: 'Backend' },
  { name: 'TypeScript', demand: 88, color: '#8B5CF6', growth: '+22%', category: 'Language' },
  { name: 'AWS', demand: 85, color: '#F59E0B', growth: '+18%', category: 'Cloud' },
  { name: 'Docker', demand: 82, color: '#0da2e7', growth: '+14%', category: 'DevOps' },
  { name: 'Node.js', demand: 80, color: '#10B981', growth: '+8%', category: 'Backend' },
  { name: 'Kubernetes', demand: 78, color: '#8B5CF6', growth: '+25%', category: 'DevOps' },
  { name: 'System Design', demand: 75, color: '#F59E0B', growth: '+20%', category: 'Architecture' },
  { name: 'Machine Learning', demand: 72, color: '#EF4444', growth: '+30%', category: 'AI/ML' },
  { name: 'Go', demand: 68, color: '#0da2e7', growth: '+35%', category: 'Language' },
  { name: 'Rust', demand: 65, color: '#EF4444', growth: '+42%', category: 'Language' },
  { name: 'Next.js', demand: 62, color: '#8B5CF6', growth: '+28%', category: 'Frontend' },
];

const HOT_ROLES: HotRole[] = [
  { title: 'Full Stack Developer', demandLevel: 'Very High', growth: '+24%', avgSalary: '12-22 LPA', openings: '15,200+', icon: 'code' },
  { title: 'Data Scientist', demandLevel: 'Very High', growth: '+32%', avgSalary: '14-28 LPA', openings: '8,400+', icon: 'analytics' },
  { title: 'DevOps Engineer', demandLevel: 'High', growth: '+28%', avgSalary: '12-25 LPA', openings: '6,800+', icon: 'cloud' },
  { title: 'ML Engineer', demandLevel: 'Very High', growth: '+38%', avgSalary: '18-40 LPA', openings: '5,600+', icon: 'psychology' },
  { title: 'Frontend Developer', demandLevel: 'High', growth: '+18%', avgSalary: '8-18 LPA', openings: '12,300+', icon: 'web' },
  { title: 'Backend Engineer', demandLevel: 'High', growth: '+20%', avgSalary: '10-22 LPA', openings: '11,500+', icon: 'dns' },
  { title: 'Cloud Architect', demandLevel: 'High', growth: '+30%', avgSalary: '20-45 LPA', openings: '3,200+', icon: 'cloud_circle' },
  { title: 'Product Manager', demandLevel: 'Medium', growth: '+15%', avgSalary: '16-35 LPA', openings: '4,100+', icon: 'inventory_2' },
  { title: 'Cybersecurity Analyst', demandLevel: 'High', growth: '+34%', avgSalary: '10-24 LPA', openings: '4,800+', icon: 'security' },
  { title: 'Mobile Developer', demandLevel: 'Medium', growth: '+12%', avgSalary: '8-20 LPA', openings: '7,200+', icon: 'smartphone' },
];

const HIRING_COMPANIES: HiringCompany[] = [
  { name: 'TCS', openPositions: 12500, avgPackage: '8-16 LPA', growth: '+8%', logo: 'business', type: 'IT Services' },
  { name: 'Infosys', openPositions: 9800, avgPackage: '7-15 LPA', growth: '+12%', logo: 'apartment', type: 'IT Services' },
  { name: 'Wipro', openPositions: 7200, avgPackage: '6-14 LPA', growth: '+6%', logo: 'corporate_fare', type: 'IT Services' },
  { name: 'Amazon', openPositions: 3400, avgPackage: '18-35 LPA', growth: '+22%', logo: 'shopping_cart', type: 'Product' },
  { name: 'Google', openPositions: 1800, avgPackage: '25-50 LPA', growth: '+15%', logo: 'search', type: 'Product' },
  { name: 'Flipkart', openPositions: 2200, avgPackage: '15-30 LPA', growth: '+18%', logo: 'storefront', type: 'E-Commerce' },
  { name: 'Microsoft', openPositions: 2600, avgPackage: '20-42 LPA', growth: '+14%', logo: 'window', type: 'Product' },
  { name: 'Razorpay', openPositions: 850, avgPackage: '12-25 LPA', growth: '+35%', logo: 'payments', type: 'Fintech' },
  { name: 'Swiggy', openPositions: 1100, avgPackage: '14-28 LPA', growth: '+20%', logo: 'delivery_dining', type: 'Consumer Tech' },
  { name: 'PhonePe', openPositions: 950, avgPackage: '12-24 LPA', growth: '+28%', logo: 'account_balance', type: 'Fintech' },
];

const SALARY_DATA: SalaryData[] = [
  { role: 'Frontend Developer', fresher: '4-8 LPA', mid: '10-18 LPA', senior: '20-35 LPA', fresherVal: 6, midVal: 14, seniorVal: 27, icon: 'web' },
  { role: 'Backend Engineer', fresher: '5-9 LPA', mid: '12-22 LPA', senior: '24-40 LPA', fresherVal: 7, midVal: 17, seniorVal: 32, icon: 'dns' },
  { role: 'Full Stack Developer', fresher: '5-10 LPA', mid: '12-22 LPA', senior: '22-38 LPA', fresherVal: 7.5, midVal: 17, seniorVal: 30, icon: 'code' },
  { role: 'Data Scientist', fresher: '6-12 LPA', mid: '14-28 LPA', senior: '28-50 LPA', fresherVal: 9, midVal: 21, seniorVal: 39, icon: 'analytics' },
  { role: 'DevOps Engineer', fresher: '5-10 LPA', mid: '12-25 LPA', senior: '25-42 LPA', fresherVal: 7.5, midVal: 18.5, seniorVal: 33.5, icon: 'cloud' },
  { role: 'ML Engineer', fresher: '8-14 LPA', mid: '18-35 LPA', senior: '35-60 LPA', fresherVal: 11, midVal: 26.5, seniorVal: 47.5, icon: 'psychology' },
  { role: 'Product Manager', fresher: '8-14 LPA', mid: '16-30 LPA', senior: '30-55 LPA', fresherVal: 11, midVal: 23, seniorVal: 42.5, icon: 'inventory_2' },
  { role: 'Cloud Architect', fresher: '7-12 LPA', mid: '18-35 LPA', senior: '35-65 LPA', fresherVal: 9.5, midVal: 26.5, seniorVal: 50, icon: 'cloud_circle' },
];

const CITY_SALARIES: CitySalary[] = [
  { city: 'Bangalore', avgSalary: '18.5 LPA', avgVal: 18.5, costOfLiving: 'High', topCompanies: ['Google', 'Flipkart', 'Swiggy', 'Razorpay'], color: '#0da2e7' },
  { city: 'Hyderabad', avgSalary: '16.2 LPA', avgVal: 16.2, costOfLiving: 'Medium', topCompanies: ['Amazon', 'Microsoft', 'Google', 'ServiceNow'], color: '#8B5CF6' },
  { city: 'Pune', avgSalary: '14.8 LPA', avgVal: 14.8, costOfLiving: 'Medium', topCompanies: ['Infosys', 'TCS', 'PhonePe', 'Persistent'], color: '#10B981' },
  { city: 'Mumbai', avgSalary: '17.4 LPA', avgVal: 17.4, costOfLiving: 'Very High', topCompanies: ['JPMorgan', 'Jio', 'Tata Digital', 'Deutsche Bank'], color: '#F59E0B' },
  { city: 'Delhi NCR', avgSalary: '16.8 LPA', avgVal: 16.8, costOfLiving: 'High', topCompanies: ['Paytm', 'Zomato', 'Adobe', 'Samsung R&D'], color: '#EF4444' },
  { city: 'Chennai', avgSalary: '13.5 LPA', avgVal: 13.5, costOfLiving: 'Medium', topCompanies: ['Zoho', 'TCS', 'Infosys', 'Freshworks'], color: '#22D3EE' },
];

const INDUSTRY_BREAKDOWN = [
  { name: 'IT Services & Consulting', share: 32, color: '#0da2e7' },
  { name: 'Product / SaaS', share: 24, color: '#8B5CF6' },
  { name: 'Fintech', share: 14, color: '#10B981' },
  { name: 'E-Commerce', share: 12, color: '#F59E0B' },
  { name: 'Healthcare Tech', share: 8, color: '#EF4444' },
  { name: 'Ed-Tech', share: 6, color: '#22D3EE' },
  { name: 'Others', share: 4, color: '#64748B' },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const tabContentVariants = {
  initial: { opacity: 0, x: 24, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    x: -24,
    filter: 'blur(4px)',
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

const scoutCardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      type: 'spring',
      stiffness: 240,
      damping: 22,
    },
  }),
};

const badgeSpring = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.04,
      type: 'spring',
      stiffness: 420,
      damping: 14,
    },
  }),
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 },
  }),
};

const slideFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 },
  }),
};

const formFieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 },
  }),
};

const floatAnimation = {
  y: [0, -8, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

const staggerGrid = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'scout', label: 'Auto-Scout', icon: 'search' },
  { id: 'compare', label: 'Compare JD', icon: 'compare_arrows' },
  { id: 'trends', label: 'Trends & Insights', icon: 'trending_up' },
  { id: 'salary', label: 'Salary Map', icon: 'payments' },
];

/* ------------------------------------------------------------------ */
/*  Helper: Match Score Ring                                           */
/* ------------------------------------------------------------------ */

const MatchScoreRing = ({ score, size = 56 }: { score: number; size?: number }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return '#10B981';
    if (s >= 70) return '#0da2e7';
    if (s >= 55) return '#F59E0B';
    return '#EF4444';
  };

  const color = getColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={3}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Helper: Animated Bar                                               */
/* ------------------------------------------------------------------ */

const AnimatedBar = ({ value, maxValue, color, delay = 0 }: { value: number; maxValue: number; color: string; delay?: number }) => {
  const barRef = useRef(null);
  const isInView = useInView(barRef, { once: true, margin: '-20px' });
  const percentage = (value / maxValue) * 100;

  return (
    <div ref={barRef} className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <motion.div
        className="h-full rounded-full relative"
        initial={{ width: 0 }}
        animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay }}
        style={{
          background: color,
          boxShadow: `0 0 10px ${color}40`,
        }}
      >
        <span
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
          }}
        />
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Helper: Stat Pill (for hero)                                       */
/* ------------------------------------------------------------------ */

const StatPill = ({ icon, label, value, delay }: { icon: string; label: string; value: string; delay: number }) => (
  <motion.div
    className="flex items-center gap-3 px-4 py-3 rounded-xl"
    style={{
      background: 'rgba(30,41,59,0.6)',
      border: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)',
    }}
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
    whileHover={{ y: -2, borderColor: 'rgba(13,162,231,0.3)' }}
  >
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center"
      style={{ background: 'rgba(13,162,231,0.12)' }}
    >
      <Icon name={icon} size={18} className="text-[#0da2e7]" />
    </div>
    <div>
      <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Helper: Section Title                                              */
/* ------------------------------------------------------------------ */

const SectionTitle = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <motion.div className="flex items-center gap-3 mb-4" variants={itemVariants}>
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: 'rgba(13,162,231,0.12)' }}
    >
      <Icon name={icon} size={18} className="text-[#0da2e7]" />
    </div>
    <div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-[#64748B]">{subtitle}</p>}
    </div>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Market = () => {
  const { brief, autoScout, loading, error, compareJob } = useMarket();
  const [tab, setTab] = useState<Tab>('scout');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Bangalore');
  const [scoutFilter, setScoutFilter] = useState<string>('all');
  const [liveTime, setLiveTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCompare = async () => {
    if (!jobTitle.trim() || !jobDesc.trim()) return;
    setComparing(true);
    const result = await compareJob(jobTitle, company, jobDesc);
    setCompareResult(result);
    setComparing(false);
  };

  const displayJobs = autoScout.length > 0 ? autoScout : DEMO_JOBS;
  const filteredJobs = scoutFilter === 'all'
    ? displayJobs
    : displayJobs.filter((j: any) => {
        if (scoutFilter === 'high') return (j.matchScore || 0) >= 80;
        if (scoutFilter === 'bangalore') return (j.location || '').toLowerCase().includes('bangalore');
        if (scoutFilter === 'hyderabad') return (j.location || '').toLowerCase().includes('hyderabad');
        return true;
      });

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-10 h-10 rounded-full border-[3px] border-[#0da2e7]/20 border-t-[#0da2e7]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
          style={{ boxShadow: '0 0 20px rgba(13,162,231,0.25), inset 0 0 10px rgba(13,162,231,0.1)' }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ================================================================ */}
      {/*  HERO HEADER                                                      */}
      {/* ================================================================ */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(13,162,231,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(15,23,42,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Decorative glow orbs */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(13,162,231,0.15), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)' }}
        />

        <div className="relative z-10 p-6 md:p-8">
          {/* Top row: title + live badge */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <motion.div
                className="flex items-center gap-2 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <Badge variant="gradient" size="sm" dot>
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
                    </span>
                    Live Data
                  </span>
                </Badge>
                {liveTime && (
                  <span className="text-[10px] text-[#64748B] font-medium">Updated {liveTime}</span>
                )}
              </motion.div>
              <motion.h1
                className="text-2xl md:text-3xl font-bold mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
              >
                <span className="bg-gradient-to-r from-[#0da2e7] via-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradientShift_4s_ease_infinite]">
                  Market Intelligence
                </span>
              </motion.h1>
              <motion.p
                className="text-sm text-[#94A3B8] max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Real-time insights into the Indian tech job market. Scout opportunities, compare roles, and track industry trends.
              </motion.p>
            </div>

            <motion.div
              className="hidden md:flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Button variant="secondary" size="sm">
                <Icon name="download" size={16} /> Export Report
              </Button>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatPill icon="work" label="Total Jobs" value="52,400+" delay={0.15} />
            <StatPill icon="currency_rupee" label="Avg Salary" value="16.8 LPA" delay={0.2} />
            <StatPill icon="trending_up" label="Demand Growth" value="+24% YoY" delay={0.25} />
            <StatPill icon="apartment" label="Top Hiring" value="TCS, Amazon" delay={0.3} />
          </div>
        </div>
      </motion.div>

      {/* ================================================================ */}
      {/*  TABS                                                             */}
      {/* ================================================================ */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              tab === t.id
                ? 'text-white'
                : 'bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-white'
            }`}
            whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(13,162,231,0.15)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {tab === t.id && (
              <motion.span
                className="absolute inset-0 rounded-xl bg-[#0da2e7]"
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                style={{ boxShadow: '0 4px 24px rgba(13,162,231,0.3)' }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon name={t.icon} size={16} /> {t.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* ================================================================ */}
      {/*  TAB CONTENT                                                      */}
      {/* ================================================================ */}
      <AnimatePresence mode="wait">

        {/* ============================================================ */}
        {/*  AUTO-SCOUT TAB                                               */}
        {/* ============================================================ */}
        {tab === 'scout' && (
          <motion.div
            key="scout"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            {/* Filter bar */}
            <motion.div
              className="flex items-center gap-2 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <span className="text-xs text-[#64748B] mr-1">Filter:</span>
              {[
                { id: 'all', label: 'All Jobs' },
                { id: 'high', label: 'High Match (80%+)' },
                { id: 'bangalore', label: 'Bangalore' },
                { id: 'hyderabad', label: 'Hyderabad' },
              ].map((f) => (
                <motion.button
                  key={f.id}
                  onClick={() => setScoutFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    scoutFilter === f.id
                      ? 'bg-[#0da2e7]/15 text-[#0da2e7] border border-[#0da2e7]/25'
                      : 'bg-white/[0.03] text-[#94A3B8] border border-white/[0.06] hover:text-white'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {f.label}
                </motion.button>
              ))}
              <span className="ml-auto text-xs text-[#64748B]">
                {filteredJobs.length} opportunities
              </span>
            </motion.div>

            {/* Job cards */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredJobs.map((job: any, i: number) => (
                  <motion.div
                    key={job.id || i}
                    custom={i}
                    variants={scoutCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      y: -4,
                      boxShadow: '0 20px 50px -10px rgba(13,162,231,0.18)',
                      borderColor: 'rgba(13,162,231,0.35)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="rounded-2xl border border-white/[0.06] bg-[#1E293B] p-5 cursor-default group"
                    style={{
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(13,162,231,0.1)', border: '1px solid rgba(13,162,231,0.15)' }}
                        >
                          <Icon name={job.logo || 'work'} size={20} className="text-[#0da2e7]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm leading-tight">{job.jobTitle}</h3>
                          <p className="text-xs text-[#94A3B8] mt-0.5">{job.company}</p>
                        </div>
                      </div>
                      <MatchScoreRing score={job.matchScore || 70} size={48} />
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#94A3B8] mb-3 line-clamp-2 leading-relaxed">{job.summary}</p>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-[#10B981] font-medium">
                        <Icon name="currency_rupee" size={12} />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                        <Icon name="location_on" size={12} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                        <Icon name="work" size={12} />
                        {job.experience || job.type || 'Full-time'}
                      </span>
                      {job.posted && (
                        <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
                          <Icon name="schedule" size={12} />
                          {job.posted}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.slice(0, 5).map((s: string, si: number) => (
                          <motion.span
                            key={si}
                            custom={si}
                            variants={badgeSpring}
                            initial="hidden"
                            animate="visible"
                          >
                            <Badge variant="default" size="sm">{s}</Badge>
                          </motion.span>
                        ))}
                      </div>
                    )}

                    {/* Matches / Gaps row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {job.matches && job.matches.slice(0, 3).map((m: string, mi: number) => (
                        <motion.span
                          key={`m-${mi}`}
                          custom={mi}
                          variants={badgeSpring}
                          initial="hidden"
                          animate="visible"
                        >
                          <Badge variant="success" size="sm">{m}</Badge>
                        </motion.span>
                      ))}
                      {job.gaps && job.gaps.slice(0, 2).map((g: string, gi: number) => (
                        <motion.span
                          key={`g-${gi}`}
                          custom={gi}
                          variants={badgeSpring}
                          initial="hidden"
                          animate="visible"
                        >
                          <Badge variant="warning" size="sm">{g}</Badge>
                        </motion.span>
                      ))}
                    </div>

                    {/* Action row (appears on hover) */}
                    <motion.div
                      className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.07 + 0.3 }}
                    >
                      <div className="flex items-center gap-1">
                        <Icon name="bolt" size={14} className="text-[#F59E0B]" />
                        <span className="text-[10px] text-[#64748B]">AI Match Score</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details <Icon name="arrow_forward" size={14} />
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-10">
                <motion.div animate={floatAnimation}>
                  <Icon name="work" size={40} className="text-[#64748B] mx-auto mb-3" />
                </motion.div>
                <p className="text-[#94A3B8]">
                  No matches found for this filter. Try adjusting your criteria.
                </p>
              </Card>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  COMPARE JD TAB                                               */}
        {/* ============================================================ */}
        {tab === 'compare' && (
          <motion.div
            key="compare"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <Card>
              <motion.div
                className="flex items-center gap-3 mb-5"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.15)' }}
                >
                  <Icon name="compare_arrows" size={22} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Compare a Job Description</h2>
                  <p className="text-xs text-[#64748B]">Paste any JD to see how your profile matches up</p>
                </div>
              </motion.div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Title */}
                  <motion.div custom={0} variants={formFieldVariants} initial="hidden" animate="visible">
                    <label className="text-sm text-[#94A3B8] mb-1.5 block font-medium">Job Title *</label>
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Frontend Developer"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#64748B] outline-none focus:border-[#0da2e7]/50 focus:ring-1 focus:ring-[#0da2e7]/20 transition-all duration-200 text-sm"
                    />
                  </motion.div>

                  {/* Company */}
                  <motion.div custom={1} variants={formFieldVariants} initial="hidden" animate="visible">
                    <label className="text-sm text-[#94A3B8] mb-1.5 block font-medium">Company</label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Google"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#64748B] outline-none focus:border-[#0da2e7]/50 focus:ring-1 focus:ring-[#0da2e7]/20 transition-all duration-200 text-sm"
                    />
                  </motion.div>
                </div>

                {/* Job Description */}
                <motion.div custom={2} variants={formFieldVariants} initial="hidden" animate="visible">
                  <label className="text-sm text-[#94A3B8] mb-1.5 block font-medium">Job Description *</label>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full bg-[rgba(15,23,42,0.5)] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#64748B] outline-none min-h-[140px] resize-none focus:border-[#0da2e7]/50 focus:ring-1 focus:ring-[#0da2e7]/20 transition-all duration-200 text-sm leading-relaxed"
                  />
                </motion.div>

                {/* Submit button */}
                <motion.div
                  custom={3}
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Button
                    variant="primary"
                    onClick={handleCompare}
                    loading={comparing}
                    disabled={!jobTitle.trim() || !jobDesc.trim()}
                  >
                    <Icon name="compare_arrows" size={18} /> Analyze Match
                  </Button>
                </motion.div>
              </div>
            </Card>

            {/* Compare results */}
            <AnimatePresence>
              {compareResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className="space-y-4"
                >
                  {/* Overall Score */}
                  {compareResult.overallScore && (
                    <Card>
                      <div className="flex items-center gap-4">
                        <MatchScoreRing score={compareResult.overallScore} size={72} />
                        <div>
                          <h3 className="font-semibold text-white text-lg">Overall Match</h3>
                          <p className="text-sm text-[#94A3B8]">{compareResult.summary || 'Analysis complete'}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Detailed Results */}
                  <Card>
                    <h3 className="font-semibold text-white mb-4">Detailed Analysis</h3>

                    {compareResult.summary && !compareResult.overallScore && (
                      <motion.p
                        className="text-sm text-[#94A3B8] mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        {compareResult.summary}
                      </motion.p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Matches */}
                      {compareResult.matches && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[#10B981]/10">
                              <Icon name="check_circle" size={14} className="text-[#10B981]" />
                            </div>
                            <p className="text-sm font-semibold text-[#10B981]">
                              Skills Matched ({compareResult.matches.length})
                            </p>
                          </div>
                          <div className="space-y-2">
                            {compareResult.matches.map((m: string, i: number) => (
                              <motion.div
                                key={i}
                                custom={i}
                                variants={slideFromLeft}
                                initial="hidden"
                                animate="visible"
                                className="flex items-center gap-2 p-2 rounded-lg"
                                style={{ background: 'rgba(16,185,129,0.05)' }}
                              >
                                <Icon name="check" size={14} className="text-[#10B981]" />
                                <span className="text-sm text-[#CBD5E1]">{m}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gaps */}
                      {compareResult.gaps && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[#F59E0B]/10">
                              <Icon name="warning" size={14} className="text-[#F59E0B]" />
                            </div>
                            <p className="text-sm font-semibold text-[#F59E0B]">
                              Skill Gaps ({compareResult.gaps.length})
                            </p>
                          </div>
                          <div className="space-y-2">
                            {compareResult.gaps.map((g: string, i: number) => (
                              <motion.div
                                key={i}
                                custom={i}
                                variants={slideFromRight}
                                initial="hidden"
                                animate="visible"
                                className="flex items-center gap-2 p-2 rounded-lg"
                                style={{ background: 'rgba(245,158,11,0.05)' }}
                              >
                                <Icon name="arrow_upward" size={14} className="text-[#F59E0B]" />
                                <span className="text-sm text-[#CBD5E1]">{g}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    {compareResult.recommendations && compareResult.recommendations.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-white/[0.04]">
                        <p className="text-sm font-semibold text-[#0da2e7] mb-3">Recommendations</p>
                        <div className="space-y-2">
                          {compareResult.recommendations.map((r: string, i: number) => (
                            <motion.div
                              key={i}
                              className="flex items-start gap-2"
                              initial={{ opacity: 0, x: -14 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
                            >
                              <Icon name="lightbulb" size={14} className="text-[#0da2e7] mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-[#94A3B8]">{r}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Placeholder when no result yet */}
            {!compareResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="text-center py-8">
                  <motion.div animate={floatAnimation}>
                    <Icon name="compare_arrows" size={36} className="text-[#64748B] mx-auto mb-3" />
                  </motion.div>
                  <p className="text-sm text-[#94A3B8] mb-1">Paste a job description above to get started</p>
                  <p className="text-xs text-[#64748B]">
                    Our AI will analyze the JD against your profile and show skill matches, gaps, and recommendations
                  </p>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  TRENDS & INSIGHTS TAB                                        */}
        {/* ============================================================ */}
        {tab === 'trends' && (
          <motion.div
            key="trends"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* Market Brief (from API if available) */}
            {brief && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
              >
                <Card glow>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="auto_awesome" size={18} className="text-[#0da2e7]" />
                    <h2 className="text-base font-semibold text-white">AI Market Brief</h2>
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {brief.title || brief.deltaSummary || 'Latest market intelligence'}
                  </p>
                  {brief.recommendations && (
                    <div className="mt-3 space-y-2">
                      {brief.recommendations.map((r: string, i: number) => (
                        <motion.div
                          key={i}
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, x: -14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 280, damping: 22 }}
                        >
                          <Icon name="lightbulb" size={14} className="text-[#0da2e7] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[#94A3B8]">{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* ---- Top In-Demand Skills ---- */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SectionTitle icon="trending_up" title="Top In-Demand Skills" subtitle="Current demand in Indian tech market" />
              <Card>
                <div className="space-y-3.5">
                  {TRENDING_SKILLS.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      custom={i}
                      variants={gridItem}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{skill.name}</span>
                          <Badge variant="default" size="sm">{skill.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color: skill.color }}>
                            {skill.demand}%
                          </span>
                          <span className="text-[10px] text-[#10B981] font-medium">{skill.growth}</span>
                        </div>
                      </div>
                      <AnimatedBar value={skill.demand} maxValue={100} color={skill.color} delay={i * 0.05} />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* ---- Hiring Trends by Company ---- */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SectionTitle icon="apartment" title="Hiring Trends by Company" subtitle="Top tech employers in India" />
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                variants={staggerGrid}
                initial="hidden"
                animate="visible"
              >
                {HIRING_COMPANIES.map((comp) => (
                  <motion.div
                    key={comp.name}
                    variants={gridItem}
                    whileHover={{
                      y: -3,
                      boxShadow: '0 12px 40px -8px rgba(13,162,231,0.15)',
                      borderColor: 'rgba(13,162,231,0.25)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="rounded-xl border border-white/[0.06] bg-[#1E293B] p-4 cursor-default"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(13,162,231,0.08)', border: '1px solid rgba(13,162,231,0.1)' }}
                      >
                        <Icon name={comp.logo} size={18} className="text-[#0da2e7]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{comp.name}</h4>
                        <span className="text-[10px] text-[#64748B]">{comp.type}</span>
                      </div>
                      <Badge variant="success" size="sm" className="ml-auto">{comp.growth}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(15,23,42,0.4)' }}>
                        <p className="text-[10px] text-[#64748B] mb-0.5">Open Roles</p>
                        <p className="text-sm font-bold text-white">{comp.openPositions.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(15,23,42,0.4)' }}>
                        <p className="text-[10px] text-[#64748B] mb-0.5">Avg Package</p>
                        <p className="text-sm font-bold text-[#10B981]">{comp.avgPackage}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* ---- Hot Job Roles ---- */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SectionTitle icon="local_fire_department" title="Hot Job Roles" subtitle="Fastest growing roles in 2025" />
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                variants={staggerGrid}
                initial="hidden"
                animate="visible"
              >
                {HOT_ROLES.map((role) => {
                  const demandColors: Record<string, string> = {
                    'Very High': '#EF4444',
                    'High': '#F59E0B',
                    'Medium': '#0da2e7',
                  };
                  const demandBadge: Record<string, 'error' | 'warning' | 'accent'> = {
                    'Very High': 'error',
                    'High': 'warning',
                    'Medium': 'accent',
                  };
                  return (
                    <motion.div
                      key={role.title}
                      variants={gridItem}
                      whileHover={{
                        y: -2,
                        borderColor: `${demandColors[role.demandLevel]}30`,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      className="rounded-xl border border-white/[0.06] bg-[#1E293B] p-4 cursor-default"
                      style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `${demandColors[role.demandLevel]}15` }}
                        >
                          <Icon name={role.icon} size={16} style={{ color: demandColors[role.demandLevel] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{role.title}</h4>
                          <Badge variant={demandBadge[role.demandLevel]} size="sm">{role.demandLevel} Demand</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-[#64748B] mb-0.5">Growth</p>
                          <p className="text-xs font-bold text-[#10B981]">{role.growth}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748B] mb-0.5">Avg Salary</p>
                          <p className="text-xs font-bold text-white">{role.avgSalary}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748B] mb-0.5">Openings</p>
                          <p className="text-xs font-bold text-[#0da2e7]">{role.openings}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* ---- Industry Demand Breakdown ---- */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SectionTitle icon="donut_large" title="Industry Demand Breakdown" subtitle="Hiring distribution by industry" />
              <Card>
                <div className="space-y-3">
                  {INDUSTRY_BREAKDOWN.map((ind, i) => (
                    <motion.div
                      key={ind.name}
                      custom={i}
                      variants={gridItem}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: ind.color }} />
                          <span className="text-sm text-white">{ind.name}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: ind.color }}>
                          {ind.share}%
                        </span>
                      </div>
                      <AnimatedBar value={ind.share} maxValue={40} color={ind.color} delay={i * 0.06} />
                    </motion.div>
                  ))}
                </div>

                {/* Visual pie indicator */}
                <div className="flex items-center justify-center mt-6 pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    {INDUSTRY_BREAKDOWN.map((ind) => (
                      <div key={ind.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: ind.color }} />
                        <span className="text-[10px] text-[#64748B]">{ind.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  SALARY MAP TAB                                               */}
        {/* ============================================================ */}
        {tab === 'salary' && (
          <motion.div
            key="salary"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {/* ---- Role-Based Salary Comparison ---- */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SectionTitle icon="payments" title="Salary by Role & Experience" subtitle="Average salary ranges in LPA (Lakhs Per Annum)" />
              <Card>
                {/* Legend */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#0da2e7]" />
                    <span className="text-[11px] text-[#94A3B8]">Fresher (0-2 yrs)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#8B5CF6]" />
                    <span className="text-[11px] text-[#94A3B8]">Mid (2-5 yrs)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#10B981]" />
                    <span className="text-[11px] text-[#94A3B8]">Senior (5+ yrs)</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {SALARY_DATA.map((data, i) => (
                    <motion.div
                      key={data.role}
                      custom={i}
                      variants={gridItem}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name={data.icon} size={16} className="text-[#0da2e7]" />
                        <span className="text-sm font-medium text-white">{data.role}</span>
                      </div>

                      {/* Fresher */}
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[10px] text-[#64748B] w-14 text-right">Fresher</span>
                        <div className="flex-1">
                          <AnimatedBar value={data.fresherVal} maxValue={55} color="#0da2e7" delay={i * 0.04} />
                        </div>
                        <span className="text-[11px] text-[#0da2e7] font-medium w-16 text-right">{data.fresher}</span>
                      </div>

                      {/* Mid */}
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[10px] text-[#64748B] w-14 text-right">Mid</span>
                        <div className="flex-1">
                          <AnimatedBar value={data.midVal} maxValue={55} color="#8B5CF6" delay={i * 0.04 + 0.1} />
                        </div>
                        <span className="text-[11px] text-[#8B5CF6] font-medium w-16 text-right">{data.mid}</span>
                      </div>

                      {/* Senior */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[#64748B] w-14 text-right">Senior</span>
                        <div className="flex-1">
                          <AnimatedBar value={data.seniorVal} maxValue={55} color="#10B981" delay={i * 0.04 + 0.2} />
                        </div>
                        <span className="text-[11px] text-[#10B981] font-medium w-16 text-right">{data.senior}</span>
                      </div>

                      {i < SALARY_DATA.length - 1 && (
                        <div className="border-b border-white/[0.03] mt-4" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* ---- Experience Level Salary Progression ---- */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SectionTitle icon="show_chart" title="Experience Level Progression" subtitle="How salary grows with experience across roles" />
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
                variants={staggerGrid}
                initial="hidden"
                animate="visible"
              >
                {[
                  {
                    level: 'Fresher',
                    experience: '0-2 Years',
                    avgRange: '4-14 LPA',
                    icon: 'school',
                    color: '#0da2e7',
                    description: 'Campus placements and first jobs. Strong foundations in DSA and one framework is key.',
                    topSkills: ['DSA', 'React/Angular', 'Python', 'SQL'],
                    tips: 'Focus on strong fundamentals, contribute to open source, and build 2-3 solid projects.',
                  },
                  {
                    level: 'Mid-Level',
                    experience: '2-5 Years',
                    avgRange: '10-35 LPA',
                    icon: 'engineering',
                    color: '#8B5CF6',
                    description: 'Rapid growth phase. System design knowledge and cloud skills differentiate candidates.',
                    topSkills: ['System Design', 'AWS/GCP', 'Docker', 'CI/CD'],
                    tips: 'Lead features end-to-end, learn system design, and specialize in a niche domain.',
                  },
                  {
                    level: 'Senior',
                    experience: '5+ Years',
                    avgRange: '20-65 LPA',
                    icon: 'military_tech',
                    color: '#10B981',
                    description: 'Leadership and architecture roles. Deep expertise and cross-team impact drive top compensation.',
                    topSkills: ['Architecture', 'Leadership', 'Strategy', 'Mentoring'],
                    tips: 'Build T-shaped expertise, mentor juniors, and drive org-level technical decisions.',
                  },
                ].map((level) => (
                  <motion.div
                    key={level.level}
                    variants={gridItem}
                    whileHover={{
                      y: -4,
                      borderColor: `${level.color}40`,
                      boxShadow: `0 16px 48px -12px ${level.color}20`,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="rounded-2xl border border-white/[0.06] bg-[#1E293B] p-5 cursor-default"
                    style={{
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${level.color}15`, border: `1px solid ${level.color}20` }}
                      >
                        <Icon name={level.icon} size={20} style={{ color: level.color }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{level.level}</h4>
                        <span className="text-[10px] text-[#64748B]">{level.experience}</span>
                      </div>
                    </div>

                    <div
                      className="text-center py-3 rounded-lg mb-3"
                      style={{ background: `${level.color}08`, border: `1px solid ${level.color}12` }}
                    >
                      <p className="text-[10px] text-[#64748B] mb-0.5">Salary Range</p>
                      <p className="text-lg font-bold" style={{ color: level.color }}>{level.avgRange}</p>
                    </div>

                    <p className="text-xs text-[#94A3B8] mb-3 leading-relaxed">{level.description}</p>

                    <div className="mb-3">
                      <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1.5">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {level.topSkills.map((s) => (
                          <Badge key={s} variant="default" size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div
                      className="p-2.5 rounded-lg flex items-start gap-2"
                      style={{ background: 'rgba(13,162,231,0.05)' }}
                    >
                      <Icon name="tips_and_updates" size={14} className="text-[#0da2e7] mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">{level.tips}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* ---- City-wise Salary Comparison ---- */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SectionTitle icon="location_on" title="City-wise Salary Comparison" subtitle="Average tech salaries across major Indian cities" />

              {/* City selector */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {CITY_SALARIES.map((cs) => (
                  <motion.button
                    key={cs.city}
                    onClick={() => setSelectedCity(cs.city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCity === cs.city
                        ? 'text-white'
                        : 'bg-white/[0.03] text-[#94A3B8] border border-white/[0.06] hover:text-white'
                    }`}
                    style={
                      selectedCity === cs.city
                        ? {
                            background: `${cs.color}20`,
                            border: `1px solid ${cs.color}40`,
                            color: cs.color,
                          }
                        : undefined
                    }
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {cs.city}
                  </motion.button>
                ))}
              </div>

              {/* City Comparison Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                variants={staggerGrid}
                initial="hidden"
                animate="visible"
              >
                {CITY_SALARIES.map((cs, i) => {
                  const isSelected = selectedCity === cs.city;
                  return (
                    <motion.div
                      key={cs.city}
                      variants={gridItem}
                      onClick={() => setSelectedCity(cs.city)}
                      whileHover={{ y: -3, borderColor: `${cs.color}40` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected ? 'ring-1' : ''
                      }`}
                      style={{
                        background: isSelected ? `${cs.color}08` : 'rgba(30,41,59,1)',
                        borderColor: isSelected ? `${cs.color}30` : 'rgba(255,255,255,0.06)',
                        boxShadow: isSelected
                          ? `0 8px 32px -8px ${cs.color}25, inset 0 1px 0 rgba(255,255,255,0.05)`
                          : '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${cs.color}15` }}
                          >
                            <Icon name="location_city" size={16} style={{ color: cs.color }} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{cs.city}</h4>
                            <span className="text-[10px] text-[#64748B]">COL: {cs.costOfLiving}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            <Icon name="check_circle" size={18} style={{ color: cs.color }} />
                          </motion.div>
                        )}
                      </div>

                      <div
                        className="text-center py-2.5 rounded-lg mb-3"
                        style={{ background: `${cs.color}08`, border: `1px solid ${cs.color}10` }}
                      >
                        <p className="text-[10px] text-[#64748B] mb-0.5">Avg Tech Salary</p>
                        <p className="text-lg font-bold" style={{ color: cs.color }}>{cs.avgSalary}</p>
                      </div>

                      {/* Salary bar relative to highest */}
                      <div className="mb-3">
                        <AnimatedBar value={cs.avgVal} maxValue={20} color={cs.color} delay={i * 0.05} />
                      </div>

                      <div>
                        <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1.5">Top Companies</p>
                        <div className="flex flex-wrap gap-1">
                          {cs.topCompanies.map((c) => (
                            <Badge key={c} variant="default" size="sm">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Detailed view for selected city */}
              <AnimatePresence mode="wait">
                {selectedCity && (
                  <motion.div
                    key={selectedCity}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className="mt-4"
                  >
                    <Card>
                      {(() => {
                        const city = CITY_SALARIES.find((c) => c.city === selectedCity);
                        if (!city) return null;
                        return (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: `${city.color}15`, border: `1px solid ${city.color}20` }}
                              >
                                <Icon name="location_city" size={20} style={{ color: city.color }} />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-white">{city.city} Tech Ecosystem</h3>
                                <p className="text-xs text-[#64748B]">Role-wise salary breakdown</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {SALARY_DATA.slice(0, 6).map((role, ri) => {
                                const cityMultiplier = city.avgVal / 16.8;
                                const adjustedMid = Math.round(role.midVal * cityMultiplier * 10) / 10;
                                return (
                                  <motion.div
                                    key={role.role}
                                    className="flex items-center gap-3 p-3 rounded-lg"
                                    style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: ri * 0.05 }}
                                  >
                                    <Icon name={role.icon} size={16} className="text-[#94A3B8]" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-white truncate">{role.role}</p>
                                      <p className="text-[10px] text-[#64748B]">Mid-level avg</p>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: city.color }}>
                                      {adjustedMid.toFixed(1)} LPA
                                    </span>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Error banner ---- */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center gap-2 text-sm text-[#EF4444] p-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <Icon name="error" size={16} className="text-[#EF4444]" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Market;
