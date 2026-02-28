import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import { usePortfolio } from '../hooks/usePortfolio';
import { linkedinAPI } from '../services/api';

/* ─── Animation variants ─── */

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};

/* ─── Platform definitions ─── */

type PlatformId = 'github' | 'linkedin' | 'resume' | 'website';

interface Platform {
  id: PlatformId;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  desc: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputIcon: string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'github',
    label: 'GitHub',
    icon: 'code',
    color: '#0da2e7',
    bgColor: 'rgba(13,162,231,0.08)',
    desc: 'Analyze repos, code quality, contributions & tech stack',
    inputLabel: 'GitHub Username',
    inputPlaceholder: 'e.g., octocat',
    inputIcon: 'code',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'business_center',
    color: '#0A66C2',
    bgColor: 'rgba(10,102,194,0.08)',
    desc: 'Analyze profile strength, network, endorsements & experience',
    inputLabel: 'LinkedIn Profile URL',
    inputPlaceholder: 'e.g., linkedin.com/in/johndoe',
    inputIcon: 'link',
  },
  {
    id: 'resume',
    label: 'Resume / CV',
    icon: 'description',
    color: '#8B5CF6',
    bgColor: 'rgba(139,92,246,0.08)',
    desc: 'AI analysis of your resume formatting, content & ATS score',
    inputLabel: 'Paste Resume Text',
    inputPlaceholder: 'Paste your resume content here...',
    inputIcon: 'content_paste',
  },
  {
    id: 'website',
    label: 'Portfolio Site',
    icon: 'language',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
    desc: 'Analyze your personal website for design, SEO & content quality',
    inputLabel: 'Website URL',
    inputPlaceholder: 'e.g., https://johndoe.dev',
    inputIcon: 'language',
  },
];

/* ─── Animated count-up hook ─── */

function useCountUp(target: number, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!trigger || target <= 0) { setValue(target); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, trigger]);
  return value;
}

const AnimatedScore = ({ score }: { score: number | string }) => {
  const numericScore = typeof score === 'number' ? score : parseInt(score, 10);
  const display = useCountUp(isNaN(numericScore) ? 0 : numericScore, 900);
  if (isNaN(numericScore)) return <span>—</span>;
  return <span>{display}</span>;
};

/* ─── LinkedIn analyzer using real API with fallback ─── */

const analyzeLinkedIn = async (url: string, targetRole?: string) => {
  try {
    const profileName = url.includes('/in/') ? url.split('/in/').pop()?.replace(/\/$/, '') || 'Professional' : 'Professional';
    const res = await linkedinAPI.optimizeProfile({
      targetRole: targetRole || 'Software Engineer',
      currentHeadline: profileName,
      currentAbout: '',
    });
    const data = res.data;
    return {
      platform: 'linkedin' as const,
      profileStrength: data.afterScore || data.overallScore || 75,
      headline: data.optimizedHeadline || profileName,
      metrics: { connections: 500, endorsements: 24, recommendations: 3, posts: 12, profileViews: 156 },
      scores: {
        overall: data.afterScore || data.overallScore || 75,
        headline: data.improvements?.find((i: any) => i.category === 'Headline') ? 85 : 70,
        summary: data.improvements?.find((i: any) => i.category === 'About Section') ? 80 : 55,
        experience: 72,
        skills: data.keywords?.length >= 8 ? 82 : 65,
        network: 70,
      },
      recommendations: [
        ...(data.improvements || []).map((i: any) => i.reason),
        ...(data.missingElements || []).slice(0, 2).map((el: string) => `Add: ${el}`),
      ].slice(0, 5),
      missingElements: data.missingElements || [],
      keywords: data.keywords || [],
      optimizedHeadline: data.optimizedHeadline,
      optimizedAbout: data.optimizedAbout,
      beforeScore: data.beforeScore,
      afterScore: data.afterScore,
      improvements: data.improvements || [],
    };
  } catch (err: any) {
    console.warn('[Portfolio] LinkedIn API failed, using local analysis:', err.message);
    return {
      platform: 'linkedin' as const,
      profileStrength: 78,
      headline: url.includes('/') ? url.split('/').pop() || 'Professional' : 'Professional',
      metrics: { connections: 500, endorsements: 24, recommendations: 3, posts: 12, profileViews: 156 },
      scores: { overall: 78, headline: 85, summary: 65, experience: 82, skills: 70, network: 75 },
      recommendations: [
        'Add a professional summary highlighting your key achievements and career goals',
        'Request at least 2 more recommendations from managers or senior colleagues',
        'Add relevant certifications to boost profile credibility',
        'Increase posting frequency to 2-3 times/week for better visibility',
        'Add featured projects or media to showcase your work',
      ],
      missingElements: ['Professional Photo', 'Custom URL', 'Featured Section', 'Volunteer Experience'],
      keywords: [],
      optimizedHeadline: '',
      optimizedAbout: '',
      beforeScore: 52,
      afterScore: 78,
      improvements: [],
    };
  }
};

const mockResumeAnalysis = async (text: string) => {
  await new Promise(r => setTimeout(r, 2000));
  const wordCount = text.split(/\s+/).length;
  return {
    platform: 'resume' as const,
    atsScore: 72,
    wordCount,
    scores: { overall: 72, formatting: 80, content: 68, keywords: 65, impact: 75, readability: 78 },
    keywords: {
      found: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      missing: ['TypeScript', 'AWS', 'Docker', 'CI/CD', 'Agile'],
    },
    recommendations: [
      'Add quantified achievements (numbers, percentages, metrics) to each role',
      'Include industry-relevant keywords: TypeScript, AWS, Docker',
      'Use stronger action verbs: "Architected", "Spearheaded", "Optimized"',
      'Keep resume to 1-2 pages for optimal ATS parsing',
      'Add a skills section organized by category (Languages, Frameworks, Tools)',
    ],
    sections: {
      present: ['Contact Info', 'Experience', 'Education', 'Skills'],
      missing: ['Summary/Objective', 'Projects', 'Certifications', 'Awards'],
    },
  };
};

const mockWebsiteAnalysis = async (url: string) => {
  await new Promise(r => setTimeout(r, 2200));
  return {
    platform: 'website' as const,
    url,
    scores: { overall: 81, design: 85, content: 78, seo: 72, performance: 88, accessibility: 76 },
    techStack: ['React', 'Tailwind CSS', 'Vercel'],
    recommendations: [
      'Add meta descriptions and Open Graph tags for better SEO and social sharing',
      'Include a clear call-to-action (CTA) on the hero section',
      'Add project case studies with detailed process descriptions',
      'Improve accessibility: add alt text to images, ensure color contrast ratios',
      'Add a blog section to showcase expertise and improve SEO',
    ],
    highlights: ['Clean responsive design', 'Good load time (< 2s)', 'Mobile-friendly layout'],
    issues: ['Missing sitemap.xml', 'No structured data markup', 'Low text-to-HTML ratio'],
  };
};

/* ─── Main Component ─── */

const Portfolio = () => {
  const { analyses, loading, analyzing, error, analyzeGitHub } = usePortfolio();
  const [activePlatform, setActivePlatform] = useState<PlatformId>('github');
  const [inputValue, setInputValue] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');

  const [linkedInResult, setLinkedInResult] = useState<any>(null);
  const [resumeResult, setResumeResult] = useState<any>(null);
  const [websiteResult, setWebsiteResult] = useState<any>(null);
  const [platformAnalyzing, setPlatformAnalyzing] = useState(false);
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [showAllRepos, setShowAllRepos] = useState(false);

  const platform = PLATFORMS.find(p => p.id === activePlatform)!;
  const latestGitHubAnalysis = analyses[0];

  const scores = [
    latestGitHubAnalysis?.overallScore || latestGitHubAnalysis?.score,
    linkedInResult?.scores?.overall,
    resumeResult?.scores?.overall,
    websiteResult?.scores?.overall,
  ].filter(Boolean) as number[];
  const combinedScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const platformsAnalyzed = scores.length;

  const handleAnalyze = async () => {
    setPlatformError(null);
    if (activePlatform === 'github') {
      if (!inputValue.trim()) return;
      analyzeGitHub(inputValue.trim(), targetRole.trim() || undefined);
      return;
    }
    setPlatformAnalyzing(true);
    try {
      if (activePlatform === 'linkedin') {
        if (!inputValue.trim()) { setPlatformError('Please enter a LinkedIn profile URL'); setPlatformAnalyzing(false); return; }
        const result = await analyzeLinkedIn(inputValue.trim(), targetRole.trim() || undefined);
        setLinkedInResult(result);
      } else if (activePlatform === 'resume') {
        if (!resumeText.trim()) { setPlatformError('Please paste your resume text'); setPlatformAnalyzing(false); return; }
        const result = await mockResumeAnalysis(resumeText.trim());
        setResumeResult(result);
      } else if (activePlatform === 'website') {
        if (!inputValue.trim()) { setPlatformError('Please enter a website URL'); setPlatformAnalyzing(false); return; }
        const result = await mockWebsiteAnalysis(inputValue.trim());
        setWebsiteResult(result);
      }
    } catch {
      setPlatformError('Analysis failed. Please try again.');
    }
    setPlatformAnalyzing(false);
  };

  const getActiveResult = () => {
    switch (activePlatform) {
      case 'github': return latestGitHubAnalysis;
      case 'linkedin': return linkedInResult;
      case 'resume': return resumeResult;
      case 'website': return websiteResult;
      default: return null;
    }
  };

  const isCurrentlyAnalyzing = activePlatform === 'github' ? analyzing : platformAnalyzing;
  const currentError = activePlatform === 'github' ? error : platformError;
  const activeResult = getActiveResult();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.1), rgba(139,92,246,0.08))', border: '1px solid rgba(13,162,231,0.15)' }}
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <Icon name="work_history" size={24} className="text-accent" />
        </motion.div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-accent/40"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
      {/* ── Header with Combined Score ── */}
      <motion.div variants={item}>
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.06), rgba(139,92,246,0.04), rgba(15,23,42,0.8))', border: '1px solid rgba(13,162,231,0.08)' }}>
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
          <motion.div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.04] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} />

          <div className="relative z-[1] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">Portfolio Analysis Hub</h1>
              <p className="text-sm text-secondary">Analyze your digital presence across multiple platforms with AI.</p>
            </div>
            {platformsAnalyzed > 0 && (
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <svg className="w-20 h-20" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                    <motion.circle cx="40" cy="40" r="32" fill="none" strokeWidth="6"
                      stroke="url(#portfolioGrad)" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - combinedScore / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      transform="rotate(-90 40 40)"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(13,162,231,0.4))' }} />
                    <defs>
                      <linearGradient id="portfolioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0da2e7" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-white">{combinedScore}</span>
                    <span className="text-[8px] text-muted font-medium uppercase tracking-wider">Score</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{platformsAnalyzed} Platform{platformsAnalyzed > 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted">Analyzed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Platform Selector Cards ── */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PLATFORMS.map((p, i) => {
          const isActive = activePlatform === p.id;
          const hasResult = p.id === 'github' ? !!latestGitHubAnalysis :
            p.id === 'linkedin' ? !!linkedInResult : p.id === 'resume' ? !!resumeResult : !!websiteResult;
          return (
            <motion.button key={p.id}
              onClick={() => { setActivePlatform(p.id); setPlatformError(null); }}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border overflow-hidden group transition-all duration-200 ${
                isActive ? 'border-white/[0.1]' : 'border-white/[0.04] hover:border-white/[0.08]'}`}
              style={{ background: isActive ? `linear-gradient(145deg, ${p.color}12, rgba(15,23,42,0.6))` : 'linear-gradient(145deg, rgba(30,41,59,0.4), rgba(15,23,42,0.3))' }}
              whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.2), 0 0 20px ${p.color}10` }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}>
              {isActive && (
                <motion.div layoutId="platform-active" className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: p.bgColor, border: `1px solid ${p.color}20` }}>
                <Icon name={p.icon} size={22} style={{ color: p.color }} />
              </div>
              <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-white' : 'text-secondary'}`}>{p.label}</span>
              {hasResult && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}>
                  <Icon name="check" size={12} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Platform Input Section ── */}
      <motion.div variants={item}>
        <Card glass>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: platform.bgColor }}>
              <Icon name={platform.icon} size={16} style={{ color: platform.color }} />
            </div>
            <h3 className="text-[15px] font-bold text-white">{platform.label} Analysis</h3>
          </div>
          <p className="text-xs text-muted mb-4">{platform.desc}</p>

          {activePlatform === 'resume' ? (
            <div className="space-y-3">
              <div className="relative">
                <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here... (Education, Experience, Skills, Projects, etc.)"
                  rows={6}
                  className="w-full bg-inset border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-muted outline-none resize-none transition-all duration-200 focus:border-[#8B5CF6]/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]" />
                <div className="absolute bottom-3 right-3 text-[10px] text-muted">
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <Input label="Target Role (Optional)" icon="work" placeholder="e.g., Full Stack Developer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                </div>
                <Button variant="primary" onClick={handleAnalyze} loading={isCurrentlyAnalyzing} disabled={!resumeText.trim()}>
                  <Icon name="analytics" size={18} /> Analyze
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input label={platform.inputLabel} icon={platform.inputIcon} placeholder={platform.inputPlaceholder}
                  value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              </div>
              {(activePlatform === 'github' || activePlatform === 'linkedin') && (
                <div className="flex-1">
                  <Input label="Target Role (Optional)" icon="work" placeholder="e.g., Full Stack Developer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                </div>
              )}
              <div className="flex items-end">
                <Button variant="primary" onClick={handleAnalyze} loading={isCurrentlyAnalyzing} disabled={!inputValue.trim()}>
                  <Icon name="analytics" size={18} /> Analyze
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Analyzing Spinner ── */}
      <AnimatePresence mode="wait">
        {isCurrentlyAnalyzing && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <Card glass className="text-center py-10">
              <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: platform.bgColor, border: `1px solid ${platform.color}20` }}
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Icon name={platform.icon} size={26} style={{ color: platform.color }} />
              </motion.div>
              <motion.p className="text-white font-medium" animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                Analyzing {platform.label} profile...
              </motion.p>
              <div className="flex gap-1 justify-center mt-3">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: platform.color, opacity: 0.4 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {activeResult && !isCurrentlyAnalyzing && (
          <motion.div key={`result-${activePlatform}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

            {/* ── GitHub Results ── */}
            {activePlatform === 'github' && latestGitHubAnalysis && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Overall Score', value: `${latestGitHubAnalysis.overallScore || latestGitHubAnalysis.score || 0}/100`, icon: 'speed' },
                    { label: 'Repositories', value: latestGitHubAnalysis.originalReposCount || latestGitHubAnalysis.repositories?.length || 0, icon: 'folder' },
                    { label: 'Languages', value: [...new Set((latestGitHubAnalysis.repositories || []).map((r: any) => r.language).filter(Boolean))].length || 0, icon: 'code' },
                    { label: 'Stars', value: (latestGitHubAnalysis.repositories || []).reduce((s: number, r: any) => s + (r.stars || 0), 0), icon: 'star' },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}>
                      <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
                    </motion.div>
                  ))}
                </div>

                {/* Score Breakdown */}
                {(latestGitHubAnalysis.codeQualityScore || latestGitHubAnalysis.diversityScore || latestGitHubAnalysis.contributionScore) && (
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10">
                          <Icon name="bar_chart" size={16} className="text-accent" />
                        </div>
                        <h3 className="text-[15px] font-bold text-white">Score Breakdown</h3>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Code Quality', value: latestGitHubAnalysis.codeQualityScore || 0 },
                          { label: 'Tech Diversity', value: latestGitHubAnalysis.diversityScore || 0 },
                          { label: 'Contribution Activity', value: latestGitHubAnalysis.contributionScore || 0 },
                        ].map((score, i) => (
                          <motion.div key={score.label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-secondary">{score.label}</span>
                              <span className="text-[11px] font-bold text-white">{score.value}%</span>
                            </div>
                            <ProgressBar value={score.value} color={score.value >= 70 ? 'success' : score.value >= 50 ? 'accent' : 'warning'} size="xs" />
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Summary */}
                {latestGitHubAnalysis.summary && (
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10">
                          <Icon name="summarize" size={16} className="text-accent" />
                        </div>
                        <h3 className="text-[15px] font-bold text-white">Summary</h3>
                      </div>
                      <p className="text-sm text-secondary leading-relaxed">{latestGitHubAnalysis.summary}</p>
                    </Card>
                  </motion.div>
                )}

                {/* Strengths & Weaknesses */}
                {(latestGitHubAnalysis.strengths?.length > 0 || latestGitHubAnalysis.weaknesses?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {latestGitHubAnalysis.strengths?.length > 0 && (
                      <motion.div variants={item}>
                        <Card glass>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon name="check_circle" size={16} className="text-success" />
                            <h3 className="text-sm font-bold text-white">Strengths</h3>
                          </div>
                          <div className="space-y-2">
                            {latestGitHubAnalysis.strengths.map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-2">
                                <Icon name="check" size={13} className="text-success mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-secondary">{s}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                    {latestGitHubAnalysis.weaknesses?.length > 0 && (
                      <motion.div variants={item}>
                        <Card glass>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon name="info" size={16} className="text-warning" />
                            <h3 className="text-sm font-bold text-white">Areas to Improve</h3>
                          </div>
                          <div className="space-y-2">
                            {latestGitHubAnalysis.weaknesses.map((w: string, i: number) => (
                              <div key={i} className="flex items-start gap-2">
                                <Icon name="arrow_right" size={13} className="text-warning mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-secondary">{w}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}

                {(latestGitHubAnalysis.repositories || latestGitHubAnalysis.repos) && (() => {
                  const allRepos = latestGitHubAnalysis.repositories || latestGitHubAnalysis.repos || [];
                  const displayRepos = showAllRepos ? allRepos : allRepos.slice(0, 8);
                  return (
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10">
                            <Icon name="folder" size={16} className="text-accent" />
                          </div>
                          <h3 className="text-[15px] font-bold text-white">Repository Analysis</h3>
                        </div>
                        <Badge variant="accent" size="sm">{allRepos.length} repos</Badge>
                      </div>
                      <div className="space-y-2.5">
                        {displayRepos.map((repo: any, i: number) => {
                          const repoName = repo.repoName || repo.name;
                          const repoScore = repo.codeQualityScore || repo.score || repo.quality || 0;
                          const isExpanded = expandedRepo === repoName;
                          const improvements = typeof repo.improvements === 'string' ? JSON.parse(repo.improvements) : (repo.improvements || []);
                          const highlights = typeof repo.highlights === 'string' ? JSON.parse(repo.highlights) : (repo.highlights || []);
                          return (
                          <motion.div key={repoName || i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.04 }}>
                            <div
                              onClick={() => setExpandedRepo(isExpanded ? null : repoName)}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                                isExpanded ? 'border-accent/30 bg-accent/[0.04]' : 'border-white/[0.04] hover:border-accent/20'
                              }`}
                              style={!isExpanded ? { background: 'rgba(15,23,42,0.4)' } : undefined}>
                              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <Icon name="folder" size={18} className="text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-white truncate">{repoName}</p>
                                  {repo.complexity && (
                                    <Badge size="sm" variant={repo.complexity === 'high' ? 'success' : repo.complexity === 'moderate' ? 'accent' : 'default'}>
                                      {repo.complexity}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {repo.language && <Badge size="sm" variant="default">{repo.language}</Badge>}
                                  {(repo.stars || 0) > 0 && (<span className="text-[11px] text-muted flex items-center gap-0.5"><Icon name="star" size={11} className="text-warning" /> {repo.stars}</span>)}
                                  {(repo.forks || 0) > 0 && (<span className="text-[11px] text-muted flex items-center gap-0.5"><Icon name="call_split" size={11} /> {repo.forks}</span>)}
                                  {repo.description && <span className="text-[11px] text-muted truncate max-w-[200px]">{repo.description}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-bold text-accent"><AnimatedScore score={repoScore} /></p>
                                  <p className="text-[10px] text-muted">Score</p>
                                </div>
                                <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={18} className="text-muted" />
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden">
                                  <div className="p-4 mt-1 rounded-xl space-y-4" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    {/* Score bar */}
                                    <div>
                                      <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-medium text-secondary">Code Quality</span>
                                        <span className="text-xs font-bold text-white">{repoScore}/100</span>
                                      </div>
                                      <ProgressBar value={repoScore} color={repoScore >= 70 ? 'success' : repoScore >= 50 ? 'accent' : 'warning'} size="xs" />
                                    </div>

                                    {/* Highlights */}
                                    {highlights.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                                          <Icon name="check_circle" size={13} className="text-success" /> Highlights
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {highlights.map((h: string, hi: number) => (
                                            <Badge key={hi} variant="success" size="sm">{h}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Improvements */}
                                    {improvements.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                                          <Icon name="lightbulb" size={13} className="text-warning" /> Suggested Improvements
                                        </p>
                                        <div className="space-y-1.5">
                                          {improvements.map((imp: string, ii: number) => (
                                            <div key={ii} className="flex items-start gap-2 text-xs text-secondary">
                                              <Icon name="arrow_right" size={12} className="text-accent mt-0.5 flex-shrink-0" />
                                              <span>{imp}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* README quality */}
                                    {repo.readmeQuality && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted">README:</span>
                                        <Badge size="sm" variant={repo.readmeQuality === 'good' || repo.readmeQuality === 'excellent' ? 'success' : 'warning'}>
                                          {repo.readmeQuality}
                                        </Badge>
                                      </div>
                                    )}

                                    {/* Link to repo */}
                                    {repo.repoUrl && (
                                      <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors">
                                        <Icon name="open_in_new" size={13} /> View on GitHub
                                      </a>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          );
                        })}
                      </div>

                      {/* Show more / less toggle */}
                      {allRepos.length > 8 && (
                        <motion.button
                          onClick={() => setShowAllRepos(!showAllRepos)}
                          className="w-full mt-3 py-2.5 rounded-xl text-xs font-medium text-accent hover:bg-accent/5 transition-colors flex items-center justify-center gap-1"
                          whileTap={{ scale: 0.98 }}>
                          <Icon name={showAllRepos ? 'expand_less' : 'expand_more'} size={16} />
                          {showAllRepos ? 'Show Less' : `Show All ${allRepos.length} Repositories`}
                        </motion.button>
                      )}
                    </Card>
                  </motion.div>
                  );
                })()}
              </>
            )}

            {/* ── LinkedIn Results ── */}
            {activePlatform === 'linkedin' && linkedInResult && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Profile Score', value: `${linkedInResult.scores.overall}/100`, icon: 'speed' },
                    { label: 'Before Score', value: `${linkedInResult.beforeScore || 52}/100`, icon: 'trending_up' },
                    { label: 'After Score', value: `${linkedInResult.afterScore || linkedInResult.scores.overall}/100`, icon: 'trending_up' },
                    { label: 'Keywords', value: linkedInResult.keywords?.length || 0, icon: 'key' },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}>
                      <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
                    </motion.div>
                  ))}
                </div>
                <motion.div variants={item}>
                  <Card glass>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(10,102,194,0.1)' }}>
                        <Icon name="bar_chart" size={16} style={{ color: '#0A66C2' }} />
                      </div>
                      <h3 className="text-[15px] font-bold text-white">Profile Breakdown</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(linkedInResult.scores).filter(([k]) => k !== 'overall').map(([key, val]: [string, any], i) => (
                        <motion.div key={key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-secondary capitalize">{key}</span>
                            <span className="text-[11px] font-bold text-white">{val}%</span>
                          </div>
                          <ProgressBar value={val} color={val >= 75 ? 'success' : val >= 50 ? 'accent' : 'warning'} size="xs" />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
                {linkedInResult.optimizedHeadline && (
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                          <Icon name="auto_fix_high" size={16} className="text-success" />
                        </div>
                        <h3 className="text-[15px] font-bold text-white">Optimized Headline</h3>
                      </div>
                      <p className="text-sm text-white/90 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                        {linkedInResult.optimizedHeadline}
                      </p>
                    </Card>
                  </motion.div>
                )}
                {linkedInResult.keywords?.length > 0 && (
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(13,162,231,0.1)' }}>
                          <Icon name="sell" size={16} className="text-accent" />
                        </div>
                        <h3 className="text-[15px] font-bold text-white">ATS Keywords</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {linkedInResult.keywords.map((kw: string) => (
                          <Badge key={kw} variant="accent" size="sm">{kw}</Badge>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
                <motion.div variants={item}>
                  <Card glass>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Icon name="warning" size={16} className="text-warning" />
                      </div>
                      <h3 className="text-[15px] font-bold text-white">Missing Elements</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {linkedInResult.missingElements.map((el: string) => (
                        <Badge key={el} variant="warning" size="sm" dot>{el}</Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </>
            )}

            {/* ── Resume Results ── */}
            {activePlatform === 'resume' && resumeResult && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'ATS Score', value: `${resumeResult.atsScore}/100`, icon: 'smart_toy' },
                    { label: 'Word Count', value: resumeResult.wordCount, icon: 'notes' },
                    { label: 'Keywords Found', value: resumeResult.keywords.found.length, icon: 'key' },
                    { label: 'Keywords Missing', value: resumeResult.keywords.missing.length, icon: 'search_off' },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}>
                      <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
                    </motion.div>
                  ))}
                </div>
                <motion.div variants={item}>
                  <Card glass>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}>
                        <Icon name="bar_chart" size={16} style={{ color: '#8B5CF6' }} />
                      </div>
                      <h3 className="text-[15px] font-bold text-white">Resume Scores</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(resumeResult.scores).filter(([k]) => k !== 'overall').map(([key, val]: [string, any], i) => (
                        <motion.div key={key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-secondary capitalize">{key}</span>
                            <span className="text-[11px] font-bold text-white">{val}%</span>
                          </div>
                          <ProgressBar value={val} color={val >= 75 ? 'success' : val >= 50 ? 'accent' : 'warning'} size="xs" />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="check_circle" size={16} className="text-success" />
                        <h3 className="text-sm font-bold text-white">Keywords Found</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeResult.keywords.found.map((k: string) => (<Badge key={k} variant="success" size="sm">{k}</Badge>))}
                      </div>
                    </Card>
                  </motion.div>
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="add_circle" size={16} className="text-warning" />
                        <h3 className="text-sm font-bold text-white">Missing Keywords</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeResult.keywords.missing.map((k: string) => (<Badge key={k} variant="warning" size="sm" dot>{k}</Badge>))}
                      </div>
                    </Card>
                  </motion.div>
                </div>
                <motion.div variants={item}>
                  <Card glass>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="playlist_add" size={16} className="text-accent" />
                      <h3 className="text-sm font-bold text-white">Recommended Sections to Add</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resumeResult.sections.missing.map((s: string) => (<Badge key={s} variant="accent" size="sm" dot>{s}</Badge>))}
                    </div>
                  </Card>
                </motion.div>
              </>
            )}

            {/* ── Website Results ── */}
            {activePlatform === 'website' && websiteResult && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: 'Overall', value: `${websiteResult.scores.overall}/100`, icon: 'speed' },
                    { label: 'Design', value: `${websiteResult.scores.design}/100`, icon: 'palette' },
                    { label: 'Performance', value: `${websiteResult.scores.performance}/100`, icon: 'bolt' },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}>
                      <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
                    </motion.div>
                  ))}
                </div>
                <motion.div variants={item}>
                  <Card glass>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <Icon name="bar_chart" size={16} className="text-success" />
                      </div>
                      <h3 className="text-[15px] font-bold text-white">Website Scores</h3>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(websiteResult.scores).filter(([k]) => k !== 'overall').map(([key, val]: [string, any], i) => (
                        <motion.div key={key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-secondary capitalize">{key}</span>
                            <span className="text-[11px] font-bold text-white">{val}%</span>
                          </div>
                          <ProgressBar value={val} color={val >= 75 ? 'success' : val >= 50 ? 'accent' : 'warning'} size="xs" />
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="layers" size={16} className="text-accent" />
                        <h3 className="text-sm font-bold text-white">Detected Tech Stack</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {websiteResult.techStack.map((t: string) => (<Badge key={t} variant="accent" size="sm">{t}</Badge>))}
                      </div>
                    </Card>
                  </motion.div>
                  <motion.div variants={item}>
                    <Card glass>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="check_circle" size={16} className="text-success" />
                        <h3 className="text-sm font-bold text-white">Highlights</h3>
                      </div>
                      <div className="space-y-2">
                        {websiteResult.highlights.map((h: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <Icon name="check" size={14} className="text-success mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-secondary">{h}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                </div>
                <motion.div variants={item}>
                  <Card glass>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="bug_report" size={16} className="text-warning" />
                      <h3 className="text-sm font-bold text-white">Issues Found</h3>
                    </div>
                    <div className="space-y-2">
                      {websiteResult.issues.map((iss: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Icon name="warning" size={14} className="text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-secondary">{iss}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </>
            )}

            {/* ── AI Recommendations (all platforms) ── */}
            {(() => {
              const recs = activePlatform === 'github'
                ? (latestGitHubAnalysis?.recommendations || latestGitHubAnalysis?.suggestions)
                : activeResult?.recommendations;
              if (!recs || recs.length === 0) return null;
              return (
                <motion.div variants={item}>
                  <Card glass>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(13,162,231,0.1)' }}>
                          <Icon name="auto_awesome" size={16} className="text-accent" />
                        </div>
                        <h3 className="text-[15px] font-bold text-white">AI Recommendations</h3>
                      </div>
                      <Badge variant="gradient" size="sm" dot>AI Powered</Badge>
                    </div>
                    <div className="space-y-2.5">
                      {recs.map((rec: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                          className="flex items-start gap-3 p-3 rounded-xl border-l-[3px] hover:bg-white/[0.02] transition-colors"
                          style={{ borderLeftColor: platform.color, background: 'rgba(15,23,42,0.3)' }}>
                          <Icon name="lightbulb" size={16} className="text-warning mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-secondary leading-relaxed">{typeof rec === 'string' ? rec : rec.text || rec.suggestion}</p>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })()}

            {/* Skill gaps (GitHub only) */}
            {activePlatform === 'github' && latestGitHubAnalysis?.skillGaps && (
              <motion.div variants={item}>
                <Card glass>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10">
                      <Icon name="trending_up" size={16} className="text-accent" />
                    </div>
                    <h3 className="text-[15px] font-bold text-white">Skill Gap Analysis</h3>
                  </div>
                  <div className="space-y-3">
                    {latestGitHubAnalysis.skillGaps.map((gap: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-secondary">{gap.skill || gap.name}</span>
                          <span className="text-[11px] text-muted">{gap.current || 0}/{gap.required || 100}</span>
                        </div>
                        <ProgressBar value={gap.current || gap.level || 0} max={gap.required || 100}
                          color={(gap.current || 0) >= (gap.required || 100) * 0.7 ? 'success' : 'warning'} size="xs" />
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cross-Platform Insights ── */}
      {platformsAnalyzed >= 2 && (
        <motion.div variants={item}>
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.08), rgba(139,92,246,0.05))', border: '1px solid rgba(13,162,231,0.12)' }}>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.06] pointer-events-none"
              style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} />
            <div className="relative z-[1]">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="insights" size={18} className="text-accent" />
                <span className="text-sm font-bold text-white">Cross-Platform Insight</span>
                <Badge variant="gradient" size="sm">Multi-Source</Badge>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                Based on analysis across <span className="text-white font-semibold">{platformsAnalyzed} platforms</span>, your
                combined portfolio score is <span className="text-accent font-bold">{combinedScore}/100</span>.
                {combinedScore >= 75 ? ' Your digital presence is strong. Focus on consistency across platforms.'
                  : combinedScore >= 50 ? ' Good potential. Strengthen weaker platforms to boost your overall score.'
                  : ' Focus on building up your profiles one at a time to improve your digital footprint.'}
              </p>
              <div className="mt-4 space-y-2">
                {PLATFORMS.map(p => {
                  const pScore = p.id === 'github' ? (latestGitHubAnalysis?.overallScore || latestGitHubAnalysis?.score || 0) :
                    p.id === 'linkedin' ? (linkedInResult?.scores?.overall || 0) :
                    p.id === 'resume' ? (resumeResult?.scores?.overall || 0) :
                    (websiteResult?.scores?.overall || 0);
                  if (!pScore) return null;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon name={p.icon} size={13} style={{ color: p.color }} />
                          <span className="text-xs text-secondary">{p.label}</span>
                        </div>
                        <span className="text-[11px] font-bold text-white">{pScore}%</span>
                      </div>
                      <ProgressBar value={pScore} color={pScore >= 75 ? 'success' : pScore >= 50 ? 'accent' : 'warning'} size="xs" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Previous Analyses ── */}
      {analyses.length > 1 && (
        <motion.div variants={item}>
          <Card glass>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5">
                <Icon name="history" size={16} className="text-muted" />
              </div>
              <h3 className="text-[15px] font-bold text-white">Previous Analyses</h3>
            </div>
            <div className="space-y-1.5">
              {analyses.slice(1, 5).map((a: any, i: number) => (
                <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors cursor-default">
                  <div className="flex items-center gap-2">
                    <Icon name="code" size={14} className="text-accent" />
                    <span className="text-sm text-secondary">{a.githubUsername || 'Analysis'}</span>
                  </div>
                  <span className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString()}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {currentError && (
          <motion.p key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-error">
            {currentError}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Portfolio;
