import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { userAPI } from '../../services/api';

/* ────────────────────── Navigation Structure ────────────────────── */

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard', path: '/dashboard' },
      { id: 'chat', label: 'AI Mentor', icon: 'neurology', path: '/chat', badge: 'AI' },
      { id: 'roadmap', label: 'Roadmap', icon: 'conversion_path', path: '/roadmap' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { id: 'interview', label: 'Interview Lab', icon: 'record_voice_over', path: '/interview' },
      { id: 'micro-coach', label: 'Micro-Coach', icon: 'fitness_center', path: '/micro-coach' },
      { id: 'placement-prep', label: 'Placement Prep', icon: 'school', path: '/placement-prep' },
    ],
  },
  {
    label: 'Build',
    items: [
      { id: 'career-dna', label: 'Career DNA', icon: 'fingerprint', path: '/career-dna', badge: 'New' },
      { id: 'resume-builder', label: 'Resume Builder', icon: 'description', path: '/resume-builder' },
      { id: 'skill-simulator', label: 'Skill Simulator', icon: 'psychology', path: '/skill-simulator' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { id: 'portfolio', label: 'Portfolio Hub', icon: 'work_history', path: '/portfolio' },
      { id: 'market', label: 'Market Intel', icon: 'query_stats', path: '/market' },
      { id: 'nsqf', label: 'NSQF Paths', icon: 'account_tree', path: '/nsqf' },
      { id: 'ai-live', label: 'AI Live 1:1', icon: 'videocam', path: '/ai-live', badge: 'New' },
    ],
  },
];

/* ────────────────────── Sidebar Component ────────────────────── */

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [streakData, setStreakData] = useState<any>(null);

  const userName = localStorage.getItem('userName') || 'Student';
  const userEmail = localStorage.getItem('userEmail') || '';

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  // Fetch streak data
  useEffect(() => {
    userAPI.getStreak().then(res => setStreakData(res.data)).catch(() => {});
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
    // Dispatch event for AppShell to listen
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: next } }));
  };

  // Dispatch on mount too
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed } }));
  }, []);

  const sidebarWidth = collapsed ? 72 : 248;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen flex flex-col fixed left-0 top-0 z-40 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,28,0.97) 0%, rgba(15,23,42,0.95) 100%)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* ─── Logo & Collapse Toggle ─── */}
      <div className="px-3 py-4 flex-shrink-0">
        <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between'}`}>
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0da2e7, #22D3EE)',
                boxShadow: '0 0 20px rgba(13,162,231,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Icon name="conversion_path" size={18} className="text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="text-lg font-bold text-white tracking-tight whitespace-nowrap"
                >
                  LakshPath
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Toggle button — always visible */}
          <motion.button
            onClick={toggleCollapse}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-white transition-colors flex-shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={collapsed ? 'left_panel_open' : 'left_panel_close'} size={18} />
          </motion.button>
        </div>
      </div>

      {/* ─── Streak / Progress Widget ─── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mb-3 overflow-hidden flex-shrink-0"
          >
            <div
              className="rounded-xl p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(13,162,231,0.08), rgba(139,92,246,0.05))',
                border: '1px solid rgba(13,162,231,0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon name="local_fire_department" size={16} className="text-orange-400" />
                  <span className="text-xs font-semibold text-white">{streakData?.streak || 0}-day streak</span>
                </div>
                <span className="text-[10px] font-medium text-accent px-1.5 py-0.5 rounded-full bg-accent/10">Level {streakData?.level || 1}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #0da2e7, #8B5CF6)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${streakData?.xpProgress || 0}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-muted mt-1.5">{streakData?.xpInLevel || 0} / {streakData?.xpNeeded || 100} XP to Level {(streakData?.level || 1) + 1}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Navigation Groups ─── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-4 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {/* Group Label */}
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold text-muted uppercase tracking-[1.5px] px-2 mb-1.5"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Divider for collapsed mode */}
            {collapsed && (
              <div className="mx-2 mb-2 h-px bg-white/5" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const isHovered = hoveredId === item.id;

                return (
                  <div key={item.id} className="relative">
                    <motion.button
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full flex items-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative overflow-hidden
                        ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
                        ${isActive
                          ? 'text-white'
                          : 'text-secondary hover:text-white'
                        }`}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, rgba(13,162,231,0.12), rgba(13,162,231,0.04))',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                      } : undefined}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-bar"
                          className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full"
                          style={{
                            background: 'linear-gradient(180deg, #0da2e7, #22D3EE)',
                            boxShadow: '0 0 8px rgba(13,162,231,0.5)',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${isActive ? 'bg-accent/15' : isHovered ? 'bg-white/5' : 'bg-transparent'}`}
                      >
                        <Icon
                          name={item.icon}
                          size={20}
                          className={`transition-colors duration-200 ${isActive ? 'text-accent' : ''}`}
                          filled={isActive}
                        />
                      </div>

                      {/* Label */}
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.12 }}
                            className="whitespace-nowrap flex-1 text-left"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Badge */}
                      {!collapsed && (item as any).badge && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-accent to-accent-light text-white flex-shrink-0"
                        >
                          {(item as any).badge}
                        </motion.span>
                      )}
                    </motion.button>

                    {/* Collapsed tooltip */}
                    <AnimatePresence>
                      {collapsed && isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -6, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -6, scale: 0.95 }}
                          transition={{ duration: 0.12 }}
                          className="fixed ml-[76px] -mt-9 z-[100] whitespace-nowrap"
                        >
                          <div
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                            style={{
                              background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            }}
                          >
                            {item.label}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Bottom Section: Quick Action + User ─── */}
      <div className="flex-shrink-0 border-t border-white/[0.04] px-2 py-3 space-y-2">
        {/* Profile button */}
        <motion.button
          onClick={() => navigate('/profile')}
          onMouseEnter={() => setHoveredId('profile')}
          onMouseLeave={() => setHoveredId(null)}
          className={`w-full flex items-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-150
            ${collapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2'}
            ${location.pathname === '/profile'
              ? 'text-white bg-accent/10'
              : 'text-secondary hover:text-white hover:bg-white/5'
            }`}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
            <Icon
              name="settings"
              size={20}
              className={location.pathname === '/profile' ? 'text-accent' : ''}
              filled={location.pathname === '/profile'}
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {/* Collapsed tooltip */}
          <AnimatePresence>
            {collapsed && hoveredId === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: -6, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.95 }}
                className="fixed ml-[76px] -mt-0 z-[100] whitespace-nowrap"
              >
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{
                    background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  Settings
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User Card */}
        <div
          className={`flex items-center gap-2.5 rounded-xl transition-all duration-200 cursor-pointer group
            ${collapsed ? 'px-0 py-2 justify-center' : 'px-3 py-2.5 hover:bg-white/[0.03]'}`}
          onClick={() => navigate('/profile')}
        >
          <div className="relative flex-shrink-0">
            <Avatar name={userName} size="sm" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-[#0A0F1C]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate leading-tight">{userName}</p>
                <p className="text-[11px] text-muted truncate leading-tight">{userEmail}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
                title="Sign out"
              >
                <Icon name="logout" size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
