import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { userAPI } from '../../services/api';

const PAGE_META: Record<string, { title: string; subtitle?: string; icon: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your career overview', icon: 'space_dashboard' },
  chat: { title: 'AI Mentor', subtitle: 'Chat with your career guide', icon: 'neurology' },
  roadmap: { title: 'Learning Roadmap', subtitle: 'Your personalized path', icon: 'conversion_path' },
  learn: { title: 'Learning Roadmap', subtitle: 'Your personalized path', icon: 'conversion_path' },
  interview: { title: 'Interview Lab', subtitle: 'Practice & improve', icon: 'record_voice_over' },
  portfolio: { title: 'Portfolio', subtitle: 'Track your projects', icon: 'work_history' },
  market: { title: 'Market Intel', subtitle: 'Real-time insights', icon: 'query_stats' },
  'micro-coach': { title: 'Micro-Coach', subtitle: 'Daily skill tasks', icon: 'fitness_center' },
  nsqf: { title: 'NSQF Pathways', subtitle: 'Vocational routes', icon: 'account_tree' },
  profile: { title: 'Profile', subtitle: 'Your settings', icon: 'person' },
};

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Student';
  const userEmail = localStorage.getItem('userEmail') || '';

  const path = location.pathname.slice(1);
  const meta = PAGE_META[path] || { title: 'Dashboard', icon: 'space_dashboard' };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [streakData, setStreakData] = useState<any>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    userAPI.getNotifications().then(res => setNotifications(res.data.notifications || [])).catch(() => {});
    userAPI.getStreak().then(res => setStreakData(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const formatTime = (time: string) => {
    const diff = Date.now() - new Date(time).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-30"
      style={{
        background: 'rgba(10,15,28,0.6)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Left: Page title with icon */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1), rgba(0,102,255,0.05))', border: '1px solid rgba(0,102,255,0.1)' }}>
          <Icon name={meta.icon} size={18} className="text-accent" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-white leading-tight">{meta.title}</h1>
          {meta.subtitle && <p className="text-[11px] text-muted leading-tight">{meta.subtitle}</p>}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 w-56 transition-all duration-200 focus-within:w-72 focus-within:border-accent/30"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Icon name="search" size={16} className="text-muted flex-shrink-0" />
          <input type="text" placeholder="Search anything..." className="bg-transparent text-sm text-white placeholder-muted outline-none flex-1 w-full" />
          <kbd className="hidden lg:inline-flex text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/5 font-mono">/</kbd>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-secondary hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <Icon name="notifications" size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full" style={{ background: 'linear-gradient(135deg, #0066FF, #22D3EE)', boxShadow: '0 0 6px rgba(0,102,255,0.5)' }}>
                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(0,102,255,0.4)' }} />
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-xl z-50"
                style={{ background: 'linear-gradient(135deg, #111827, #0F172A)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
              >
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <span className="text-[10px] font-medium text-accent px-2 py-0.5 rounded-full bg-accent/10">{notifications.length}</span>
                  </div>
                </div>
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon name="notifications_none" size={32} className="text-muted mx-auto mb-2" />
                      <p className="text-xs text-muted">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <motion.button
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (notif.type === 'action' && notif.id.includes('github')) navigate('/profile');
                          else if (notif.type === 'action' && notif.id.includes('linkedin')) navigate('/profile');
                          else if (notif.type === 'action' && notif.id.includes('profile')) navigate('/profile-setup');
                          else if (notif.type === 'interview') navigate('/interview');
                          else if (notif.type === 'portfolio') navigate('/portfolio');
                          else if (notif.type === 'badge') navigate('/profile');
                        }}
                        className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
                        whileHover={{ x: 2 }}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${notif.color}15`, border: `1px solid ${notif.color}25` }}>
                          <Icon name={notif.icon} size={16} style={{ color: notif.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-muted/60 mt-1">{formatTime(notif.time)}</p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 py-1.5 px-2 rounded-xl transition-colors hover:bg-white/[0.03]"
          >
            <Avatar name={userName} size="sm" />
            <span className="hidden lg:block text-sm font-medium text-secondary">{userName}</span>
            <Icon name="expand_more" size={16} className="text-muted hidden lg:block" />
          </motion.button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-64 rounded-xl z-50 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #111827, #0F172A)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
              >
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Avatar name={userName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{userName}</p>
                      <p className="text-[11px] text-muted truncate">{userEmail}</p>
                    </div>
                  </div>
                  {streakData && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Icon name="local_fire_department" size={12} style={{ color: '#F59E0B' }} />
                        <span className="text-[10px] font-bold text-white">{streakData.streak}d</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'rgba(124,58,237,0.1)' }}>
                        <Icon name="stars" size={12} style={{ color: '#7C3AED' }} />
                        <span className="text-[10px] font-bold text-white">Lv.{streakData.level}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: 'rgba(0,102,255,0.1)' }}>
                        <Icon name="bolt" size={12} style={{ color: '#0066FF' }} />
                        <span className="text-[10px] font-bold text-white">{streakData.xp} XP</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-2">
                  {[
                    { icon: 'person', label: 'My Profile', path: '/profile', color: '#0066FF' },
                    { icon: 'settings', label: 'Settings', path: '/profile', color: '#7C3AED' },
                    { icon: 'code', label: 'GitHub Account', path: '/profile', color: '#10B981' },
                    { icon: 'link', label: 'LinkedIn Account', path: '/profile', color: '#0A66C2' },
                    { icon: 'workspace_premium', label: 'Badges & XP', path: '/profile', color: '#F59E0B' },
                  ].map((item) => (
                    <motion.button
                      key={item.label}
                      onClick={() => { setShowProfileMenu(false); navigate(item.path); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                      whileHover={{ x: 2 }}
                    >
                      <Icon name={item.icon} size={16} style={{ color: item.color }} />
                      <span className="text-sm text-secondary">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="p-2 border-t border-white/5">
                  <motion.button
                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left"
                    whileHover={{ x: 2 }}
                  >
                    <Icon name="logout" size={16} className="text-error" />
                    <span className="text-sm text-error">Sign Out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
