import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Avatar from '../components/ui/Avatar';
import ProgressBar from '../components/ui/ProgressBar';
import { useProfile } from '../hooks/useProfile';
import { userAPI, profileAPI, authAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const BADGE_COLORS: Record<string, string> = {
  COMMON: '#94A3B8',
  RARE: '#0da2e7',
  EPIC: '#8B5CF6',
  LEGENDARY: '#F59E0B',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};

type TabId = 'overview' | 'settings';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, stats, loading, error } = useProfile();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    name: '', githubUsername: '', linkedinUrl: '', bio: '', phone: '',
    college: '', degree: '', branch: '', graduationYear: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Streak/XP state
  const [streakData, setStreakData] = useState<any>(null);

  // Data-driven badge catalog
  const [badgeCatalog, setBadgeCatalog] = useState<any[]>([]);

  const userName = profile?.profile?.name || localStorage.getItem('userName') || 'Student';
  const userEmail = profile?.profile?.email || localStorage.getItem('userEmail') || '';
  const joinDate = profile?.profile?.createdAt ? new Date(profile.profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '';

  // Load settings, streak, and badge catalog
  useEffect(() => {
    userAPI.getSettings().then(res => {
      const u = res.data.user;
      setSettings({
        name: u.name || '',
        githubUsername: u.githubUsername || '',
        linkedinUrl: u.linkedinUrl || '',
        bio: u.bio || '',
        phone: u.phone || '',
        college: u.college || '',
        degree: u.degree || '',
        branch: u.branch || '',
        graduationYear: u.graduationYear ? String(u.graduationYear) : '',
      });
    }).catch(() => {});

    userAPI.getStreak().then(res => setStreakData(res.data)).catch(() => {});

    profileAPI.getBadgeCatalog().then(res => setBadgeCatalog(res.data.badges || [])).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await userAPI.updateProfile({ name: newName });
      localStorage.setItem('userName', newName);
      setEditing(false);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      await userAPI.updateSettings(settings);
      if (settings.name) localStorage.setItem('userName', settings.name);
      setSettingsMsg('Settings saved successfully!');
      addToast('success', 'Settings saved', 'Your profile has been updated.');
      setTimeout(() => setSettingsMsg(''), 3000);
    } catch {
      setSettingsMsg('Failed to save settings');
      addToast('error', 'Save failed', 'Could not update your settings.');
    }
    setSettingsSaving(false);
  };

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.1), rgba(139,92,246,0.08))', border: '1px solid rgba(13,162,231,0.15)' }}
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="person" size={24} className="text-accent" />
        </motion.div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-accent/40" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    );
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const streak = streakData?.streak || 0;
  const activityData = streakData?.breakdown
    ? [streakData.breakdown.assessments * 20, streakData.breakdown.interviews * 15, streakData.breakdown.portfolios * 20, 40, 50, streakData.breakdown.badges * 10, streak * 10].map(v => Math.min(100, Math.max(10, v)))
    : weekDays.map(() => 10);
  const earnedCount = badgeCatalog.filter(a => a.earned).length;
  const totalBadges = badgeCatalog.length || 1;

  const xp = streakData?.xp || 0;
  const level = streakData?.level || 1;
  const levelLabel = streakData?.levelLabel || 'Beginner';
  const xpProgress = streakData?.xpProgress || 0;
  const xpNeeded = streakData?.xpNeeded || 100;
  const xpInLevel = streakData?.xpInLevel || 0;

  const inputClass = "w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#64748B] outline-none focus:border-[#0da2e7] transition-colors text-sm";

  return (
    <motion.div className="space-y-5 max-w-4xl" variants={containerVariants} initial="hidden" animate="visible">
      {/* Banner Header */}
      <motion.div variants={itemVariants}>
        <div className="rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.12), rgba(139,92,246,0.08), rgba(15,23,42,0.9))', border: '1px solid rgba(13,162,231,0.1)' }}>
          <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
          <motion.div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.06] pointer-events-none" style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />

          <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.15), rgba(139,92,246,0.1), rgba(34,211,238,0.08))' }}>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {[
                { label: 'Level', value: String(level), icon: 'stars', color: '#8B5CF6' },
                { label: 'XP', value: String(xp), icon: 'bolt', color: '#F59E0B' },
                { label: 'Streak', value: `${streak}d`, icon: 'local_fire_department', color: '#EF4444' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25`, backdropFilter: 'blur(8px)' }}>
                  <Icon name={stat.icon} size={13} style={{ color: stat.color }} />
                  <span className="text-[10px] text-muted">{stat.label}</span>
                  <span className="text-xs font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative px-6 pb-6 -mt-10">
            <div className="flex items-end gap-5">
              <motion.div className="relative flex-shrink-0" animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <div className="rounded-2xl p-[3px]" style={{ background: 'linear-gradient(135deg, #0da2e7, #8B5CF6, #22D3EE)', boxShadow: '0 8px 32px rgba(13,162,231,0.3)' }}>
                  <div className="rounded-[13px] bg-navy p-[2px]">
                    <Avatar name={userName} size="xl" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B981', border: '3px solid #0A0F1C', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
              </motion.div>

              <div className="flex-1 pb-1">
                {editing ? (
                  <div className="flex items-center gap-3">
                    <motion.input value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-inset border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#0da2e7]" placeholder="New name" autoFocus />
                    <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">{userName}</h1>
                    <motion.button onClick={() => { setNewName(userName); setEditing(true); }} className="text-muted hover:text-accent transition-colors" whileHover={{ scale: 1.15, rotate: 12 }} whileTap={{ scale: 0.9 }}>
                      <Icon name="edit" size={16} />
                    </motion.button>
                  </div>
                )}
                <p className="text-sm text-secondary mt-0.5">{userEmail}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="gradient" size="sm" dot>{levelLabel}</Badge>
                  {joinDate && <Badge variant="default" size="sm"><Icon name="calendar_today" size={11} className="text-muted" />Joined {joinDate}</Badge>}
                  <Badge variant="accent" size="sm"><Icon name="verified" size={11} />Verified</Badge>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="trending_up" size={14} className="text-accent" />
                  <span className="text-xs text-secondary font-medium">Experience Progress</span>
                </div>
                <span className="text-xs font-bold text-accent">{xpInLevel} / {xpNeeded} XP to Level {level + 1}</span>
              </div>
              <ProgressBar value={xpProgress} color="gradient" size="sm" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
        {([{ id: 'overview', label: 'Overview', icon: 'dashboard' }, { id: 'settings', label: 'Settings', icon: 'settings' }] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'text-white bg-white/[0.06]' : 'text-secondary hover:text-white'}`}>
            <Icon name={tab.icon} size={16} className={activeTab === tab.id ? 'text-accent' : ''} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
            {/* Stats Grid */}
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3" variants={itemVariants}>
              {[
                { label: 'Assessments', value: stats?.assessmentsCompleted || 0, icon: 'psychology' },
                { label: 'Interviews', value: streakData?.breakdown?.interviews || 0, icon: 'record_voice_over' },
                { label: 'Portfolios', value: streakData?.breakdown?.portfolios || 0, icon: 'work_history' },
                { label: 'Milestones', value: `${stats?.milestones?.completed || 0}/${stats?.milestones?.total || 0}`, icon: 'flag' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}>
                  <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
                </motion.div>
              ))}
            </motion.div>

            {/* Activity + Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <motion.div variants={itemVariants} className="lg:col-span-3">
                <Card glass>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10"><Icon name="show_chart" size={16} className="text-accent" /></div>
                      <h3 className="text-[15px] font-bold text-white">Learning Activity</h3>
                    </div>
                    <Badge variant="success" size="sm">This Week</Badge>
                  </div>
                  <div className="flex items-end gap-2 h-28">
                    {weekDays.map((day, i) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: `${activityData[i]}%`, opacity: 1 }} transition={{ delay: 0.5 + i * 0.06, duration: 0.5, ease: 'easeOut' }} className="w-full rounded-t-lg min-h-[4px]" style={{ background: i === new Date().getDay() - 1 ? 'linear-gradient(180deg, #0da2e7, rgba(13,162,231,0.4))' : 'linear-gradient(180deg, rgba(13,162,231,0.3), rgba(13,162,231,0.08))' }} />
                        <span className="text-[10px] text-muted">{day}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card glass>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}><Icon name="emoji_events" size={16} className="text-warning" /></div>
                    <h3 className="text-[15px] font-bold text-white">Achievements</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <svg className="w-16 h-16" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                        <motion.circle cx="32" cy="32" r="26" fill="none" strokeWidth="5" stroke="url(#achieveGrad)" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 26}`} initial={{ strokeDashoffset: 2 * Math.PI * 26 }} animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - earnedCount / totalBadges) }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }} transform="rotate(-90 32 32)" />
                        <defs><linearGradient id="achieveGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#EF4444" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-extrabold text-white">{earnedCount}</span>
                        <span className="text-[8px] text-muted font-medium uppercase tracking-wider">of {totalBadges}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Keep going!</p>
                      <p className="text-xs text-muted mt-0.5">Complete tasks to unlock badges.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {badgeCatalog.slice(0, 6).map((a, i) => {
                      const color = BADGE_COLORS[a.rarity] || '#94A3B8';
                      return (
                      <motion.div key={a.name} className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.earned ? '' : 'opacity-30'}`} style={{ background: a.earned ? `${color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${a.earned ? `${color}30` : 'rgba(255,255,255,0.05)'}` }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.06, type: 'spring', stiffness: 300 }} title={a.name}>
                        <Icon name={a.icon} size={16} style={{ color: a.earned ? color : undefined }} className={a.earned ? '' : 'text-muted'} filled={a.earned} />
                      </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* All Badges Grid */}
            <motion.div variants={itemVariants}>
              <Card glass>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}><Icon name="workspace_premium" size={16} style={{ color: '#8B5CF6' }} /></div>
                    <h3 className="text-[15px] font-bold text-white">All Badges</h3>
                  </div>
                  <span className="text-xs text-muted">{earnedCount} of {totalBadges} earned</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {badgeCatalog.map((a, i) => {
                    const color = BADGE_COLORS[a.rarity] || '#94A3B8';
                    return (
                    <motion.div key={a.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: a.earned ? 1 : 0.5, scale: 1 }} transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 260, damping: 20 }} className={`flex items-center gap-3 p-3.5 rounded-xl border ${a.earned ? 'border-white/[0.06]' : 'border-white/[0.03]'}`} style={{ background: a.earned ? `linear-gradient(135deg, ${color}08, transparent)` : 'rgba(15,23,42,0.3)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.earned ? `${color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${a.earned ? `${color}25` : 'rgba(255,255,255,0.05)'}` }}>
                        <Icon name={a.icon} size={20} style={a.earned ? { color } : undefined} className={a.earned ? '' : 'text-muted'} filled={a.earned} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{a.name}</p>
                        <p className="text-[11px] text-muted truncate">{a.description}</p>
                      </div>
                      {a.earned ? <Icon name="check_circle" size={16} style={{ color }} /> : <Icon name="lock" size={14} className="text-muted flex-shrink-0" />}
                    </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
            {/* Personal Info */}
            <Card glass>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/10"><Icon name="person" size={16} className="text-accent" /></div>
                <h3 className="text-[15px] font-bold text-white">Personal Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Full Name</label>
                    <input value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} placeholder="Your full name" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Phone</label>
                    <input value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} placeholder="+91 98765 43210" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Bio</label>
                  <textarea value={settings.bio} onChange={e => setSettings(s => ({ ...s, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={2} className={`${inputClass} resize-none`} />
                </div>
              </div>
            </Card>

            {/* Education */}
            <Card glass>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)' }}><Icon name="school" size={16} style={{ color: '#8B5CF6' }} /></div>
                <h3 className="text-[15px] font-bold text-white">Education</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">College / University</label>
                  <input value={settings.college} onChange={e => setSettings(s => ({ ...s, college: e.target.value }))} placeholder="IIT Delhi, VIT Vellore, etc." className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Degree</label>
                    <select value={settings.degree} onChange={e => setSettings(s => ({ ...s, degree: e.target.value }))} className={inputClass}>
                      <option value="">Select degree</option>
                      <option value="B.Tech">B.Tech / BE</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="M.Tech">M.Tech / ME</option>
                      <option value="BSc CS">BSc Computer Science</option>
                      <option value="MSc CS">MSc Computer Science</option>
                      <option value="BBA">BBA</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Branch</label>
                    <select value={settings.branch} onChange={e => setSettings(s => ({ ...s, branch: e.target.value }))} className={inputClass}>
                      <option value="">Select branch</option>
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="EEE">Electrical (EEE)</option>
                      <option value="ME">Mechanical</option>
                      <option value="AI/ML">AI / ML</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Graduation Year</label>
                    <select value={settings.graduationYear} onChange={e => setSettings(s => ({ ...s, graduationYear: e.target.value }))} className={inputClass}>
                      <option value="">Select year</option>
                      {[2024, 2025, 2026, 2027, 2028, 2029].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Connected Accounts */}
            <Card glass>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}><Icon name="link" size={16} className="text-success" /></div>
                <h3 className="text-[15px] font-bold text-white">Connected Accounts</h3>
              </div>

              <div className="space-y-4">
                {/* GitHub */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Icon name="code" size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">GitHub</p>
                      <p className="text-[11px] text-muted">{settings.githubUsername ? `Connected as @${settings.githubUsername}` : 'Not connected'}</p>
                    </div>
                    {settings.githubUsername ? (
                      <Badge variant="success" size="sm"><Icon name="check_circle" size={12} /> Connected</Badge>
                    ) : (
                      <Badge variant="warning" size="sm"><Icon name="warning" size={12} /> Not Connected</Badge>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">GitHub Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] text-sm">github.com/</span>
                      <input value={settings.githubUsername} onChange={e => setSettings(s => ({ ...s, githubUsername: e.target.value }))} placeholder="username" className={`${inputClass} pl-[108px]`} />
                    </div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(10,102,194,0.15)' }}>
                      <Icon name="person" size={20} style={{ color: '#0A66C2' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">LinkedIn</p>
                      <p className="text-[11px] text-muted">{settings.linkedinUrl ? 'Profile connected' : 'Not connected'}</p>
                    </div>
                    {settings.linkedinUrl ? (
                      <Badge variant="success" size="sm"><Icon name="check_circle" size={12} /> Connected</Badge>
                    ) : (
                      <Badge variant="warning" size="sm"><Icon name="warning" size={12} /> Not Connected</Badge>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">LinkedIn Profile URL</label>
                    <input value={settings.linkedinUrl} onChange={e => setSettings(s => ({ ...s, linkedinUrl: e.target.value }))} placeholder="https://linkedin.com/in/your-profile" className={inputClass} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Save & Danger Zone */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="primary" size="md" onClick={handleSettingsSave} loading={settingsSaving}>
                  <Icon name="save" size={18} /> Save Changes
                </Button>
                {settingsMsg && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm ${settingsMsg.includes('success') ? 'text-success' : 'text-error'}`}>
                    {settingsMsg}
                  </motion.span>
                )}
              </div>
              <motion.div whileHover={{ boxShadow: '0 0 24px rgba(239, 68, 68, 0.35)' }} className="rounded-xl">
                <Button variant="danger" onClick={handleLogout}>
                  <Icon name="logout" size={18} /> Logout
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <motion.p className="text-sm text-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
    </motion.div>
  );
};

export default Profile;
