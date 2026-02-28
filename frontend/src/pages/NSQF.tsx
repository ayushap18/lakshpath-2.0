import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { nsqfAPI } from '../services/api';

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const EDUCATION_LEVELS = ['Class 8', 'Class 10', 'Class 12', 'ITI', 'Diploma', 'Graduate'];
const LEARNING_MODES = [
  { value: 'online' as const, label: 'Online', icon: 'laptop' },
  { value: 'offline' as const, label: 'Offline', icon: 'location_on' },
  { value: 'hybrid' as const, label: 'Hybrid', icon: 'sync_alt' },
];
const INTEREST_OPTIONS = ['IT & Software', 'Healthcare', 'Manufacturing', 'Construction', 'Agriculture', 'Tourism', 'Retail', 'Beauty & Wellness', 'Automotive', 'Electronics'];

/* ------------------------------------------------------------------ */
/*  NSQF Level Guide Data                                              */
/* ------------------------------------------------------------------ */

const NSQF_LEVELS = [
  {
    level: 1,
    education: 'Class 5',
    descriptor: 'Basic Skills (Preparatory)',
    description: 'Preparatory level with basic literacy and numeracy. Foundational understanding of simple tasks under direct supervision.',
    roles: ['Helper', 'Attendant', 'Peon', 'House Keeping Staff'],
    salaryRange: '0.8 - 1.5 LPA',
    color: '#64748B',
  },
  {
    level: 2,
    education: 'Class 8',
    descriptor: 'Foundation Skills',
    description: 'Foundation skills involving routine and predictable tasks. Can follow instructions and perform basic operations.',
    roles: ['Office Boy', 'Data Entry Operator', 'Craft Worker', 'Assembly Helper'],
    salaryRange: '1.0 - 2.0 LPA',
    color: '#64748B',
  },
  {
    level: 3,
    education: 'Class 10',
    descriptor: 'Intermediate Skills (ITI Certificate)',
    description: 'Intermediate competence covering a range of activities. Works with limited autonomy and carries out well-defined tasks.',
    roles: ['Electrician', 'Plumber', 'Welder', 'Medical Assistant', 'Mechanic'],
    salaryRange: '1.5 - 3.0 LPA',
    color: '#0da2e7',
  },
  {
    level: 4,
    education: 'Class 12',
    descriptor: 'Advanced Skills (Vocational Certificate)',
    description: 'Factual and procedural knowledge in broad contexts. Can work independently on non-routine tasks and supervise others.',
    roles: ['Lab Technician', 'IT Support', 'Nursing Aide', 'Accounts Assistant'],
    salaryRange: '2.0 - 4.0 LPA',
    color: '#0da2e7',
  },
  {
    level: 5,
    education: 'Diploma (1yr after 12th)',
    descriptor: 'Skilled Worker',
    description: 'Comprehensive factual and theoretical knowledge. Applied competence with significant autonomy and responsibility.',
    roles: ['Junior Developer', 'Pharmacy Technician', 'Surveyor', 'Dental Hygienist'],
    salaryRange: '2.5 - 5.0 LPA',
    color: '#22D3EE',
  },
  {
    level: 6,
    education: 'Advanced Diploma (2yr)',
    descriptor: 'Supervisor Level',
    description: 'Advanced knowledge and analytical skills. Can manage teams, plan activities, and solve complex problems in a field.',
    roles: ['Site Supervisor', 'Senior Technician', 'Shift Manager', 'Network Admin'],
    salaryRange: '3.5 - 7.0 LPA',
    color: '#22D3EE',
  },
  {
    level: 7,
    education: "Bachelor's Degree",
    descriptor: 'Professional Level',
    description: 'Specialized knowledge with strong analytical and decision-making abilities. Independently manages processes and projects.',
    roles: ['Software Engineer', 'Nurse', 'Accountant', 'Civil Engineer', 'Teacher'],
    salaryRange: '4.0 - 12.0 LPA',
    color: '#8B5CF6',
  },
  {
    level: 8,
    education: 'PG Diploma',
    descriptor: 'Specialist Level',
    description: 'Critical understanding of advanced theories and practices. Expert in a specific professional domain with leadership skills.',
    roles: ['Project Manager', 'Clinical Specialist', 'Data Analyst', 'Design Lead'],
    salaryRange: '6.0 - 18.0 LPA',
    color: '#8B5CF6',
  },
  {
    level: 9,
    education: "Master's Degree",
    descriptor: 'Expert Level',
    description: 'Highly specialized knowledge at the frontier of a field. Can lead innovation, research, and strategic initiatives.',
    roles: ['Senior Architect', 'Research Scientist', 'Management Consultant', 'Surgeon'],
    salaryRange: '10.0 - 30.0 LPA',
    color: '#F59E0B',
  },
  {
    level: 10,
    education: 'PhD',
    descriptor: 'Research & Innovation',
    description: 'Mastery of a complex body of knowledge. Contributes original research, develops new frameworks, and leads institutions.',
    roles: ['Professor', 'Chief Scientist', 'R&D Director', 'Policy Architect'],
    salaryRange: '15.0 - 50.0+ LPA',
    color: '#F59E0B',
  },
];

/* ------------------------------------------------------------------ */
/*  Top Vocational Sectors Data                                        */
/* ------------------------------------------------------------------ */

const VOCATIONAL_SECTORS = [
  {
    name: 'IT / ITeS',
    icon: 'computer',
    growth: 45,
    jobs: '2.5L+',
    salary: '4 - 25 LPA',
    color: '#0da2e7',
    topRoles: ['Full Stack Developer', 'Cloud Engineer', 'Cybersecurity Analyst', 'Data Scientist', 'DevOps Engineer'],
  },
  {
    name: 'Healthcare',
    icon: 'health_and_safety',
    growth: 32,
    jobs: '1.8L+',
    salary: '3 - 18 LPA',
    color: '#10B981',
    topRoles: ['General Duty Assistant', 'Phlebotomist', 'Medical Lab Technician', 'Radiology Technician', 'Nursing Assistant'],
  },
  {
    name: 'Banking & Finance',
    icon: 'account_balance',
    growth: 28,
    jobs: '1.2L+',
    salary: '3.5 - 20 LPA',
    color: '#8B5CF6',
    topRoles: ['Financial Analyst', 'Insurance Agent', 'Loan Officer', 'Investment Advisor', 'GST Practitioner'],
  },
  {
    name: 'Electronics & Hardware',
    icon: 'memory',
    growth: 25,
    jobs: '800K+',
    salary: '3 - 15 LPA',
    color: '#22D3EE',
    topRoles: ['PCB Designer', 'Embedded Systems Dev', 'IoT Technician', 'VLSI Engineer', 'Repair Technician'],
  },
  {
    name: 'Automotive',
    icon: 'directions_car',
    growth: 22,
    jobs: '600K+',
    salary: '2.5 - 12 LPA',
    color: '#F59E0B',
    topRoles: ['Auto Mechanic', 'EV Technician', 'Quality Inspector', 'CNC Operator', 'Automotive Designer'],
  },
  {
    name: 'Tourism & Hospitality',
    icon: 'hotel',
    growth: 20,
    jobs: '500K+',
    salary: '2 - 10 LPA',
    color: '#EC4899',
    topRoles: ['Travel Consultant', 'Hotel Manager', 'Chef', 'Event Planner', 'Tour Guide'],
  },
  {
    name: 'Retail',
    icon: 'storefront',
    growth: 18,
    jobs: '900K+',
    salary: '2 - 8 LPA',
    color: '#F97316',
    topRoles: ['Store Manager', 'Visual Merchandiser', 'Supply Chain Exec', 'E-Commerce Specialist', 'CRM Analyst'],
  },
  {
    name: 'Construction',
    icon: 'construction',
    growth: 15,
    jobs: '700K+',
    salary: '2.5 - 10 LPA',
    color: '#A78BFA',
    topRoles: ['Mason', 'Site Supervisor', 'Quantity Surveyor', 'Safety Officer', 'Interior Designer'],
  },
];

/* ------------------------------------------------------------------ */
/*  Government Schemes Data                                            */
/* ------------------------------------------------------------------ */

const GOVT_SCHEMES = [
  {
    name: 'PMKVY',
    fullName: 'Pradhan Mantri Kaushal Vikas Yojana',
    description: 'India\'s flagship skill training scheme providing free short-term training and certification with placement support across 300+ job roles.',
    eligibility: 'Indian citizens aged 15-45, Class 10 pass (varies by course)',
    benefits: ['Free training & certification', 'Placement assistance', 'Recognition of Prior Learning', 'Special Projects for vulnerable groups'],
    icon: 'workspace_premium',
    color: '#0da2e7',
    link: 'pmkvyofficial.org',
  },
  {
    name: 'NSDC',
    fullName: 'National Skill Development Corporation',
    description: 'Public-private partnership catalyzing quality vocational training through industry-aligned programs and funding to training providers.',
    eligibility: 'Open to all citizens and training organizations',
    benefits: ['Industry partnerships', 'Quality skill training', 'Entrepreneurship support', 'International placements'],
    icon: 'handshake',
    color: '#8B5CF6',
    link: 'nsdcindia.org',
  },
  {
    name: 'DDU-GKY',
    fullName: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
    description: 'Skill training program exclusively for rural poor youth between 15-35 years, funded by the Ministry of Rural Development.',
    eligibility: 'Rural youth aged 15-35 from poor families (BPL/MGNREGA/RSBY)',
    benefits: ['Free residential training', 'Post-placement tracking for 12 months', 'Overseas placement opportunities', 'Focus on inclusive growth'],
    icon: 'agriculture',
    color: '#10B981',
    link: 'ddugky.gov.in',
  },
  {
    name: 'SANKALP',
    fullName: 'Skills Acquisition and Knowledge Awareness for Livelihood Promotion',
    description: 'World Bank-assisted program strengthening institutional mechanisms for skill development at national, state, and district levels.',
    eligibility: 'State skill development missions and training institutions',
    benefits: ['Institutional strengthening', 'Quality assurance framework', 'Inclusion of marginalized groups', 'District-level skill planning'],
    icon: 'public',
    color: '#22D3EE',
    link: 'msde.gov.in',
  },
  {
    name: 'Skill India Mission',
    fullName: 'Skill India Digital & Future Skills',
    description: 'Comprehensive mission aimed at creating a digitally skilled workforce equipped for Industry 4.0 with AI, IoT, and blockchain capabilities.',
    eligibility: 'All Indian citizens, special focus on youth and women',
    benefits: ['Digital skills training', 'Future-ready workforce programs', 'Skill India Digital portal access', 'Industry 4.0 readiness'],
    icon: 'rocket_launch',
    color: '#F59E0B',
    link: 'skillindia.gov.in',
  },
  {
    name: 'NAPS',
    fullName: 'National Apprenticeship Promotion Scheme',
    description: 'Government scheme promoting apprenticeship training in establishments by sharing costs with employers and providing stipends to apprentices.',
    eligibility: 'Youth aged 14+ with minimum Class 5 (varies by trade)',
    benefits: ['On-the-job training', 'Monthly stipend (up to Rs 9,000)', 'Industry experience', 'National certification after completion'],
    icon: 'engineering',
    color: '#EC4899',
    link: 'apprenticeshipindia.gov.in',
  },
];

/* ------------------------------------------------------------------ */
/*  Popular Certifications Data                                        */
/* ------------------------------------------------------------------ */

const CERTIFICATIONS = [
  {
    sector: 'IT & Software',
    icon: 'code',
    color: '#0da2e7',
    certs: [
      { name: 'AWS Cloud Practitioner', provider: 'Amazon Web Services', duration: '2-3 months', cost: 'Paid (Rs 8,500)', nsqfLevel: 5 },
      { name: 'Google Cloud Associate', provider: 'Google Cloud', duration: '3-4 months', cost: 'Paid (Rs 10,000)', nsqfLevel: 6 },
      { name: 'CompTIA A+', provider: 'CompTIA', duration: '2-3 months', cost: 'Paid (Rs 20,000)', nsqfLevel: 4 },
      { name: 'CCNA (Cisco Certified)', provider: 'Cisco', duration: '3-6 months', cost: 'Paid (Rs 25,000)', nsqfLevel: 5 },
    ],
  },
  {
    sector: 'Healthcare',
    icon: 'medical_services',
    color: '#10B981',
    certs: [
      { name: 'FSSAI Food Safety Supervisor', provider: 'FSSAI', duration: '1-2 months', cost: 'Free under PMKVY', nsqfLevel: 4 },
      { name: 'Nursing Assistant (CNA)', provider: 'Healthcare SSC', duration: '6 months', cost: 'Free under Govt Schemes', nsqfLevel: 4 },
      { name: 'Phlebotomy Technician', provider: 'Healthcare SSC', duration: '3-4 months', cost: 'Paid (Rs 15,000)', nsqfLevel: 4 },
      { name: 'Medical Lab Technician', provider: 'NSDC Partners', duration: '1-2 years', cost: 'Subsidized (Rs 25,000)', nsqfLevel: 5 },
    ],
  },
  {
    sector: 'Finance & Banking',
    icon: 'payments',
    color: '#8B5CF6',
    certs: [
      { name: 'NISM Series Certifications', provider: 'NISM (SEBI)', duration: '1-2 months', cost: 'Paid (Rs 1,500)', nsqfLevel: 5 },
      { name: 'CFA Foundation Level', provider: 'CFA Institute', duration: '6-12 months', cost: 'Paid (Rs 65,000)', nsqfLevel: 7 },
      { name: 'Tally Prime Certification', provider: 'Tally Solutions', duration: '1-2 months', cost: 'Paid (Rs 5,000)', nsqfLevel: 4 },
      { name: 'GST Practitioner', provider: 'GSTN / NACIN', duration: '1-3 months', cost: 'Free / Rs 2,000', nsqfLevel: 5 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Success Statistics Data                                            */
/* ------------------------------------------------------------------ */

const SUCCESS_STATS = [
  { label: 'Trained under PMKVY', value: '1 Crore+', numericValue: 10000000, icon: 'groups', color: '#0da2e7' },
  { label: 'Sector Skill Councils', value: '37', numericValue: 37, icon: 'domain', color: '#8B5CF6' },
  { label: 'Training Centers', value: '10,000+', numericValue: 10000, icon: 'school', color: '#10B981' },
  { label: 'Qualifications Available', value: '600+', numericValue: 600, icon: 'verified', color: '#F59E0B' },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const chipSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

const stepStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const stepItem = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
};

const cardStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

/* ------------------------------------------------------------------ */
/*  Animated count-up hook                                             */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const NSQF = () => {
  /* ----- state (unchanged) ----- */
  const [education, setEducation] = useState('Class 12');
  const [currentLevel, setCurrentLevel] = useState(4);
  const [targetLevel, setTargetLevel] = useState(7);
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [learningMode, setLearningMode] = useState<'online' | 'offline' | 'hybrid'>('hybrid');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  /* ----- pre-loaded sections state ----- */
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [expandedSector, setExpandedSector] = useState<number | null>(null);
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);
  const [activeCertSector, setActiveCertSector] = useState(0);

  /* ----- handlers (unchanged) ----- */
  const toggleInterest = (i: string) => {
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await nsqfAPI.generatePathway({
        currentEducationLevel: education,
        currentNSQFLevel: currentLevel,
        targetNSQFLevel: targetLevel,
        interests,
        skills: [],
        location: location || 'India',
        preferredLanguage: 'English',
        experienceYears: 0,
        learningMode,
        budget: 'low',
      });
      setResults(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate pathway');
    }
    setLoading(false);
  };

  /* ----- derived helpers ----- */
  const employabilityScore: number =
    results?.employability?.score ?? (typeof results?.employability === 'number' ? results.employability : 0);
  const animatedScore = useCountUp(results ? employabilityScore : 0, 1400);

  const pathwaySteps: any[] = results?.pathway
    ? Array.isArray(results.pathway)
      ? results.pathway
      : results.pathway.steps || []
    : [];

  const coursesList: any[] = results?.courses
    ? Array.isArray(results.courses)
      ? results.courses
      : []
    : [];

  const schemesList: any[] = results?.schemes
    ? Array.isArray(results.schemes)
      ? results.schemes
      : []
    : [];

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ---------------------------------------------------------- */}
      {/*  Title section with gradient text                           */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-[#0da2e7] via-[#22D3EE] to-[#0da2e7] bg-clip-text text-transparent">
            NSQF Vocational Pathways
          </span>
        </h1>
        <p className="text-[#94A3B8] mt-2 text-base max-w-2xl">
          Explore National Skills Qualification Framework pathways aligned to your goals.
        </p>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/*  Success Statistics - Top Cards                             */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUCCESS_STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={cardItem}
              initial="hidden"
              animate="visible"
              transition={{ delay: idx * 0.1 }}
            >
              <Card hover>
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon name={stat.icon} size={24} style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-xs text-[#94A3B8] font-medium leading-tight">{stat.label}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/*  Config Card                                                */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Education Level */}
            <div>
              <label className="text-sm text-[#94A3B8] mb-2 block font-medium">Education Level</label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map((l) => (
                  <motion.button
                    key={l}
                    onClick={() => setEducation(l)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      education === l
                        ? 'bg-[#0da2e7] text-white shadow-[0_2px_12px_rgba(13,162,231,0.35)]'
                        : 'bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] hover:border-[#0da2e7]/30'
                    }`}
                  >
                    {l}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* NSQF Range Sliders */}
            <div>
              <label className="text-sm text-[#94A3B8] mb-2 block font-medium">
                NSQF Level:{' '}
                <motion.span
                  key={`cur-${currentLevel}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#0da2e7] font-bold"
                >
                  {currentLevel}
                </motion.span>
                {' '}&rarr;{' '}
                <motion.span
                  key={`tgt-${targetLevel}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#22D3EE] font-bold"
                >
                  {targetLevel}
                </motion.span>
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B]">Current</span>
                    <motion.span
                      key={`cur-badge-${currentLevel}`}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="text-xs font-bold text-[#0da2e7] bg-[#0da2e7]/10 px-2 py-0.5 rounded-full"
                    >
                      Lvl {currentLevel}
                    </motion.span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(Number(e.target.value))}
                    className="w-full accent-[#0da2e7] cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#64748B]">Target</span>
                    <motion.span
                      key={`tgt-badge-${targetLevel}`}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="text-xs font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded-full"
                    >
                      Lvl {targetLevel}
                    </motion.span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                    className="w-full accent-[#22D3EE] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Interest Chips */}
            <div>
              <label className="text-sm text-[#94A3B8] mb-2 block font-medium">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => {
                  const selected = interests.includes(i);
                  return (
                    <motion.button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      animate={{
                        scale: selected ? 1.05 : 1,
                        backgroundColor: selected ? 'rgba(13,162,231,0.12)' : 'rgba(30,41,59,1)',
                        borderColor: selected ? 'rgba(13,162,231,0.4)' : 'rgba(30,41,59,1)',
                      }}
                      whileHover={{ scale: selected ? 1.08 : 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      transition={chipSpring}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        selected ? 'text-[#0da2e7]' : 'text-[#64748B]'
                      }`}
                    >
                      {selected && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="inline-block overflow-hidden mr-1"
                        >
                          <Icon name="check" size={12} className="align-middle" />
                        </motion.span>
                      )}
                      {i}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Location + Learning Mode */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#94A3B8] mb-2 block font-medium">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Delhi, Mumbai"
                  className="w-full bg-[#1E293B] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white placeholder-[#64748B] outline-none text-sm focus:border-[#0da2e7]/50 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="text-sm text-[#94A3B8] mb-2 block font-medium">Learning Mode</label>
                <div className="flex gap-2">
                  {LEARNING_MODES.map((m) => {
                    const active = learningMode === m.value;
                    return (
                      <motion.button
                        key={m.value}
                        onClick={() => setLearningMode(m.value)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                          active
                            ? 'bg-[#0da2e7] text-white shadow-[0_2px_12px_rgba(13,162,231,0.35)]'
                            : 'bg-[#1E293B] text-[#94A3B8] border border-[#1E293B] hover:border-[#0da2e7]/30'
                        }`}
                      >
                        <motion.span
                          animate={{ rotate: active ? 360 : 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="inline-flex"
                        >
                          <Icon name={m.icon} size={16} />
                        </motion.span>
                        {m.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Pathway Button */}
          <motion.div
            className="mt-6"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Button
              variant="primary"
              className={`relative overflow-hidden ${
                interests.length > 0 && !loading
                  ? 'shadow-[0_0_25px_rgba(13,162,231,0.4),0_0_60px_rgba(13,162,231,0.15)]'
                  : ''
              }`}
              onClick={handleGenerate}
              loading={loading}
              disabled={interests.length === 0}
            >
              {!loading && <Icon name="auto_awesome" size={18} />}
              {loading ? 'Generating...' : 'Generate Pathway'}
            </Button>
          </motion.div>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/*  Error message                                              */}
      {/* ---------------------------------------------------------- */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3"
          >
            <Icon name="error" size={16} className="align-middle mr-1" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------- */}
      {/*  Results Section with AnimatePresence                       */}
      {/* ---------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="space-y-6"
          >

            {/* ====================================================== */}
            {/*  Pathway Steps with staggered slide-in + connecting line */}
            {/* ====================================================== */}
            {results.pathway && pathwaySteps.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <Icon name="route" size={20} className="text-[#0da2e7]" />
                    Your NSQF Pathway
                  </h2>
                  <motion.div
                    className="relative space-y-4"
                    variants={stepStagger}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Animated connecting line */}
                    {pathwaySteps.length > 1 && (
                      <motion.div
                        className="absolute left-4 top-4 w-0.5 bg-gradient-to-b from-[#0da2e7] to-[#22D3EE]/30"
                        initial={{ height: 0 }}
                        animate={{ height: 'calc(100% - 2rem)' }}
                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        style={{ zIndex: 0 }}
                      />
                    )}

                    {pathwaySteps.map((step: any, i: number) => {
                      const isLast = i === pathwaySteps.length - 1;
                      const isCurrent = i === 0;
                      return (
                        <motion.div
                          key={i}
                          variants={stepItem}
                          className="flex gap-4 relative z-10"
                        >
                          {/* Step circle */}
                          <div className="flex flex-col items-center">
                            <motion.div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                                isCurrent
                                  ? 'bg-[#0da2e7] shadow-[0_0_12px_rgba(13,162,231,0.5)]'
                                  : 'bg-[#0da2e7]/80'
                              }`}
                              animate={
                                isCurrent
                                  ? {
                                      boxShadow: [
                                        '0 0 0px rgba(13,162,231,0.4)',
                                        '0 0 18px rgba(13,162,231,0.6)',
                                        '0 0 0px rgba(13,162,231,0.4)',
                                      ],
                                    }
                                  : {}
                              }
                              transition={
                                isCurrent
                                  ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                                  : {}
                              }
                            >
                              {step.level || i + currentLevel}
                            </motion.div>
                            {!isLast && (
                              <div className="w-0.5 flex-1 min-h-[8px] bg-transparent" />
                            )}
                          </div>

                          {/* Step content card */}
                          <Card padding="p-4" className="flex-1 mb-0">
                            <h4 className="font-medium text-white">
                              {step.title || step.certification || `Level ${step.level}`}
                            </h4>
                            <p className="text-sm text-[#94A3B8] mt-1">
                              {step.description || step.details}
                            </p>
                            {step.duration && (
                              <Badge size="sm" variant="accent" className="mt-2">
                                <Icon name="schedule" size={12} className="mr-1" />
                                {step.duration}
                              </Badge>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </Card>
              </motion.div>
            )}

            {/* ====================================================== */}
            {/*  Courses with hover lift                                */}
            {/* ====================================================== */}
            {results.courses && coursesList.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Icon name="school" size={20} className="text-[#22D3EE]" />
                    Recommended Courses
                  </h2>
                  <div className="space-y-1">
                    {coursesList.slice(0, 5).map((c: any, i: number) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -2, backgroundColor: 'rgba(13,162,231,0.04)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="flex items-center justify-between py-3 px-3 rounded-xl border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0da2e7]/10 flex items-center justify-center shrink-0">
                            <Icon name="play_lesson" size={16} className="text-[#0da2e7]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{c.title || c.name}</p>
                            <p className="text-xs text-[#64748B]">
                              {c.platform} &middot; {c.duration}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={c.cost === 'free' || c.cost === 0 ? 'success' : 'warning'}
                          size="sm"
                        >
                          {c.cost === 'free' || c.cost === 0 ? 'Free' : 'Paid'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ====================================================== */}
            {/*  API Government Schemes with 3D tilt effect             */}
            {/* ====================================================== */}
            {results.schemes && schemesList.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Icon name="account_balance" size={20} className="text-[#0da2e7]" />
                    Recommended Schemes for You
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {schemesList.map((s: any, i: number) => (
                      <SchemeCard key={i} scheme={s} />
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ====================================================== */}
            {/*  Employability with animated bar + count-up             */}
            {/* ====================================================== */}
            {results.employability && (
              <motion.div variants={itemVariants}>
                <Card>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Icon name="trending_up" size={20} className="text-[#22D3EE]" />
                    Employability Prediction
                  </h2>
                  <div className="flex items-center gap-6">
                    <motion.div
                      className="text-4xl font-extrabold bg-gradient-to-r from-[#0da2e7] to-[#22D3EE] bg-clip-text text-transparent tabular-nums"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
                    >
                      {animatedScore}%
                    </motion.div>
                    <div className="flex-1">
                      <div className="w-full bg-white/5 rounded-full overflow-hidden h-4">
                        <motion.div
                          className="h-4 rounded-full bg-gradient-to-r from-[#0da2e7] to-[#22D3EE]"
                          initial={{ width: '0%' }}
                          animate={{ width: `${Math.min(employabilityScore, 100)}%` }}
                          transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-[#64748B]">0</span>
                        <span className="text-xs text-[#64748B]">100</span>
                      </div>
                    </div>
                  </div>
                  {/* Keep original ProgressBar as fallback / semantic reference */}
                  <div className="sr-only">
                    <ProgressBar
                      value={employabilityScore}
                      color="accent"
                      size="lg"
                      className="flex-1"
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/*  PRE-LOADED DATA SECTIONS (Always Visible)                   */}
      {/* ============================================================ */}

      {/* ---------------------------------------------------------- */}
      {/*  NSQF Level Guide                                           */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="stairs" size={20} className="text-[#0da2e7]" />
              NSQF Level Guide
            </h2>
            <Badge variant="gradient" size="md">
              <Icon name="info" size={14} className="mr-1" />
              10 Levels
            </Badge>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            variants={cardStagger}
            initial="hidden"
            animate="visible"
          >
            {NSQF_LEVELS.map((lvl) => {
              const isExpanded = expandedLevel === lvl.level;
              const isInRange = lvl.level >= currentLevel && lvl.level <= targetLevel;
              return (
                <motion.div
                  key={lvl.level}
                  variants={cardItem}
                  layout
                  onClick={() => setExpandedLevel(isExpanded ? null : lvl.level)}
                  className={`rounded-xl p-4 border cursor-pointer transition-colors duration-200 ${
                    isInRange
                      ? 'bg-[#0da2e7]/[0.06] border-[#0da2e7]/20'
                      : 'bg-[#0F172A]/60 border-white/[0.04]'
                  }`}
                  whileHover={{
                    y: -2,
                    borderColor: isInRange ? 'rgba(13,162,231,0.35)' : 'rgba(255,255,255,0.1)',
                    boxShadow: `0 4px 20px rgba(0,0,0,0.2)`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}
                    >
                      {lvl.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-white">{lvl.descriptor}</h4>
                        {isInRange && (
                          <Badge variant="accent" size="sm">
                            In Range
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{lvl.education}</p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed">
                              {lvl.description}
                            </p>
                            <div className="mt-3">
                              <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Typical Roles</p>
                              <div className="flex flex-wrap gap-1.5">
                                {lvl.roles.map((role) => (
                                  <Badge key={role} variant="default" size="sm">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <Icon name="currency_rupee" size={14} className="text-[#10B981]" />
                              <span className="text-xs text-[#10B981] font-semibold">{lvl.salaryRange}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Icon name="expand_more" size={18} className="text-[#64748B]" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/*  Top Vocational Sectors                                     */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="trending_up" size={20} className="text-[#10B981]" />
              Top Vocational Sectors
            </h2>
            <Badge variant="success" size="md" dot>
              High Demand
            </Badge>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            variants={cardStagger}
            initial="hidden"
            animate="visible"
          >
            {VOCATIONAL_SECTORS.map((sector, idx) => {
              const isExpanded = expandedSector === idx;
              return (
                <motion.div
                  key={sector.name}
                  variants={cardItem}
                  layout
                  onClick={() => setExpandedSector(isExpanded ? null : idx)}
                  className="rounded-xl p-4 border border-white/[0.04] bg-[#0F172A]/60 cursor-pointer"
                  whileHover={{
                    y: -3,
                    borderColor: `${sector.color}40`,
                    boxShadow: `0 8px 24px ${sector.color}10`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${sector.color}15` }}
                    >
                      <Icon name={sector.icon} size={20} style={{ color: sector.color }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{sector.name}</h4>
                      <div className="flex items-center gap-1">
                        <Icon name="arrow_upward" size={12} style={{ color: sector.color }} />
                        <span className="text-xs font-bold" style={{ color: sector.color }}>{sector.growth}% growth</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">Jobs Available</span>
                      <span className="text-xs font-semibold text-white">{sector.jobs}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: sector.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${sector.growth * 2}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">Salary Range</span>
                      <span className="text-xs font-semibold text-[#10B981]">{sector.salary}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-white/[0.06]">
                          <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">Top Roles</p>
                          <div className="space-y-1.5">
                            {sector.topRoles.map((role) => (
                              <div key={role} className="flex items-center gap-2">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: sector.color }}
                                />
                                <span className="text-xs text-[#94A3B8]">{role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center mt-2">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Icon name="expand_more" size={16} className="text-[#64748B]" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/*  Government Schemes (Always Visible)                        */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="account_balance" size={20} className="text-[#8B5CF6]" />
              Government Schemes & Programs
            </h2>
            <Badge variant="violet" size="md" dot>
              6 Active Schemes
            </Badge>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            variants={cardStagger}
            initial="hidden"
            animate="visible"
          >
            {GOVT_SCHEMES.map((scheme, idx) => {
              const isExpanded = expandedScheme === idx;
              return (
                <motion.div
                  key={scheme.name}
                  variants={cardItem}
                  layout
                  onClick={() => setExpandedScheme(isExpanded ? null : idx)}
                  className="rounded-xl p-4 border border-white/[0.04] bg-[#0F172A]/60 cursor-pointer"
                  whileHover={{
                    y: -2,
                    borderColor: `${scheme.color}30`,
                    boxShadow: `0 6px 20px ${scheme.color}08`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${scheme.color}15` }}
                    >
                      <Icon name={scheme.icon} size={20} style={{ color: scheme.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge size="sm" className={`font-bold`}>
                          {scheme.name}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-medium text-white mt-1.5 leading-snug">{scheme.fullName}</h4>
                      <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{scheme.description}</p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-white/[0.06]">
                              <div className="mb-3">
                                <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-1">Eligibility</p>
                                <p className="text-xs text-[#0da2e7] flex items-center gap-1">
                                  <Icon name="verified_user" size={13} />
                                  {scheme.eligibility}
                                </p>
                              </div>
                              <div className="mb-3">
                                <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-1.5">Key Benefits</p>
                                <div className="space-y-1.5">
                                  {scheme.benefits.map((benefit) => (
                                    <div key={benefit} className="flex items-center gap-2">
                                      <Icon name="check_circle" size={13} className="text-[#10B981] shrink-0" />
                                      <span className="text-xs text-[#94A3B8]">{benefit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Icon name="link" size={13} style={{ color: scheme.color }} />
                                <span className="text-xs font-medium" style={{ color: scheme.color }}>{scheme.link}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="shrink-0"
                    >
                      <Icon name="expand_more" size={18} className="text-[#64748B]" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/*  Popular Certifications                                     */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="workspace_premium" size={20} className="text-[#F59E0B]" />
              Popular Certifications
            </h2>
            <Badge variant="warning" size="md" dot>
              Industry Recognized
            </Badge>
          </div>

          {/* Sector Tabs */}
          <div className="flex gap-2 mb-5">
            {CERTIFICATIONS.map((sectorGroup, idx) => (
              <motion.button
                key={sectorGroup.sector}
                onClick={() => setActiveCertSector(idx)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  activeCertSector === idx
                    ? 'text-white shadow-[0_2px_12px_rgba(13,162,231,0.25)]'
                    : 'bg-[#0F172A]/60 text-[#64748B] border border-white/[0.04] hover:border-white/[0.1]'
                }`}
                style={
                  activeCertSector === idx
                    ? { backgroundColor: `${sectorGroup.color}20`, borderColor: `${sectorGroup.color}40`, border: `1px solid ${sectorGroup.color}40` }
                    : undefined
                }
              >
                <Icon name={sectorGroup.icon} size={16} style={activeCertSector === idx ? { color: sectorGroup.color } : undefined} />
                {sectorGroup.sector}
              </motion.button>
            ))}
          </div>

          {/* Certifications Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCertSector}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {CERTIFICATIONS[activeCertSector].certs.map((cert, ci) => {
                const sectorColor = CERTIFICATIONS[activeCertSector].color;
                const isFree = cert.cost.toLowerCase().includes('free');
                return (
                  <motion.div
                    key={cert.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24, delay: ci * 0.06 }}
                    className="rounded-xl p-4 border border-white/[0.04] bg-[#0F172A]/60"
                    whileHover={{
                      y: -2,
                      borderColor: `${sectorColor}30`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-white leading-tight">{cert.name}</h4>
                      <Badge
                        variant={isFree ? 'success' : 'warning'}
                        size="sm"
                      >
                        {isFree ? 'Free' : 'Paid'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mb-3">{cert.provider}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Icon name="schedule" size={13} className="text-[#64748B]" />
                        <span className="text-[11px] text-[#94A3B8]">{cert.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="payments" size={13} className="text-[#64748B]" />
                        <span className="text-[11px] text-[#94A3B8]">{cert.cost}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="stairs" size={13} style={{ color: sectorColor }} />
                        <span className="text-[11px] font-semibold" style={{ color: sectorColor }}>
                          NSQF Level {cert.nsqfLevel}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------- */}
      {/*  NSQF Quick Reference / Footer Info                        */}
      {/* ---------------------------------------------------------- */}
      <motion.div variants={itemVariants}>
        <Card glass>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0da2e7]/10 flex items-center justify-center shrink-0">
              <Icon name="lightbulb" size={20} className="text-[#0da2e7]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">About NSQF</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                The National Skills Qualifications Framework (NSQF) is a competency-based framework
                that organizes all qualifications according to a series of levels of knowledge, skills,
                and aptitude. These levels, graded from 1 to 10, are defined in terms of learning
                outcomes which the learner must possess regardless of whether they are obtained through
                formal, non-formal, or informal learning. NSQF is anchored by the Ministry of Skill
                Development and Entrepreneurship (MSDE) and applies to all sectors across India.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="accent" size="sm">
                  <Icon name="check" size={11} className="mr-0.5" />
                  Nationally Recognized
                </Badge>
                <Badge variant="violet" size="sm">
                  <Icon name="check" size={11} className="mr-0.5" />
                  Industry Aligned
                </Badge>
                <Badge variant="success" size="sm">
                  <Icon name="check" size={11} className="mr-0.5" />
                  Globally Comparable
                </Badge>
                <Badge variant="warning" size="sm">
                  <Icon name="check" size={11} className="mr-0.5" />
                  Credit Transferable
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Scheme Card sub-component (3D tilt on hover)                       */
/* ------------------------------------------------------------------ */

function SchemeCard({ scheme }: { scheme: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -6);
    setRotateY(((x - centerX) / centerX) * 6);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{
        borderColor: 'rgba(13,162,231,0.25)',
        boxShadow: '0 8px 30px rgba(13,162,231,0.08)',
      }}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      className="bg-[#1E293B] rounded-xl p-4 border border-[#1E293B] cursor-default"
    >
      <div style={{ transform: 'translateZ(20px)' }}>
        <h4 className="font-medium text-white text-sm">{scheme.name || scheme.title}</h4>
        <p className="text-xs text-[#94A3B8] mt-1">{scheme.description}</p>
        {scheme.eligibility && (
          <p className="text-xs text-[#0da2e7] mt-2 flex items-center gap-1">
            <Icon name="verified" size={12} />
            Eligibility: {scheme.eligibility}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default NSQF;
