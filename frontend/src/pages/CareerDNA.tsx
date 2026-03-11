import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { featuresAPI, profileAPI } from '../services/api';

/* ── Animation Variants ── */
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};

/* ── Career DNA Types ── */
interface DNAType {
  label: string;
  tagline: string;
  gradient: string;
  accentColor: string;
  icon: string;
}

const DNA_TYPES: Record<string, DNAType> = {
  innovator: {
    label: 'The Innovator',
    tagline: 'You see patterns others miss and create solutions that redefine what is possible.',
    gradient: 'linear-gradient(135deg, #0066FF, #22D3EE)',
    accentColor: '#0066FF',
    icon: 'auto_awesome',
  },
  strategist: {
    label: 'The Strategist',
    tagline: 'A systems thinker who plans ten steps ahead with precision and clarity.',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    accentColor: '#7C3AED',
    icon: 'psychology',
  },
  builder: {
    label: 'The Builder',
    tagline: 'You turn ideas into reality, one elegant solution at a time.',
    gradient: 'linear-gradient(135deg, #10B981, #34D399)',
    accentColor: '#10B981',
    icon: 'construction',
  },
  communicator: {
    label: 'The Communicator',
    tagline: 'You bridge the gap between complex ideas and human understanding.',
    gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    accentColor: '#F59E0B',
    icon: 'campaign',
  },
};

/* ── Skill Dimension Data ── */
interface SkillDimension {
  name: string;
  score: number;
  icon: string;
  color: string;
  description: string;
  subSkills: string[];
}

const SKILL_DIMENSIONS: SkillDimension[] = [
  {
    name: 'Technical',
    score: 82,
    icon: 'terminal',
    color: '#0066FF',
    description: 'Strong aptitude in software systems, algorithms, and engineering principles. You think in logic and code.',
    subSkills: ['Data Structures', 'System Design', 'Cloud Architecture'],
  },
  {
    name: 'Creative',
    score: 68,
    icon: 'palette',
    color: '#7C3AED',
    description: 'You approach problems with originality. Your ideas often connect dots others overlook.',
    subSkills: ['Design Thinking', 'UX Intuition', 'Content Strategy'],
  },
  {
    name: 'Analytical',
    score: 91,
    icon: 'analytics',
    color: '#22D3EE',
    description: 'Exceptional at breaking down complex problems into structured, solvable components.',
    subSkills: ['Data Analysis', 'Critical Reasoning', 'Pattern Recognition'],
  },
  {
    name: 'Leadership',
    score: 73,
    icon: 'groups',
    color: '#F59E0B',
    description: 'Natural ability to guide teams, align vision, and inspire collective effort toward goals.',
    subSkills: ['Team Building', 'Decision Making', 'Conflict Resolution'],
  },
  {
    name: 'Communication',
    score: 77,
    icon: 'forum',
    color: '#10B981',
    description: 'You articulate ideas clearly and adapt your message to different audiences effectively.',
    subSkills: ['Presentation', 'Technical Writing', 'Active Listening'],
  },
  {
    name: 'Problem Solving',
    score: 88,
    icon: 'lightbulb',
    color: '#EF4444',
    description: 'Thrives under pressure. You find elegant solutions where others see only obstacles.',
    subSkills: ['Root Cause Analysis', 'Creative Solutions', 'Debugging'],
  },
];

/* ── Personality Traits ── */
interface PersonalityTrait {
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100, 50 is center
  leftIcon: string;
  rightIcon: string;
  color: string;
}

const PERSONALITY_TRAITS: PersonalityTrait[] = [
  { leftLabel: 'Introvert', rightLabel: 'Extrovert', value: 38, leftIcon: 'self_improvement', rightIcon: 'diversity_3', color: '#7C3AED' },
  { leftLabel: 'Thinker', rightLabel: 'Feeler', value: 72, leftIcon: 'psychology', rightIcon: 'favorite', color: '#0066FF' },
  { leftLabel: 'Planner', rightLabel: 'Improviser', value: 65, leftIcon: 'event_note', rightIcon: 'bolt', color: '#10B981' },
  { leftLabel: 'Specialist', rightLabel: 'Generalist', value: 42, leftIcon: 'target', rightIcon: 'blur_on', color: '#F59E0B' },
  { leftLabel: 'Independent', rightLabel: 'Collaborative', value: 55, leftIcon: 'person', rightIcon: 'group', color: '#22D3EE' },
  { leftLabel: 'Cautious', rightLabel: 'Risk-Taker', value: 70, leftIcon: 'shield', rightIcon: 'rocket_launch', color: '#EF4444' },
];

/* ── Career Matches ── */
interface CareerMatch {
  title: string;
  matchPercent: number;
  salaryRange: string;
  growth: string;
  growthLabel: 'High' | 'Very High' | 'Moderate';
  icon: string;
  color: string;
  tags: string[];
}

const CAREER_MATCHES: CareerMatch[] = [
  {
    title: 'Full-Stack Engineer',
    matchPercent: 94,
    salaryRange: '12-30 LPA',
    growth: '+28%',
    growthLabel: 'Very High',
    icon: 'code',
    color: '#0066FF',
    tags: ['Tech', 'Product', 'Startup-Friendly'],
  },
  {
    title: 'Data Scientist',
    matchPercent: 89,
    salaryRange: '14-35 LPA',
    growth: '+32%',
    growthLabel: 'Very High',
    icon: 'query_stats',
    color: '#7C3AED',
    tags: ['AI/ML', 'Analytics', 'Research'],
  },
  {
    title: 'Cloud Solutions Architect',
    matchPercent: 85,
    salaryRange: '18-42 LPA',
    growth: '+25%',
    growthLabel: 'High',
    icon: 'cloud',
    color: '#22D3EE',
    tags: ['Infrastructure', 'DevOps', 'Enterprise'],
  },
  {
    title: 'Product Manager',
    matchPercent: 78,
    salaryRange: '15-38 LPA',
    growth: '+20%',
    growthLabel: 'High',
    icon: 'inventory_2',
    color: '#10B981',
    tags: ['Strategy', 'Cross-functional', 'Growth'],
  },
  {
    title: 'AI/ML Engineer',
    matchPercent: 74,
    salaryRange: '16-40 LPA',
    growth: '+35%',
    growthLabel: 'Very High',
    icon: 'smart_toy',
    color: '#F59E0B',
    tags: ['Deep Learning', 'NLP', 'Research'],
  },
];

/* ── Percentile Rankings ── */
interface PercentileRank {
  dimension: string;
  percentile: number;
  icon: string;
  color: string;
}

const PERCENTILE_RANKINGS: PercentileRank[] = [
  { dimension: 'Technical Skills', percentile: 87, icon: 'terminal', color: '#0066FF' },
  { dimension: 'Analytical Ability', percentile: 93, icon: 'analytics', color: '#22D3EE' },
  { dimension: 'Problem Solving', percentile: 91, icon: 'lightbulb', color: '#EF4444' },
  { dimension: 'Communication', percentile: 72, icon: 'forum', color: '#10B981' },
  { dimension: 'Leadership', percentile: 68, icon: 'groups', color: '#F59E0B' },
  { dimension: 'Creativity', percentile: 75, icon: 'palette', color: '#7C3AED' },
];

/* ── SVG Radar Chart Component ── */
const RadarChart = ({ dimensions, size = 220 }: { dimensions: SkillDimension[]; size?: number }) => {
  const center = size / 2;
  const radius = size / 2 - 30;
  const levels = 4;
  const angleStep = (Math.PI * 2) / dimensions.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const levelRadius = ((i + 1) / levels) * radius;
    const points = dimensions.map((_, idx) => {
      const angle = angleStep * idx - Math.PI / 2;
      return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
    });
    return points.join(' ');
  });

  const axisLines = dimensions.map((_, idx) => {
    const angle = angleStep * idx - Math.PI / 2;
    return {
      x2: center + radius * Math.cos(angle),
      y2: center + radius * Math.sin(angle),
    };
  });

  const dataPoints = dimensions.map((dim, idx) => getPoint(idx, dim.score));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const labelPoints = dimensions.map((dim, idx) => {
    const angle = angleStep * idx - Math.PI / 2;
    const labelRadius = radius + 22;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      name: dim.name,
      score: dim.score,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0066FF" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid levels */}
      {gridLevels.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
      ))}

      {/* Data polygon fill */}
      <motion.polygon
        points={dataPath}
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="url(#radarGlow)"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      {/* Data points */}
      {dataPoints.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={dimensions[i].color}
          stroke="#0F172A"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 300 }}
          style={{ filter: `drop-shadow(0 0 4px ${dimensions[i].color}80)` }}
        />
      ))}

      {/* Labels */}
      {labelPoints.map((lp, i) => (
        <text
          key={i}
          x={lp.x}
          y={lp.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-secondary"
          style={{ fontSize: '10px', fontWeight: 600 }}
        >
          {lp.name}
        </text>
      ))}
    </svg>
  );
};

/* ── Main Page Component ── */
const CareerDNA = () => {
  const userName = localStorage.getItem('userName') || 'Student';
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null);

  // Load profile analysis + saved Career DNA on mount
  useEffect(() => {
    profileAPI.getAnalysis().then(res => {
      if (res.data?.parsed) setProfileAnalysis(res.data.parsed);
    }).catch(() => {});
    featuresAPI.getCareerDNA().then(res => {
      if (res.data?.data) setAiData(res.data.data);
    }).catch(() => {});
  }, []);

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const res = await featuresAPI.generateCareerDNA({
        profile: {
          name: userName,
          ...(profileAnalysis || {}),
        },
      });
      if (res.data?.data) setAiData(res.data.data);
    } catch (err: any) {
      setAiError(err?.response?.data?.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Use AI data if available, otherwise fall back to static data
  const dimensions = aiData?.dimensions || SKILL_DIMENSIONS;
  const personalityTraits = aiData?.personalityTraits || PERSONALITY_TRAITS;
  const careerMatches = aiData?.careerMatches || CAREER_MATCHES;
  const dnaType = aiData?.dnaType
    ? { label: aiData.dnaType, tagline: aiData.tagline || '', gradient: 'linear-gradient(135deg, #0066FF, #22D3EE)', accentColor: '#0066FF', icon: 'auto_awesome' }
    : DNA_TYPES.innovator;
  const strengths = aiData?.strengths || [];
  const idealRoles = aiData?.idealRoles || ['Full-Stack Engineer', 'Solutions Architect', 'Technical Lead'];
  const aiInsight = aiData?.aiInsight || null;

  const topStrengths = useMemo(() => {
    if (strengths.length) return strengths.slice(0, 3).map((s: string, i: number) => ({ name: s, score: 90 - i * 5, color: ['#0066FF', '#7C3AED', '#10B981'][i] }));
    return [...SKILL_DIMENSIONS].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [dimensions, strengths]);

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
      {/* ───────────────────────── SECTION 1: Header ───────────────────────── */}
      <motion.div variants={item}>
        <div
          className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,102,255,0.08), rgba(124,58,237,0.05), rgba(15,23,42,0.9))',
            border: '1px solid rgba(0,102,255,0.1)',
          }}
        >
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 dot-pattern opacity-25 pointer-events-none" />

          {/* Aurora orbs */}
          <motion.div
            className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-60 h-60 rounded-full opacity-[0.04] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-48 h-48 rounded-full opacity-[0.03] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #22D3EE, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-[1]">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(124,58,237,0.1))',
                  border: '1px solid rgba(0,102,255,0.2)',
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon name="fingerprint" size={22} className="text-accent" />
              </motion.div>
              <Badge variant="gradient" size="sm" dot>AI-Powered Analysis</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-3">
              Your Career DNA
            </h1>
            <p className="text-sm md:text-base text-secondary mt-1.5 max-w-2xl">
              A unique blueprint of your skills, personality, and career potential. Based on your assessment
              results, AI analysis, and behavioral patterns.
            </p>

            {/* Generate with AI button */}
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="primary"
                size="sm"
                loading={isGenerating}
                onClick={handleGenerateWithAI}
              >
                <Icon name="auto_awesome" size={16} />
                {aiData ? 'Regenerate with AI' : 'Generate with AI'}
              </Button>
              {aiData && <Badge variant="success" size="sm" dot>AI Generated</Badge>}
              {aiError && <span className="text-xs text-error">{aiError}</span>}
            </div>

            {aiInsight && (
              <div className="mt-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-xs text-secondary"><span className="text-accent font-semibold">AI Insight:</span> {aiInsight}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-5">
              {(['overview', 'details'] as const).map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'text-white'
                      : 'text-muted hover:text-secondary'
                  }`}
                  style={
                    activeTab === tab
                      ? {
                          background: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(124,58,237,0.1))',
                          border: '1px solid rgba(0,102,255,0.2)',
                          boxShadow: '0 0 20px rgba(0,102,255,0.1)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon name={tab === 'overview' ? 'dashboard' : 'tune'} size={16} />
                    {tab === 'overview' ? 'Overview' : 'Detailed Analysis'}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ───────────────────── SECTION 2: Career DNA Card (Shareable) ───────────────────── */}
      <motion.div variants={item}>
        <Card tilt glass depth="floating" className="relative">
          {/* Card decorative elements */}
          <div
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full opacity-[0.04] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }}
          />

          {/* Gradient border top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
            style={{ background: dnaType.gradient }}
          />

          <div className="relative z-[1]">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${dnaType.accentColor}20, ${dnaType.accentColor}08)`,
                    border: `1px solid ${dnaType.accentColor}30`,
                    boxShadow: `0 0 24px ${dnaType.accentColor}15`,
                  }}
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon name={dnaType.icon} size={28} style={{ color: dnaType.accentColor }} filled />
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: `2px solid ${dnaType.accentColor}40` }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{userName}</h2>
                    <Badge variant="accent" size="sm">
                      <Icon name="verified" size={11} /> Verified
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary mt-0.5">Career DNA Profile</p>
                </div>
              </div>

              {/* DNA Type Badge */}
              <div className="hidden sm:flex flex-col items-end gap-1.5">
                <div
                  className="px-4 py-2 rounded-xl text-sm font-extrabold text-white"
                  style={{
                    background: dnaType.gradient,
                    boxShadow: `0 4px 20px ${dnaType.accentColor}30`,
                  }}
                >
                  {dnaType.label}
                </div>
                <span className="text-[10px] text-muted uppercase tracking-widest font-semibold">DNA Type</span>
              </div>
            </div>

            {/* Mobile DNA Type (shows on small screens) */}
            <div className="sm:hidden mb-4">
              <div
                className="px-4 py-2 rounded-xl text-sm font-extrabold text-white inline-block"
                style={{
                  background: dnaType.gradient,
                  boxShadow: `0 4px 20px ${dnaType.accentColor}30`,
                }}
              >
                {dnaType.label}
              </div>
            </div>

            {/* Tagline */}
            <p className="text-sm text-secondary italic leading-relaxed mb-6 border-l-2 pl-4" style={{ borderColor: `${dnaType.accentColor}40` }}>
              &ldquo;{dnaType.tagline}&rdquo;
            </p>

            {/* Main content: Radar + Info side by side */}
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Radar Chart */}
              <motion.div
                className="flex-shrink-0 relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Glow behind chart */}
                <div
                  className="absolute inset-0 rounded-full opacity-[0.08] blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${dnaType.accentColor}, transparent 70%)` }}
                />
                <RadarChart dimensions={dimensions} size={240} />
              </motion.div>

              {/* Right side info */}
              <div className="flex-1 space-y-5 w-full">
                {/* Top 3 Strengths */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-2.5">Top Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {topStrengths.map((s: any, i: number) => (
                      <motion.div
                        key={s.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 300 }}
                      >
                        <Badge
                          variant={i === 0 ? 'accent' : i === 1 ? 'violet' : 'success'}
                          size="md"
                          dot
                        >
                          {s.name} - {s.score}%
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Ideal Roles */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-2.5">Ideal Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {idealRoles.map((role: any, i: number) => (
                      <motion.div
                        key={role}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                      >
                        <Icon name="arrow_right" size={14} className="text-accent" />
                        <span className="text-sm text-white font-medium">{role}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Overall Score', value: '82', icon: 'speed', color: '#0066FF' },
                    { label: 'Percentile', value: 'Top 12%', icon: 'leaderboard', color: '#7C3AED' },
                    { label: 'Career Fit', value: '94%', icon: 'check_circle', color: '#10B981' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="text-center p-3 rounded-xl"
                      style={{
                        background: `${stat.color}06`,
                        border: `1px solid ${stat.color}12`,
                      }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.08 }}
                    >
                      <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
                      <p className="text-lg font-extrabold text-white mt-1">{stat.value}</p>
                      <p className="text-[10px] text-muted font-medium uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.04]">
              <Button variant="primary" size="sm">
                <Icon name="share" size={16} />
                Share on LinkedIn
              </Button>
              <Button variant="secondary" size="sm">
                <Icon name="download" size={16} />
                Download Card
              </Button>
              <div className="flex-1" />
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted">
                <Icon name="fingerprint" size={14} className="text-accent/40" />
                <span>DNA-{userName.slice(0, 2).toUpperCase()}-{Math.floor(Math.random() * 9000 + 1000)}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ──────────────── SECTION 3: DNA Breakdown - 6 Skill Dimensions ──────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10">
            <Icon name="scatter_plot" size={18} className="text-accent" />
          </div>
          <h2 className="text-lg font-bold text-white">DNA Breakdown</h2>
          <Badge variant="default" size="sm">6 Dimensions</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensions.map((dim: any, i: number) => {
            const barColor: 'accent' | 'success' | 'warning' | 'error' | 'violet' | 'gradient' =
              dim.score >= 85 ? 'success' : dim.score >= 70 ? 'accent' : dim.score >= 50 ? 'warning' : 'error';
            return (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
              >
                <Card glass hover>
                  {/* Color accent bar at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none rounded-t-2xl"
                    style={{ background: dim.color }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${dim.color}12`,
                          border: `1px solid ${dim.color}20`,
                        }}
                      >
                        <Icon name={dim.icon} size={20} style={{ color: dim.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{dim.name}</h3>
                        <span className="text-[11px] text-muted">Dimension Score</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-white">{dim.score}</span>
                      <span className="text-xs text-muted">/100</span>
                    </div>
                  </div>

                  <ProgressBar value={dim.score} color={barColor} size="sm" className="mb-3" />

                  <p className="text-xs text-secondary leading-relaxed mb-3">
                    {dim.description}
                  </p>

                  {/* Sub-skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {dim.subSkills.map((sub: any) => (
                      <span
                        key={sub}
                        className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                        style={{
                          background: `${dim.color}08`,
                          color: dim.color,
                          border: `1px solid ${dim.color}15`,
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ──────────────── SECTION 4: Personality Traits Grid ──────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
            <Icon name="psychology_alt" size={18} style={{ color: '#7C3AED' }} />
          </div>
          <h2 className="text-lg font-bold text-white">Personality Traits</h2>
          <Badge variant="violet" size="sm">Behavioral Map</Badge>
        </div>

        <Card glass>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {personalityTraits.map((trait: any, i: number) => (
              <motion.div
                key={trait.leftLabel}
                className="space-y-2"
                initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 160, damping: 20 }}
              >
                {/* Labels row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon name={trait.leftIcon} size={14} style={{ color: trait.color }} />
                    <span className={`text-xs font-semibold ${trait.value < 50 ? 'text-white' : 'text-secondary'}`}>
                      {trait.leftLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${trait.value >= 50 ? 'text-white' : 'text-secondary'}`}>
                      {trait.rightLabel}
                    </span>
                    <Icon name={trait.rightIcon} size={14} style={{ color: trait.color }} />
                  </div>
                </div>

                {/* Spectrum slider */}
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {/* Track fill - subtle gradient showing direction */}
                  <motion.div
                    className="absolute top-0 bottom-0 rounded-full"
                    style={{
                      left: trait.value < 50 ? `${trait.value}%` : '50%',
                      width: trait.value < 50 ? `${50 - trait.value}%` : `${trait.value - 50}%`,
                      background: `${trait.color}25`,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                  />

                  {/* Center marker */}
                  <div
                    className="absolute top-0 bottom-0 w-px"
                    style={{ left: '50%', background: 'rgba(255,255,255,0.1)' }}
                  />

                  {/* Active indicator dot */}
                  <motion.div
                    className="absolute top-1/2 w-4 h-4 rounded-full -translate-y-1/2 -translate-x-1/2"
                    style={{
                      background: trait.color,
                      boxShadow: `0 0 10px ${trait.color}60, 0 0 20px ${trait.color}30`,
                      border: '2px solid rgba(15,23,42,0.8)',
                    }}
                    initial={{ left: '50%' }}
                    animate={{ left: `${trait.value}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.6, type: 'spring', stiffness: 120, damping: 18 }}
                  />
                </div>

                {/* Percentage indicator */}
                <div className="text-center">
                  <span className="text-[10px] text-muted font-medium">
                    {trait.value < 50
                      ? `${100 - trait.value}% ${trait.leftLabel}`
                      : trait.value > 50
                        ? `${trait.value}% ${trait.rightLabel}`
                        : 'Balanced'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary insight */}
          <div
            className="mt-5 pt-4 border-t border-white/[0.04] flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <Icon name="auto_awesome" size={16} style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <p className="text-xs text-secondary leading-relaxed">
                <span className="text-white font-semibold">AI Insight:</span> Your personality profile suggests a{' '}
                <span className="text-[#7C3AED] font-semibold">reflective thinker</span> who thrives in roles requiring deep analysis
                and structured problem-solving. You lean toward independent work but collaborate effectively when needed.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ──────────────── SECTION 5: Ideal Career Paths ──────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-success/10">
              <Icon name="route" size={18} className="text-success" />
            </div>
            <h2 className="text-lg font-bold text-white">Ideal Career Paths</h2>
            <Badge variant="success" size="sm" dot>Top 5 Matches</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {careerMatches.map((career: any, i: number) => {
            const barColor: 'accent' | 'success' | 'warning' | 'error' | 'violet' | 'gradient' =
              career.matchPercent >= 90 ? 'gradient' : career.matchPercent >= 80 ? 'accent' : career.matchPercent >= 70 ? 'violet' : 'warning';
            return (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 160, damping: 20 }}
              >
                <Card glass hover>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <motion.div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                        style={{
                          background: `${career.color}12`,
                          border: `1px solid ${career.color}20`,
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon name={career.icon} size={24} style={{ color: career.color }} />
                        {/* Rank badge */}
                        <div
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white"
                          style={{
                            background: i === 0 ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : 'rgba(255,255,255,0.1)',
                            border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: i === 0 ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
                            color: i === 0 ? 'white' : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {i + 1}
                        </div>
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">{career.title}</h3>
                          {i === 0 && (
                            <Badge variant="warning" size="sm" dot>Best Match</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Icon name="payments" size={13} className="text-muted" />
                            <span className="text-xs text-muted">Salary</span>
                            <span className="text-xs text-white font-semibold">{career.salaryRange}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon name="trending_up" size={13} className="text-success" />
                            <span className="text-xs text-muted">Growth</span>
                            <span className="text-xs text-success font-semibold">{career.growth}</span>
                          </div>
                          <Badge
                            variant={career.growthLabel === 'Very High' ? 'success' : career.growthLabel === 'High' ? 'accent' : 'warning'}
                            size="sm"
                          >
                            {career.growthLabel}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {career.tags.map((tag: any) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-md font-medium text-secondary"
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Match Percentage Ring */}
                    <div className="flex items-center gap-4 sm:flex-col sm:gap-1.5 flex-shrink-0">
                      <div className="relative">
                        <svg className="w-16 h-16" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                          <motion.circle
                            cx="32"
                            cy="32"
                            r="26"
                            fill="none"
                            strokeWidth="5"
                            stroke={career.color}
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - career.matchPercent / 100) }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 + i * 0.1 }}
                            transform="rotate(-90 32 32)"
                            style={{ filter: `drop-shadow(0 0 4px ${career.color}50)` }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-extrabold text-white">{career.matchPercent}%</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted font-medium uppercase tracking-wider">Match</span>
                    </div>
                  </div>

                  {/* Match progress bar */}
                  <div className="mt-3 pt-3 border-t border-white/[0.03]">
                    <ProgressBar value={career.matchPercent} color={barColor} size="xs" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ──────────────── SECTION 6: Career DNA Comparison (Percentile Rankings) ──────────────── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.1)' }}>
            <Icon name="leaderboard" size={18} style={{ color: '#22D3EE' }} />
          </div>
          <h2 className="text-lg font-bold text-white">How You Compare</h2>
          <Badge variant="default" size="sm">Anonymous Percentiles</Badge>
        </div>

        <Card glass>
          <p className="text-xs text-muted mb-5">
            Your percentile ranking among 50,000+ students who have taken the LakshPath assessment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERCENTILE_RANKINGS.map((rank, i) => (
              <motion.div
                key={rank.dimension}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: `${rank.color}04`,
                  border: `1px solid ${rank.color}10`,
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                whileHover={{
                  borderColor: `${rank.color}30`,
                  background: `${rank.color}08`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${rank.color}12`,
                    border: `1px solid ${rank.color}20`,
                  }}
                >
                  <Icon name={rank.icon} size={18} style={{ color: rank.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{rank.dimension}</span>
                    <span className="text-xs font-extrabold" style={{ color: rank.color }}>
                      Top {100 - rank.percentile}%
                    </span>
                  </div>

                  {/* Percentile bar */}
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      className="absolute top-0 bottom-0 left-0 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${rank.color}40, ${rank.color})`,
                        boxShadow: `0 0 8px ${rank.color}40`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${rank.percentile}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                    />

                    {/* Position marker */}
                    <motion.div
                      className="absolute top-1/2 w-3 h-3 rounded-full -translate-y-1/2 -translate-x-1/2"
                      style={{
                        background: rank.color,
                        border: '2px solid rgba(15,23,42,0.9)',
                        boxShadow: `0 0 6px ${rank.color}60`,
                      }}
                      initial={{ left: '0%' }}
                      animate={{ left: `${rank.percentile}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary bar */}
          <div className="mt-5 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="emoji_events" size={18} style={{ color: '#F59E0B' }} />
                <span className="text-sm font-bold text-white">Overall Percentile</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold" style={{ color: '#F59E0B' }}>Top 8%</span>
                <motion.div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Icon name="trophy" size={16} style={{ color: '#F59E0B' }} />
                </motion.div>
              </div>
            </div>
            <ProgressBar value={92} color="warning" size="sm" className="mt-2" />
          </div>
        </Card>
      </motion.div>

      {/* ──────────────── Bottom CTA ──────────────── */}
      <motion.div variants={item}>
        <div
          className="rounded-2xl p-6 relative overflow-hidden text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,102,255,0.06), rgba(124,58,237,0.04), rgba(15,23,42,0.8))',
            border: '1px solid rgba(0,102,255,0.08)',
          }}
        >
          <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-[0.05] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-[1]">
            <Icon name="rocket_launch" size={32} className="text-accent mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Ready to act on your DNA?</h3>
            <p className="text-sm text-secondary mb-5 max-w-lg mx-auto">
              Your Career DNA reveals where you shine. Let AI build a personalized roadmap to get you from here to your dream career.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" size="md">
                <Icon name="conversion_path" size={18} />
                Build My Roadmap
              </Button>
              <Button variant="secondary" size="md">
                <Icon name="neurology" size={18} />
                Talk to AI Mentor
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CareerDNA;
