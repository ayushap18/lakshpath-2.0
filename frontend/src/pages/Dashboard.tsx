import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { useAssessment } from '../hooks/useAssessment';
import { useProfile } from '../hooks/useProfile';
import { profileAPI, userAPI } from '../services/api';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};

const RARITY_COLORS: Record<string, string> = {
  COMMON: '#94A3B8',
  RARE: '#0da2e7',
  EPIC: '#8B5CF6',
  LEGENDARY: '#F59E0B',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { results, loading: assessLoading } = useAssessment();
  const { loading: profileLoading } = useProfile();
  const [profileData, setProfileData] = useState<any>(null);
  const [streakData, setStreakData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const loading = assessLoading || profileLoading;
  const userName = localStorage.getItem('userName') || 'Student';

  useEffect(() => {
    profileAPI.getFullProfile().then(res => setProfileData(res.data)).catch(() => {});
    userAPI.getStreak().then(res => setStreakData(res.data)).catch(() => {});
    userAPI.getSettings().then(res => setSettingsData(res.data.user)).catch(() => {});
  }, []);

  const analysis = profileData?.parsed;
  const badges = profileData?.badges || [];
  const topCareerMatch = analysis?.careerMatches?.[0];
  const topMatch = results?.careerMatches?.[0];
  // FIX HIGH-10: Don't show fake fallback career data — use null when no real data exists
  const matchScore = topCareerMatch?.matchScore || topMatch?.match_score || topMatch?.matchPercentage || null;
  const matchTitle = topCareerMatch?.role || topMatch?.title || null;
  const matchSalary = topCareerMatch?.avgSalary || topMatch?.salary || null;
  const hasCareerMatch = matchTitle !== null;
  const roadmap = results?.roadmap;
  const skills = analysis?.skillLevels || {};
  const overallScore = profileData?.analysis?.overallScore || 0;
  const level = profileData?.analysis?.level || 'BEGINNER';

  const hasGithub = !!settingsData?.githubUsername;
  const hasLinkedin = !!settingsData?.linkedinUrl;
  const streak = streakData?.streak || 0;
  const xp = streakData?.xp || 0;
  const xpLevel = streakData?.level || 1;
  const xpLevelLabel = streakData?.levelLabel || 'Beginner';
  const xpProgress = streakData?.xpProgress || 0;
  const xpInLevel = streakData?.xpInLevel || 0;
  const xpNeeded = streakData?.xpNeeded || 100;

  const quickActions = [
    { label: 'AI Mentor', icon: 'neurology', path: '/chat', color: '#0da2e7', bgColor: 'rgba(13,162,231,0.1)' },
    { label: 'Interview', icon: 'record_voice_over', path: '/interview', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.1)' },
    { label: 'Portfolio', icon: 'work_history', path: '/portfolio', color: '#10B981', bgColor: 'rgba(16,185,129,0.1)' },
    { label: 'Market', icon: 'query_stats', path: '/market', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)' },
  ];

  const microTasks = results?.microCoach?.microTasks?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Hero skeleton */}
        <div className="rounded-2xl p-6 h-32" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-5 w-48 rounded-lg bg-white/8 mb-3" />
          <div className="h-4 w-72 rounded-lg bg-white/5" />
        </div>
        {/* Stat card skeletons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl p-4 h-24" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-4 w-16 rounded bg-white/8 mb-2" />
              <div className="h-7 w-12 rounded bg-white/6" />
            </div>
          ))}
        </div>
        {/* Content skeletons */}
        {[1,2].map(i => (
          <div key={i} className="rounded-2xl p-5 h-40" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-4 w-32 rounded bg-white/8 mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-white/5" />
              <div className="h-3 w-4/5 rounded bg-white/5" />
              <div className="h-3 w-3/5 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-5">
      {/* Welcome Hero Section */}
      <motion.div variants={item}>
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.06), rgba(139,92,246,0.04), rgba(15,23,42,0.8))', border: '1px solid rgba(13,162,231,0.08)' }}>
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
          <motion.div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

          <div className="relative z-[1] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">Welcome back, {userName.split(' ')[0]}</h1>
                <motion.span animate={{ rotate: [0, 14, -8, 14, 0] }} transition={{ duration: 1.5, delay: 0.5 }}>
                  <Icon name="waving_hand" size={20} style={{ color: '#F59E0B' }} />
                </motion.span>
              </div>
              <p className="text-sm text-secondary">Your career trajectory is looking strong. Keep the momentum going.</p>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {[
                { label: 'Streak', value: `${streak} days`, icon: 'local_fire_department', color: '#F59E0B' },
                { label: 'XP', value: String(xp), icon: 'stars', color: '#8B5CF6' },
                { label: 'Level', value: `${xpLevel} - ${xpLevelLabel}`, icon: 'emoji_events', color: '#10B981' },
              ].map((stat, i) => (
                <motion.div key={stat.label} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}15` }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <Icon name={stat.icon} size={16} style={{ color: stat.color }} />
                  <div>
                    <p className="text-[10px] text-muted leading-none">{stat.label}</p>
                    <p className="text-xs font-bold text-white leading-tight">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="relative z-[1] mt-4 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-secondary">Level {xpLevel} Progress</span>
              <span className="text-[11px] font-bold text-accent">{xpInLevel} / {xpNeeded} XP</span>
            </div>
            <ProgressBar value={xpProgress} color="gradient" size="xs" />
          </div>
        </div>
      </motion.div>

      {/* GitHub & LinkedIn Analysis Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* GitHub Analysis Card */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(15,23,42,0.5))', border: `1px solid ${hasGithub ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: hasGithub ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)' }}>
              <Icon name="code" size={22} className={hasGithub ? 'text-success' : 'text-muted'} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">GitHub Analysis</h3>
              <p className="text-[11px] text-muted">{hasGithub ? `@${settingsData.githubUsername}` : 'Not connected'}</p>
            </div>
            {hasGithub ? (
              <Badge variant="success" size="sm"><Icon name="check_circle" size={12} /> Active</Badge>
            ) : (
              <Badge variant="default" size="sm">Inactive</Badge>
            )}
          </div>

          {hasGithub ? (
            <div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Repos', value: streakData?.breakdown?.portfolios || '0', icon: 'folder' },
                  { label: 'Quality', value: `${overallScore ? Math.round(overallScore) : '--'}%`, icon: 'grade' },
                  { label: 'Score', value: overallScore ? Math.round(overallScore) : '--', icon: 'analytics' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.08)' }}>
                    <Icon name={s.icon} size={14} className="text-success mx-auto mb-1" />
                    <p className="text-xs font-bold text-white">{s.value}</p>
                    <p className="text-[9px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portfolio')} className="w-full">
                <Icon name="open_in_new" size={14} /> View Full Analysis
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted mb-3">Connect your GitHub to get AI-powered portfolio analysis, code quality scores, and personalized improvement tips.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/profile')} className="w-full">
                <Icon name="link" size={16} /> Connect GitHub
              </Button>
            </div>
          )}
        </div>

        {/* LinkedIn Analysis Card */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(15,23,42,0.5))', border: `1px solid ${hasLinkedin ? 'rgba(10,102,194,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: hasLinkedin ? 'rgba(10,102,194,0.12)' : 'rgba(255,255,255,0.05)' }}>
              <Icon name="person" size={22} style={hasLinkedin ? { color: '#0A66C2' } : undefined} className={hasLinkedin ? '' : 'text-muted'} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">LinkedIn Analysis</h3>
              <p className="text-[11px] text-muted">{hasLinkedin ? 'Profile connected' : 'Not connected'}</p>
            </div>
            {hasLinkedin ? (
              <Badge variant="success" size="sm"><Icon name="check_circle" size={12} /> Active</Badge>
            ) : (
              <Badge variant="default" size="sm">Inactive</Badge>
            )}
          </div>

          {hasLinkedin ? (
            <div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Profile', value: 'Linked', icon: 'person_check' },
                  { label: 'Optimize', value: 'Ready', icon: 'auto_fix_high' },
                  { label: 'Keywords', value: 'Scan', icon: 'search' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: 'rgba(10,102,194,0.05)', border: '1px solid rgba(10,102,194,0.08)' }}>
                    <Icon name={s.icon} size={14} style={{ color: '#0A66C2' }} className="mx-auto mb-1" />
                    <p className="text-xs font-bold text-white">{s.value}</p>
                    <p className="text-[9px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/career-dna')} className="w-full">
                <Icon name="open_in_new" size={14} /> View Career Insights
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted mb-3">Connect your LinkedIn to get profile optimization, ATS keyword analysis, and career networking insights.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/profile')} className="w-full">
                <Icon name="person_add" size={16} /> Connect LinkedIn
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column */}
        <div className="flex-1 space-y-5">
          {/* Top Match Card — FIX HIGH-10: Show empty state when no real career match data */}
          <motion.div variants={item}>
            <Card tilt glass className="relative">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-[0.05] pointer-events-none" style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} />
              {hasCareerMatch ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="accent" size="sm" dot>TOP CAREER MATCH</Badge>
                    <Badge variant="default" size="sm">Updated today</Badge>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-extrabold text-white mb-3 tracking-tight">{matchTitle}</h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {matchSalary && <div className="flex items-center gap-1.5"><Icon name="payments" size={15} className="text-muted" /><span className="text-muted">Salary</span><span className="text-white font-semibold">{matchSalary}</span></div>}
                        <div className="flex items-center gap-1.5"><Icon name="trending_up" size={15} className="text-success" /><span className="text-muted">Growth</span><span className="text-success font-semibold">High</span></div>
                        <div className="flex items-center gap-1.5"><Icon name="schedule" size={15} className="text-muted" /><span className="text-muted">Timeline</span><span className="text-white font-semibold">6 Months</span></div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Badge variant="gradient" size="sm" dot>NSQF Paired</Badge>
                        <Badge variant="success" size="sm" dot>High Demand</Badge>
                        <Badge variant="violet" size="sm" dot>AI Verified</Badge>
                      </div>
                    </div>
                    {matchScore != null && (
                      <div className="relative flex-shrink-0 ml-4">
                        <svg className="w-24 h-24" viewBox="0 0 96 96">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
                          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(13,162,231,0.08)" strokeWidth="7" />
                          <motion.circle cx="48" cy="48" r="40" fill="none" strokeWidth="7" stroke="url(#scoreGradient)" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`} initial={{ strokeDashoffset: 2 * Math.PI * 40 }} animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - matchScore / 100) }} transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }} transform="rotate(-90 48 48)" style={{ filter: 'drop-shadow(0 0 6px rgba(13,162,231,0.4))' }} />
                          <defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0da2e7" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient></defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-extrabold text-white">{matchScore}%</span>
                          <span className="text-[9px] text-muted font-medium uppercase tracking-wider">Match</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Icon name="psychology" size={36} className="text-muted mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">No Career Match Yet</h3>
                  <p className="text-xs text-muted mb-4 max-w-xs">Take the AI career assessment to discover your top career matches with salary insights and growth data.</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/assessment')}>
                    <Icon name="psychology" size={16} /> Take Assessment
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.button key={action.label} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-white/[0.05] relative overflow-hidden group" style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.4), rgba(15,23,42,0.3))' }} whileHover={{ y: -4, borderColor: `${action.color}30`, boxShadow: `0 12px 32px rgba(0,0,0,0.2), 0 0 20px ${action.color}10` }} whileTap={{ scale: 0.96 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06 }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: action.bgColor, border: `1px solid ${action.color}20` }}>
                  <Icon name={action.icon} size={22} style={{ color: action.color }} />
                </div>
                <span className="text-xs text-secondary group-hover:text-white transition-colors font-semibold">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Learning Roadmap Preview */}
          <motion.div variants={item}>
            <Card glass>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10"><Icon name="conversion_path" size={16} className="text-accent" /></div>
                  <h3 className="text-[15px] font-bold text-white">Learning Roadmap</h3>
                </div>
                <button onClick={() => navigate('/roadmap')} className="text-xs text-accent hover:text-accent-light font-semibold flex items-center gap-1 transition-colors">Full Map <Icon name="arrow_forward" size={14} /></button>
              </div>
              <div className="flex items-start gap-2">
                {roadmap?.phases?.length > 0 ? (roadmap.phases.slice(0, 4)).map((phase: any, i: number) => {
                  const states = ['completed', 'active', 'locked', 'locked'];
                  const state = states[i];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center relative">
                      {i < 3 && (<div className="absolute top-6 left-[60%] right-[-40%] h-[2px]"><div className="h-full rounded-full" style={{ background: state === 'completed' ? 'linear-gradient(90deg, #10B981, #0da2e7)' : 'rgba(255,255,255,0.06)' }} /></div>)}
                      <motion.div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative z-[1] ${state === 'locked' ? 'border border-white/10' : ''}`} style={state === 'completed' ? { background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 16px rgba(16,185,129,0.25)' } : state === 'active' ? { background: 'linear-gradient(135deg, #0da2e7, #22D3EE)', boxShadow: '0 0 16px rgba(13,162,231,0.3)' } : { background: 'rgba(30,41,59,0.5)' }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 200 }}>
                        <Icon name={state === 'completed' ? 'check' : state === 'active' ? 'play_arrow' : 'lock'} size={20} className={state === 'locked' ? 'text-muted' : 'text-white'} />
                        {state === 'active' && (<motion.div className="absolute inset-0 rounded-2xl" style={{ border: '2px solid rgba(13,162,231,0.4)' }} animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />)}
                      </motion.div>
                      <span className="text-[11px] text-muted text-center leading-tight mt-2.5">{phase.title || `Phase ${i + 1}`}</span>
                    </div>
                  );
                }) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <Icon name="conversion_path" size={32} className="text-muted mb-2" />
                    <p className="text-xs text-muted">Get a career match first to generate your learning roadmap.</p>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/roadmap')} className="mt-2">
                      <Icon name="add" size={14} /> Generate Roadmap
                    </Button>
                  </div>
                )}
              </div>
              {/* FIX HIGH-9: Compute roadmap progress from actual phase data instead of hardcoded 25% */}
              {(() => {
                const totalPhases = roadmap?.phases?.length || 0;
                const completedPhases = totalPhases > 0
                  ? roadmap.phases.filter((p: any) => p.status === 'completed' || p.completed).length
                  : 0;
                const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
                return (
                  <div className="mt-5 pt-4 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-secondary font-medium">Overall Progress</span>
                      <span className="text-xs font-bold text-accent">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} color="gradient" size="sm" />
                  </div>
                );
              })()}
            </Card>
          </motion.div>

          {/* Bottom Row: Salary Trend + Emerging Skill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <motion.div variants={item}>
              <Card glass>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}><Icon name="show_chart" size={16} className="text-success" /></div>
                    <h3 className="text-sm font-bold text-white">Salary Trend</h3>
                  </div>
                  <Badge variant="success" size="sm">+15%</Badge>
                </div>
                <div className="flex items-end gap-1.5 h-24">
                  {[35, 50, 60, 45, 70, 80, 65, 90].map((h, i) => (
                    <motion.div key={i} className="flex-1 rounded-t-md relative overflow-hidden" style={{ background: i === 7 ? 'linear-gradient(180deg, #0da2e7, rgba(13,162,231,0.4))' : 'linear-gradient(180deg, rgba(13,162,231,0.3), rgba(13,162,231,0.08))' }} initial={{ height: 0, opacity: 0 }} animate={{ height: `${h}%`, opacity: 1 }} transition={{ delay: 0.5 + i * 0.05, duration: 0.5, ease: 'easeOut' }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2"><span className="text-[10px] text-muted">Jan</span><span className="text-[10px] text-muted">Aug</span></div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card glass>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}><Icon name="auto_awesome" size={16} className="text-warning" /></div>
                  <h3 className="text-sm font-bold text-white">Trending Skill</h3>
                </div>
                <p className="text-lg font-extrabold text-white mb-1 tracking-tight">Prompt Engineering</p>
                <p className="text-xs text-muted mb-4">In 67% of new job posts this month</p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="warning" size="sm" dot>Hot</Badge>
                  <Badge variant="accent" size="sm">+340% YoY</Badge>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/roadmap')}><Icon name="add" size={16} /> Add to Roadmap</Button>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 space-y-5">
          {/* Streak & XP Widget */}
          <motion.div variants={item}>
            <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.04), rgba(15,23,42,0.8))', border: '1px solid rgba(245,158,11,0.1)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ scale: streak > 0 ? [1, 1.2, 1] : 1 }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Icon name="local_fire_department" size={22} style={{ color: streak > 0 ? '#F59E0B' : '#64748B' }} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold text-white">{streak}-day Streak</p>
                    <p className="text-[10px] text-muted">Keep logging in daily!</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-white">{xp}</p>
                  <p className="text-[10px] text-muted">Total XP</p>
                </div>
              </div>

              {/* XP Breakdown */}
              {streakData?.breakdown && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Assessments', value: streakData.breakdown.assessments, icon: 'psychology', color: '#0da2e7' },
                    { label: 'Interviews', value: streakData.breakdown.interviews, icon: 'mic', color: '#8B5CF6' },
                    { label: 'Badges', value: streakData.breakdown.badges, icon: 'emoji_events', color: '#F59E0B' },
                  ].map(b => (
                    <div key={b.label} className="rounded-lg p-2 text-center" style={{ background: `${b.color}08`, border: `1px solid ${b.color}12` }}>
                      <Icon name={b.icon} size={14} style={{ color: b.color }} className="mx-auto mb-0.5" />
                      <p className="text-xs font-bold text-white">{b.value}</p>
                      <p className="text-[8px] text-muted">{b.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted">Level {xpLevel} - {xpLevelLabel}</span>
                <span className="text-[10px] font-bold text-warning">{xpInLevel}/{xpNeeded} XP</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }} initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} />
              </div>
            </div>
          </motion.div>

          {/* Micro-Coach */}
          <motion.div variants={item}>
            <Card glass>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}><Icon name="fitness_center" size={16} style={{ color: '#8B5CF6' }} /></div>
                  <h3 className="text-[15px] font-bold text-white">Micro-Coach</h3>
                </div>
                <Badge variant="violet" size="sm">{microTasks.length > 0 ? `${microTasks.length} tasks` : 'No tasks'}</Badge>
              </div>
              {microTasks.length > 0 ? (
              <div className="space-y-2.5">
                {microTasks.map((task: any, i: number) => (
                  <motion.div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04] cursor-pointer group transition-all duration-200" style={{ background: 'rgba(15,23,42,0.4)' }} whileHover={{ borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.03)' }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
                    <div className="w-5 h-5 rounded-full border-2 border-white/15 group-hover:border-[#8B5CF6] flex-shrink-0 mt-0.5 transition-colors flex items-center justify-center">
                      <div className="w-0 h-0 group-hover:w-2 group-hover:h-2 rounded-full bg-[#8B5CF6] transition-all duration-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{task.title}</p>
                      {task.skill && (<p className="text-[11px] text-muted mt-0.5 flex items-center gap-1"><Icon name="bolt" size={12} className="text-warning" />{task.skill}</p>)}
                    </div>
                    <Icon name="chevron_right" size={16} className="text-muted group-hover:text-white flex-shrink-0 transition-colors mt-0.5" />
                  </motion.div>
                ))}
              </div>
              ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Icon name="task_alt" size={32} className="text-muted mb-2" />
                <p className="text-xs text-muted">Complete your assessment to get personalized micro-tasks.</p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/micro-coach')} className="mt-2">
                  <Icon name="add" size={14} /> Generate Tasks
                </Button>
              </div>
              )}
              <button onClick={() => navigate('/micro-coach')} className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold text-[#8B5CF6] flex items-center justify-center gap-1 transition-all duration-200 hover:bg-[#8B5CF6]/5" style={{ border: '1px solid rgba(139,92,246,0.15)' }}>View All Tasks <Icon name="arrow_forward" size={14} /></button>
            </Card>
          </motion.div>

          {/* Badges */}
          {badges.length > 0 && (
            <motion.div variants={item}>
              <Card glass>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}><Icon name="emoji_events" size={16} className="text-warning" /></div>
                    <h3 className="text-[15px] font-bold text-white">Badges ({badges.length})</h3>
                  </div>
                  <Badge variant="warning" size="sm">{level}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {badges.slice(0, 8).map((b: any) => (
                    <motion.div key={b.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: `${RARITY_COLORS[b.rarity] || '#94A3B8'}10`, border: `1px solid ${RARITY_COLORS[b.rarity] || '#94A3B8'}25` }} whileHover={{ scale: 1.05 }} title={b.description}>
                      <Icon name={b.icon} size={14} style={{ color: RARITY_COLORS[b.rarity] || '#94A3B8' }} />
                      <span className="text-[11px] font-medium text-white">{b.name}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Skills Snapshot */}
          <motion.div variants={item}>
            <Card glass>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10"><Icon name="radar" size={16} className="text-accent" /></div>
                  <h3 className="text-[15px] font-bold text-white">Skill Radar</h3>
                </div>
                {overallScore > 0 && <Badge variant="accent" size="sm">Score: {Math.round(overallScore)}</Badge>}
              </div>
              <div className="space-y-3">
                {(() => {
                  const skillEntries = Object.keys(skills).length > 0
                    ? Object.entries(skills).map(([name, val]) => ({ name: name.replace(/([A-Z])/g, ' $1').trim(), score: Math.min(100, (val as number) * 20) }))
                    : [];
                  if (skillEntries.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Icon name="radar" size={32} className="text-muted mb-2" />
                        <p className="text-xs text-muted">Complete your assessment to see skill ratings.</p>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')} className="mt-2">
                          <Icon name="psychology" size={14} /> Take Assessment
                        </Button>
                      </div>
                    );
                  }
                  return skillEntries.slice(0, 6).map((skill: any, i: number) => {
                    const score = skill.score || 0;
                    const barColor = score >= 75 ? 'success' : score >= 50 ? 'accent' : 'warning';
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-secondary capitalize">{skill.name}</span>
                          <span className="text-[11px] font-bold text-white">{Math.round(score)}%</span>
                        </div>
                        <ProgressBar value={score} color={barColor} size="xs" />
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </Card>
          </motion.div>

          {/* AI Insight Card */}
          <motion.div variants={item}>
            <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.08), rgba(139,92,246,0.05))', border: '1px solid rgba(13,162,231,0.12)' }}>
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.06] pointer-events-none" style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} />
              <div className="relative z-[1]">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="auto_awesome" size={18} className="text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-sm text-secondary leading-relaxed">
                  {analysis?.recommendations?.[0] || 'Based on your profile, focusing on DSA practice and system design will maximize your placement readiness.'}
                </p>
                <button onClick={() => navigate('/chat')} className="mt-3 text-xs font-semibold text-accent hover:text-accent-light flex items-center gap-1 transition-colors">Discuss with AI Mentor <Icon name="arrow_forward" size={14} /></button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
