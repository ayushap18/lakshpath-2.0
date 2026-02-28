import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Icon from '../components/ui/Icon';

/* ───────────────────────────── animation helpers ───────────────────────────── */

const sectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};

const item3DVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: 'spring', stiffness: 80, damping: 18 },
  },
};

/* ───────────────────────────── counter hook ─────────────────────────────────── */

function useCountUp(target: number, duration = 2000, startOnView = false) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (startOnView && !inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView, startOnView]);

  return { count, ref };
}

function AnimatedStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCountUp(value, 2000, true);
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
      className="flex flex-col items-center gap-1"
    >
      <span ref={ref} className="text-[36px] font-extrabold text-[#0da2e7] text-glow-lg">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm font-medium text-[#94A3B8]">{label}</span>
    </motion.div>
  );
}

/* ───────────────────────────── 3D Feature Card ──────────────────────────────── */

function Feature3DCard({ f, index }: { f: typeof CORE_FEATURES[0]; index: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      variants={item3DVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{ transformStyle: 'preserve-3d', perspective: 900 }}
      className="glass-card border-gradient rounded-2xl p-8 flex flex-col gap-5 cursor-default transition-all duration-300 hover:shadow-[0_0_40px_rgba(13,162,231,0.12)]"
    >
      {/* Floating icon with animated gradient bg */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-xl flex items-center justify-center"
        style={{
          background: `linear-gradient(145deg, ${f.iconColor}25, ${f.iconColor}10)`,
          border: `1px solid ${f.iconColor}30`,
          transform: 'translateZ(20px)',
          boxShadow: `0 0 24px ${f.iconColor}15`,
        }}
      >
        <span style={{ color: f.iconColor }}><Icon name={f.icon} size={26} /></span>
      </motion.div>
      <h3 className="text-xl font-semibold text-white" style={{ transform: 'translateZ(12px)' }}>
        {f.title}
      </h3>
      <p className="text-[15px] text-[#94A3B8] leading-[1.6]">{f.desc}</p>

      {/* Top edge light */}
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </motion.div>
  );
}

/* ───────────────────────────── 3D Pricing Card ──────────────────────────────── */

function PricingCard3D({ p, onNavigate }: { p: typeof PRICING[0]; onNavigate: (path: string) => void }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      variants={item3DVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ transformStyle: 'preserve-3d', perspective: 900 }}
      className={`glass-card rounded-2xl p-8 flex flex-col gap-6 transition-shadow duration-300 relative overflow-hidden ${
        p.highlighted ? 'border-gradient-multi' : 'border-gradient'
      }`}
    >
      {/* Top edge light */}
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* popular badge */}
      {p.badge && (
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="self-start px-3 py-1 rounded-full bg-gradient-to-r from-[#0da2e7] to-[#22D3EE] text-white text-[11px] font-bold glow-accent-sm"
        >
          {p.badge}
        </motion.span>
      )}

      <span className={`text-sm font-semibold tracking-wider ${p.labelColor}`}>{p.label}</span>

      <div className="flex items-end gap-1">
        <span className="text-[40px] font-extrabold text-white">{p.price}</span>
        {p.period && <span className="text-[15px] text-[#64748B] mb-1">{p.period}</span>}
      </div>

      <p className="text-sm text-[#94A3B8] leading-[1.5]">{p.desc}</p>

      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      <ul className="flex flex-col gap-3">
        {p.features.map((feat) => (
          <li key={feat} className="text-sm text-[#94A3B8] flex items-center gap-2">
            <Icon name="check" size={16} className="text-[#10B981]" />
            {feat}
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.04, boxShadow: p.highlighted ? '0 0 30px rgba(13,162,231,0.3)' : undefined }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigate('/register')}
        className={`w-full py-3.5 rounded-[10px] text-[15px] font-semibold transition-all duration-300 relative overflow-hidden ${
          p.highlighted
            ? 'bg-gradient-to-r from-[#0da2e7] to-[#0b8ecc] text-white glow-accent-sm'
            : 'border border-[#64748B] text-white hover:border-white'
        }`}
      >
        {p.highlighted && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
              backgroundSize: '250% 100%',
              animation: 'shimmer 4s ease-in-out infinite',
            }}
          />
        )}
        <span className="relative z-[1]">{p.btnText}</span>
      </motion.button>
    </motion.div>
  );
}

/* ───────────────────────────── data ─────────────────────────────────────────── */

const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Testimonials'];

const CORE_FEATURES = [
  {
    icon: 'psychology',
    iconColor: '#0da2e7',
    iconBg: 'bg-[#0da2e720]',
    title: 'Tech Career Assessment',
    desc: 'AI-powered assessment that maps your coding skills, technical aptitude, and interests to recommend the best tech career paths — from Full Stack to AI/ML to DevOps.',
  },
  {
    icon: 'map',
    iconColor: '#F59E0B',
    iconBg: 'bg-[#F59E0B20]',
    title: 'DSA-to-Job Roadmap',
    desc: 'Personalized learning roadmap with curated resources from LeetCode, Coursera, and freeCodeCamp — milestones calibrated for campus placement timelines.',
  },
  {
    icon: 'mic',
    iconColor: '#8B5CF6',
    iconBg: 'bg-[#8B5CF620]',
    title: 'Placement Interview Prep',
    desc: 'Practice technical, HR, and system design interviews with AI. Get feedback on DSA solutions, STAR-method answers, and coding patterns used by FAANG.',
  },
];

const STEPS = [
  { num: '01', title: 'Take Tech Assessment', desc: 'AI evaluates your coding skills, DSA knowledge, CS fundamentals, and career interests in 10 minutes.' },
  { num: '02', title: 'Get Your Roadmap', desc: 'Receive a targeted learning plan — LeetCode problems, courses, projects — calibrated to your placement timeline.' },
  { num: '03', title: 'Practice & Build', desc: 'Mock interviews, placement prep, resume building, and portfolio analysis — everything you need to get hired.' },
  { num: '04', title: 'Crack Placements', desc: 'Company-specific prep for TCS, Infosys, Amazon, Google. Analyze your GitHub, build your resume, and apply confidently.' },
];

const SECONDARY_FEATURES = [
  { icon: 'fingerprint', color: '#0da2e7', bg: '#0da2e715', title: 'Career DNA Card', desc: 'Get your unique career identity card with AI-analyzed strengths, personality traits, and ideal career matches.' },
  { icon: 'description', color: '#8B5CF6', bg: '#8B5CF615', title: 'AI Resume Builder', desc: 'Build ATS-optimized resumes with AI suggestions, live preview, and multiple professional templates.' },
  { icon: 'psychology', color: '#F59E0B', bg: '#F59E0B15', title: 'Skill Gap Simulator', desc: 'Pick any target role and instantly see your skill gaps with a personalized learning path to get there.' },
  { icon: 'school', color: '#EF4444', bg: '#EF444415', title: 'Placement Prep Hub', desc: 'Company-specific prep packs for TCS, Infosys, Amazon & more with daily practice and mock tests.' },
  { icon: 'work_history', color: '#10B981', bg: '#10B98115', title: 'Portfolio Analysis Hub', desc: 'Analyze your GitHub, LinkedIn, Resume & Website with AI-powered insights across platforms.' },
  { icon: 'query_stats', color: '#EC4899', bg: '#EC489915', title: 'Market Intelligence', desc: 'Real-time salary data, demand trends, and job opportunities across Indian markets.' },
];

const PRICING = [
  {
    label: 'Free',
    labelColor: 'text-[#94A3B8]',
    price: '\u20B90',
    period: '/month',
    desc: 'Perfect for getting started with career exploration.',
    features: ['Basic career assessment', '3 career path suggestions', 'Limited micro-learning tasks', 'Community access'],
    btnText: 'Get Started Free',
    highlighted: false,
  },
  {
    label: 'Pro',
    labelColor: 'text-[#0da2e7]',
    price: '\u20B9499',
    period: '/month',
    desc: 'For serious learners ready to accelerate their career.',
    features: ['Advanced AI assessment', 'Career DNA Card', 'AI Resume Builder', 'Skill Gap Simulator', 'Placement prep packs', 'Multi-platform portfolio analysis'],
    btnText: 'Start Pro Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    label: 'Institution',
    labelColor: 'text-[#94A3B8]',
    price: 'Custom',
    period: '',
    desc: 'For colleges & training centers managing student cohorts.',
    features: ['Everything in Pro', 'Bulk student management', 'Institutional analytics', 'SSO & LMS integration', 'Dedicated success manager'],
    btnText: 'Contact Sales',
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote: '"The Skill Gap Simulator showed me exactly where I stood for a Full Stack role. I focused on React and System Design — and cracked my dream placement at a product company."',
    name: 'Priya Sharma',
    role: 'B.Tech CSE, IIT Delhi',
  },
  {
    stars: 5,
    quote: '"The AI interview practice nailed the exact DSA patterns Amazon asks. I solved 3/3 coding rounds in my actual interview. LakshPath was my secret weapon."',
    name: 'Rahul Verma',
    role: 'Final Year CSE, BITS Pilani',
  },
  {
    stars: 5,
    quote: '"Career DNA told me I\'m a natural DevOps engineer — something I\'d never considered. The roadmap took me from zero Docker knowledge to a Cloud role in 4 months."',
    name: 'Ananya Iyer',
    role: 'MCA, NIT Trichy',
  },
];

const TRUST_LOGOS = ['IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'DTU', 'VIT', 'IIIT Hyderabad'];

const FOOTER_COLS = [
  { heading: 'Product', links: ['Features', 'Pricing', 'Demo', 'Changelog'] },
  { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
  { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
];

/* ───────────────────────────── component ────────────────────────────────────── */

const LandingPage = () => {
  const navigate = useNavigate();
  const mockupRef = useRef<HTMLDivElement>(null);

  /* parallax for product mockup */
  const { scrollYProgress } = useScroll({
    target: mockupRef,
    offset: ['start end', 'end start'],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  /* smooth scroll to section */
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* ─── hero headline word reveal ─── */
  const headlineWords = ['Your', 'Tech', 'Career,', '\n', 'Powered', 'by', 'AI'];

  return (
    <div className="min-h-screen bg-[#0A0F1C] font-['Inter',sans-serif] overflow-x-hidden relative">

      {/* ═══════════════ NOISE OVERLAY ═══════════════ */}
      <div className="noise-overlay fixed inset-0 pointer-events-none z-[60]" />

      {/* ═══════════════ 1. HEADER ═══════════════ */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 24 }}
        className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-16 py-4 glass-heavy"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        {/* logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0da2e7] to-[#22D3EE] flex items-center justify-center glow-accent-sm">
            <Icon name="conversion_path" size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">LakshPath</span>
        </div>

        {/* nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link.toLowerCase().replace(/\s+/g, '-'))}
              className="text-[15px] font-medium text-[#94A3B8] hover:text-white transition-colors duration-200 relative group"
            >
              {link}
              <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[#0da2e7]/60 transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        {/* cta buttons */}
        <div className="flex items-center gap-3">
          {localStorage.getItem('token') ? (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(13,162,231,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#0da2e7] to-[#0b8ecc] text-white text-sm font-semibold transition-all duration-200 glow-accent-sm relative overflow-hidden"
            >
              <span className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
                backgroundSize: '250% 100%',
                animation: 'shimmer 4s ease-in-out infinite',
              }} />
              <span className="relative z-[1]">Go to Dashboard</span>
            </motion.button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-lg border border-white/10 text-white text-sm font-medium hover:border-[#94A3B8] transition-all duration-200 glass-card"
              >
                Log In
              </button>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(13,162,231,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#0da2e7] to-[#0b8ecc] text-white text-sm font-semibold transition-all duration-200 glow-accent-sm relative overflow-hidden"
              >
                <span className="absolute inset-0 pointer-events-none" style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
                  backgroundSize: '250% 100%',
                  animation: 'shimmer 4s ease-in-out infinite',
                }} />
                <span className="relative z-[1]">Get Started Free</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* ═══════════════ 2. HERO SECTION ═══════════════ */}
      <section className="flex flex-col items-center pt-14 md:pt-20 pb-10 md:pb-[60px] px-5 sm:px-10 lg:px-[120px] relative overflow-hidden" style={{ gap: 28 }}>

        {/* Aurora gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }}
          animate={{ y: [0, -25, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }}
          animate={{ y: [0, 20, 0], x: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-[350px] h-[350px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #22D3EE, transparent 70%)' }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Morphing blob */}
        <div
          className="absolute top-1/4 left-1/3 w-72 h-72 opacity-[0.06] animate-morph"
          style={{ background: 'linear-gradient(135deg, #0da2e7, #8B5CF6, #22D3EE)', filter: 'blur(50px)' }}
        />

        {/* Grid pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-hero" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-hero)" />
        </svg>

        {/* Floating 3D geometric decorations */}
        <motion.div
          className="absolute top-28 left-16 w-12 h-12 border border-[#0da2e7]/20 rounded-lg hidden md:block"
          style={{ transform: 'translateZ(30px) rotate(45deg)', transformStyle: 'preserve-3d' }}
          animate={{ y: [0, -20, 0], rotate: [45, 90, 45] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-48 right-20 w-8 h-8 rounded-full border border-[#8B5CF6]/25"
          animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 left-24 w-6 h-6 bg-[#22D3EE]/10 rounded-full"
          animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-60 right-32 w-16 h-4 border border-[#10B981]/15 rounded-full"
          animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
          className="relative z-10"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 glass-card"
            style={{ borderColor: '#0da2e740' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#0da2e7] animate-pulse" />
            <span className="text-[13px] font-medium text-[#22D3EE]">
              AI Career Intelligence for CS & Tech Students
            </span>
          </motion.div>
        </motion.div>

        {/* headline – word-by-word reveal with gradient */}
        <motion.h1
          className="text-center max-w-[900px] relative z-10"
          style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1 }}
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } }}
        >
          {headlineWords.map((word, i) =>
            word === '\n' ? (
              <br key={i} />
            ) : (
              <motion.span
                key={i}
                className={`inline-block mr-[0.3em] ${
                  word === 'AI' ? 'gradient-text-multi text-glow-lg' : 'text-white'
                }`}
                variants={{
                  hidden: { opacity: 0, y: 40, rotateX: -40 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: { type: 'spring', stiffness: 100, damping: 14 },
                  },
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {word}
              </motion.span>
            ),
          )}
        </motion.h1>

        {/* subline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 80, damping: 20 }}
          className="text-center text-[16px] md:text-[18px] text-[#94A3B8] max-w-[680px] leading-[1.6] relative z-10 px-4"
        >
          LakshPath uses AI to help CS & engineering students discover their ideal tech career, build
          targeted skill roadmaps, ace placement interviews, and land roles at top companies like Google, Amazon, and TCS.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, type: 'spring', stiffness: 80, damping: 20 }}
          className="flex items-center gap-3 sm:gap-4 relative z-10 flex-wrap justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(13,162,231,0.4), 0 0 100px rgba(13,162,231,0.15)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#0da2e7] to-[#0b8ecc] text-white text-[16px] font-semibold transition-all duration-300 glow-accent relative overflow-hidden"
          >
            <span className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
              backgroundSize: '250% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }} />
            <span className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            <span className="relative z-[1]">Start Free Assessment</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 rounded-xl glass-card text-[#94A3B8] text-[16px] font-medium hover:text-white transition-all duration-300"
          >
            <Icon name="play_arrow" size={18} className="text-[#94A3B8]" />
            Watch Demo
          </motion.button>
        </motion.div>

        {/* trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-sm text-[#64748B] relative z-10"
        >
          Trusted by 50,000+ students across India
        </motion.p>
      </section>

      {/* ═══════════════ 3. PRODUCT MOCKUP ═══════════════ */}
      <section className="px-5 md:px-10 lg:px-20 pb-4 relative z-10" ref={mockupRef}>
        <motion.div
          style={{ y: mockupY, perspective: 2000 }}
          initial={{ opacity: 0, scale: 0.92, rotateX: 5 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          className="mx-auto max-w-[1100px] relative preserve-3d"
        >
          {/* Main mockup */}
          <div
            className="h-[300px] sm:h-[420px] lg:h-[620px] rounded-2xl overflow-hidden glass-card"
            style={{
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(13,162,231,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0da2e712 80%, #0F172A 100%)',
              }}
            >
              <div className="w-full h-full relative overflow-hidden">
                <div className="absolute top-6 left-6 right-6 h-10 rounded-lg bg-[#1E293B]/60 flex items-center px-4 gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]/60" />
                  <span className="ml-4 text-xs text-[#64748B]">lakshpath.app/dashboard</span>
                </div>
                <div className="absolute top-20 left-6 w-48 bottom-6 rounded-lg bg-[#1E293B]/40" />
                <div className="absolute top-20 left-60 right-6 bottom-6 flex flex-col gap-4 p-4">
                  <div className="h-8 w-64 rounded bg-[#1E293B]/50" />
                  <div className="flex gap-4 flex-1">
                    <div className="flex-1 rounded-xl bg-[#1E293B]/30 p-4">
                      <div className="h-4 w-24 rounded bg-[#0da2e7]/20 mb-3" />
                      <div className="h-32 rounded-lg bg-gradient-to-br from-[#0da2e7]/10 to-transparent" />
                    </div>
                    <div className="flex-1 rounded-xl bg-[#1E293B]/30 p-4">
                      <div className="h-4 w-20 rounded bg-[#8B5CF6]/20 mb-3" />
                      <div className="h-32 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-transparent" />
                    </div>
                    <div className="flex-1 rounded-xl bg-[#1E293B]/30 p-4">
                      <div className="h-4 w-28 rounded bg-[#10B981]/20 mb-3" />
                      <div className="h-32 rounded-lg bg-gradient-to-br from-[#10B981]/10 to-transparent" />
                    </div>
                  </div>
                  <div className="h-40 rounded-xl bg-[#1E293B]/25" />
                </div>
              </div>
            </div>
          </div>

          {/* Glass reflection panel (floor effect) */}
          <div
            className="mx-auto max-w-[1100px] h-[120px] rounded-2xl overflow-hidden mt-1"
            style={{
              transform: 'scaleY(-1) rotateX(5deg)',
              opacity: 0.08,
              maskImage: 'linear-gradient(to top, transparent, black)',
              WebkitMaskImage: 'linear-gradient(to top, transparent, black)',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0da2e712 80%, #0F172A 100%)',
            }}
          />

          {/* Floating UI preview elements */}
          <motion.div
            animate={{ y: [0, -12, 0], x: [0, 4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-16 top-24 glass-card rounded-xl p-3 w-[140px] hidden lg:block"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
          >
            <div className="h-2 w-16 rounded bg-[#0da2e7]/30 mb-2" />
            <div className="h-2 w-12 rounded bg-[#94A3B8]/20 mb-2" />
            <div className="h-6 w-full rounded bg-[#10B981]/15" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0], x: [0, -6, 0] }}
            transition={{ duration: 6, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-12 top-40 glass-card rounded-xl p-3 w-[120px] hidden lg:block"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
          >
            <div className="h-2 w-10 rounded bg-[#8B5CF6]/30 mb-2" />
            <div className="flex gap-1">
              <div className="h-8 w-8 rounded bg-[#8B5CF6]/15" />
              <div className="h-8 w-8 rounded bg-[#0da2e7]/15" />
              <div className="h-8 w-8 rounded bg-[#F59E0B]/15" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-8 bottom-40 glass-card rounded-xl p-3 w-[130px] hidden lg:block"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
          >
            <div className="h-2 w-14 rounded bg-[#22D3EE]/30 mb-2" />
            <div className="h-12 w-full rounded bg-gradient-to-r from-[#22D3EE]/10 to-[#0da2e7]/10" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ 4. TRUST LOGOS ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariants}
        className="flex flex-col items-center gap-6 py-12 px-5 md:px-10 lg:px-[120px] relative z-10"
      >
        <motion.span
          variants={itemVariants}
          className="text-xs font-semibold text-[#64748B] tracking-[2px]"
        >
          EMPOWERING STUDENTS AT
        </motion.span>
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center flex-wrap w-full"
          style={{ gap: 'clamp(24px, 4vw, 64px)' }}
        >
          {TRUST_LOGOS.map((name) => (
            <motion.span
              key={name}
              whileHover={{ scale: 1.1, color: '#94A3B8' }}
              className="text-[18px] font-semibold text-[#475569] transition-colors cursor-default"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </motion.section>

      {/* ═══════════════ 5. FEATURES SECTION ═══════════════ */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="flex flex-col items-center gap-8 md:gap-12 px-5 py-12 md:p-20 relative z-10"
      >
        {/* head */}
        <div className="flex flex-col items-center gap-4 max-w-[700px]">
          <motion.div
            variants={itemVariants}
            className="rounded-full px-3.5 py-1.5 glass-card"
            style={{ borderColor: '#10B98140' }}
          >
            <span className="text-xs font-semibold text-[#10B981]">Core Features</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-center text-white text-[28px] md:text-[42px] font-bold leading-[1.15]"
          >
            Everything You Need to{'\n'}Launch Your Career
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-center text-[17px] text-[#94A3B8] leading-[1.6] max-w-[620px]"
          >
            From AI-powered assessments to real-time job market intelligence, LakshPath gives you
            the tools to make confident career decisions.
          </motion.p>
        </div>

        {/* cards with SVG connecting lines */}
        <div className="relative w-full">
          {/* SVG connecting lines between cards */}
          <svg
            className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 pointer-events-none hidden md:block"
            style={{ zIndex: 0 }}
          >
            <defs>
              <linearGradient id="featureLineGrad">
                <stop offset="0%" stopColor="#0da2e740" />
                <stop offset="50%" stopColor="#8B5CF640" />
                <stop offset="100%" stopColor="#22D3EE40" />
              </linearGradient>
            </defs>
            <line
              x1="33%"
              y1="1"
              x2="66%"
              y2="1"
              stroke="url(#featureLineGrad)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-20"
                dur="2s"
                repeatCount="indefinite"
              />
            </line>
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full relative z-10">
            {CORE_FEATURES.map((f, i) => (
              <Feature3DCard key={f.title} f={f} index={i} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════ 6. HOW IT WORKS ═══════════════ */}
      <motion.section
        id="how-it-works"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="flex flex-col items-center gap-8 md:gap-12 px-5 py-12 md:p-20 bg-[#0F172A] relative z-10"
      >
        <div className="flex flex-col items-center gap-4 max-w-[600px]">
          <motion.div
            variants={itemVariants}
            className="rounded-full px-3.5 py-1.5 glass-card"
            style={{ borderColor: '#8B5CF640' }}
          >
            <span className="text-xs font-semibold text-[#8B5CF6]">How It Works</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-center text-white text-[28px] md:text-[42px] font-bold leading-[1.15]"
          >
            From Assessment to Employment{'\n'}in 4 Simple Steps
          </motion.h2>
        </div>

        {/* Steps with animated SVG connecting path */}
        <div className="relative w-full">
          {/* Animated connecting SVG path with gradient stroke + particles */}
          <svg
            className="absolute top-[52px] left-0 w-full h-[8px] pointer-events-none hidden md:block"
            style={{ zIndex: 0 }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="stepPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0da2e7" />
                <stop offset="33%" stopColor="#8B5CF6" />
                <stop offset="66%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#0da2e7" />
              </linearGradient>
            </defs>
            <line
              x1="12%"
              y1="4"
              x2="88%"
              y2="4"
              stroke="url(#stepPathGrad)"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-28"
                dur="3s"
                repeatCount="indefinite"
              />
            </line>
            {/* Particle dots traveling along the path */}
            <circle r="3" fill="#0da2e7" opacity="0.6">
              <animateMotion dur="4s" repeatCount="indefinite" path="M80,4 L580,4" />
            </circle>
            <circle r="2" fill="#8B5CF6" opacity="0.5">
              <animateMotion dur="4s" repeatCount="indefinite" path="M80,4 L580,4" begin="1.3s" />
            </circle>
            <circle r="2.5" fill="#22D3EE" opacity="0.5">
              <animateMotion dur="4s" repeatCount="indefinite" path="M80,4 L580,4" begin="2.6s" />
            </circle>
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full relative z-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                variants={item3DVariants}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                className="glass-card border-gradient rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* 3D step number badge with glow ring on first */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    i === 0 ? 'animate-glow-ring' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #0da2e730, #8B5CF620)',
                    transform: 'translateZ(16px)',
                    boxShadow: '0 0 20px rgba(13,162,231,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-[18px] font-extrabold text-[#0da2e7]">{s.num}</span>
                </div>
                <h3
                  className="text-[17px] font-semibold text-white"
                  style={{ transform: 'translateZ(8px)' }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-[1.6]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════ 7. SECONDARY FEATURES ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="flex flex-col items-center gap-8 md:gap-12 px-5 py-12 md:p-20 relative z-10"
      >
        <motion.h2
          variants={itemVariants}
          className="text-center text-white text-[28px] md:text-[36px] font-bold leading-[1.2] max-w-[600px]"
        >
          Built for Every Step of Your Journey
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {SECONDARY_FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={item3DVariants}
              whileHover={{
                y: -6,
                rotateX: -2,
                rotateY: 3,
                transition: { type: 'spring', stiffness: 260, damping: 20 },
              }}
              style={{ transformStyle: 'preserve-3d', perspective: 800 }}
              className="glass-card border-gradient rounded-xl p-6 flex items-start gap-4 transition-all duration-300 cursor-default hover:shadow-[0_0_30px_rgba(13,162,231,0.1)]"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: f.bg,
                  transform: 'translateZ(12px)',
                  boxShadow: `0 0 20px ${f.color}15`,
                }}
              >
                <span style={{ color: f.color }}><Icon name={f.icon} size={20} /></span>
              </motion.div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[16px] font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-[1.5]">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ 8. STATS BAR ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariants}
        className="flex items-center justify-around py-10 md:py-14 px-5 md:px-20 glass-ultra aurora-bg relative z-10 flex-wrap gap-8"
        style={{
          borderTop: '1px solid rgba(13,162,231,0.15)',
          borderBottom: '1px solid rgba(13,162,231,0.15)',
        }}
      >
        <AnimatedStat value={50000} suffix="+" label="Active Students" />
        <AnimatedStat value={94} suffix="%" label="Career Match Rate" />
        <AnimatedStat value={500} suffix="+" label="Career Pathways" />
        <AnimatedStat value={12000} suffix="+" label="Placements Assisted" />
      </motion.section>

      {/* ═══════════════ 9. PRICING ═══════════════ */}
      <motion.section
        id="pricing"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="flex flex-col items-center gap-8 md:gap-12 px-5 py-12 md:p-20 relative z-10"
      >
        {/* head */}
        <div className="flex flex-col items-center gap-4 max-w-[600px]">
          <motion.div
            variants={itemVariants}
            className="rounded-full px-3.5 py-1.5 glass-card"
            style={{ borderColor: '#F59E0B40' }}
          >
            <span className="text-xs font-semibold text-[#F59E0B]">Pricing</span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-center text-white text-[28px] md:text-[42px] font-bold leading-[1.15]"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-center text-[17px] text-[#94A3B8]"
          >
            Start free. Upgrade when you are ready to accelerate.
          </motion.p>
        </div>

        {/* pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {PRICING.map((p) => (
            <PricingCard3D key={p.label} p={p} onNavigate={navigate} />
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ 10. TESTIMONIALS ═══════════════ */}
      <motion.section
        id="testimonials"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="flex flex-col items-center gap-8 md:gap-12 px-5 py-12 md:p-20 bg-[#0F172A] relative z-10"
      >
        <motion.h2
          variants={itemVariants}
          className="text-center text-white text-[28px] md:text-[36px] font-bold leading-[1.2] max-w-[500px]"
        >
          Loved by Students Across India
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              variants={{
                hidden: { opacity: 0, y: 40 + i * 15, rotateX: -8 },
                visible: {
                  opacity: 1,
                  y: i === 1 ? -8 : 0,
                  rotateX: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 80,
                    damping: 18,
                    delay: i * 0.1,
                  },
                },
              }}
              whileHover={{ y: i === 1 ? -16 : -8, transition: { type: 'spring', stiffness: 300 } }}
              style={{ transformStyle: 'preserve-3d' }}
              className="glass-card border-gradient rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300"
            >
              {/* Stars + glowing quote icon */}
              <div className="flex items-center justify-between">
                <span className="text-[16px] text-[#F59E0B]">
                  {'★'.repeat(t.stars)}
                </span>
                <span
                  className="text-[32px] leading-none text-[#0da2e7] opacity-30"
                  style={{ textShadow: '0 0 20px rgba(13,162,231,0.4)' }}
                >
                  &ldquo;
                </span>
              </div>
              <p className="text-[15px] text-[#94A3B8] leading-[1.6]">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #0da2e7, #8B5CF6)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                >
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-[13px] text-[#64748B]">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ 11. FINAL CTA ═══════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={sectionVariants}
        className="flex flex-col items-center gap-6 md:gap-7 py-16 md:py-20 px-5 md:px-16 lg:px-[120px] relative z-10 aurora-bg"
        style={{
          background: 'linear-gradient(180deg, #0da2e718 0%, #0A0F1C 100%)',
        }}
      >
        <motion.h2
          variants={itemVariants}
          className="text-center text-white text-[28px] md:text-[42px] font-bold leading-[1.2] max-w-[600px]"
        >
          Ready to Discover Your Path?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-center text-[17px] text-[#94A3B8] leading-[1.6] max-w-[560px]"
        >
          Join 50,000+ students who are building their future with AI-powered career guidance. Start
          your free assessment today.
        </motion.p>
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(13,162,231,0.4), 0 0 100px rgba(13,162,231,0.15)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/register')}
            className="px-9 py-4 rounded-xl bg-gradient-to-r from-[#0da2e7] to-[#0b8ecc] text-white text-[16px] font-semibold transition-all duration-300 glow-accent relative overflow-hidden"
          >
            <span className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
              backgroundSize: '250% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }} />
            <span className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            <span className="relative z-[1]">Get Started Free</span>
          </motion.button>
        </motion.div>
        <motion.p variants={itemVariants} className="text-[13px] text-[#64748B]">
          No credit card required &nbsp;&bull;&nbsp; Free forever basic plan
        </motion.p>
      </motion.section>

      {/* ═══════════════ 12. FOOTER ═══════════════ */}
      <footer className="flex flex-col gap-8 md:gap-12 pt-12 md:pt-16 pb-8 px-5 md:px-10 lg:px-20 mesh-gradient-bg relative z-10">
        {/* top */}
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* brand */}
          <div className="flex flex-col gap-3 max-w-[300px]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#0da2e7] to-[#22D3EE] glow-accent-sm" />
              <span className="text-[18px] font-bold text-white">LakshPath</span>
            </div>
            <p className="text-sm text-[#64748B] leading-[1.5]">
              AI-powered career guidance for the next generation of India's workforce.
            </p>
          </div>

          {/* column links */}
          <div className="flex gap-8 md:gap-16 flex-wrap">
            {FOOTER_COLS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-4">
                <span className="text-[13px] font-semibold text-white tracking-wider">{col.heading}</span>
                {col.links.map((link) => (
                  <span
                    key={link}
                    className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-pointer relative group"
                  >
                    {link}
                    <span className="absolute bottom-[-2px] left-0 w-0 h-[1px] bg-[#0da2e7]/50 transition-all duration-300 group-hover:w-full" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* glow divider */}
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(13,162,231,0.25), rgba(139,92,246,0.15), transparent)',
          }}
        />

        {/* bottom */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-[13px] text-[#64748B]">
            &copy; {new Date().getFullYear()} LakshPath. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            {['X', 'in', 'ig', 'yt'].map((s) => (
              <span
                key={s}
                className="text-[13px] text-[#64748B] hover:text-white transition-colors cursor-pointer font-medium"
              >
                {s === 'X' ? '\ud835\udd4f' : s === 'in' ? 'LinkedIn' : s === 'ig' ? 'Instagram' : 'YouTube'}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
