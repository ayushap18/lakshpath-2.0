import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import Icon from '../components/ui/Icon';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSuccess = (data: any) => {
    const { token, user, isNewUser } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userName', user.name || '');
    localStorage.setItem('userEmail', user.email || '');
    if (user.avatarUrl) localStorage.setItem('userAvatar', user.avatarUrl);

    // Set onboarding flags from auth response
    if (user.profileSetupCompleted) {
      localStorage.setItem('profileSetupCompleted', 'true');
    }
    if (user.hasAssessment) {
      localStorage.setItem('assessmentCompleted', 'true');
    }

    // New users or users who haven't set up profile → profile setup
    if (isNewUser || user.profileSetupCompleted === false) {
      navigate('/profile-setup', { replace: true });
    } else if (!user.hasAssessment) {
      navigate('/quiz-intro', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');
      const res = await authAPI.googleLogin(credentialResponse.credential);
      handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setError('');
      const res = await authAPI.demoLogin();
      handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setLoading(true);
      setError('');
      const res = await authAPI.login(email, password);
      handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: {
      opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 160, damping: 20 },
    },
  };

  const FEATURES = [
    { icon: 'psychology', label: 'AI Career Assessment', color: '#0da2e7' },
    { icon: 'conversion_path', label: 'Personalized Roadmap', color: '#8B5CF6' },
    { icon: 'record_voice_over', label: 'Interview Practice', color: '#10B981' },
    { icon: 'query_stats', label: 'Market Intelligence', color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex">
      {/* ─── Left Brand Panel ─── */}
      <motion.div
        className="hidden lg:flex w-[580px] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(200deg, #0B1628 0%, #0d2847 40%, rgba(13,162,231,0.08) 100%)',
        }}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      >
        {/* Aurora gradient orbs */}
        <motion.div
          className="absolute top-16 right-8 w-72 h-72 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }}
          animate={{ y: [0, -20, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-28 left-6 w-48 h-48 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }}
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-login" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-login)" />
        </svg>

        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 relative z-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0da2e7, #22D3EE)',
              boxShadow: '0 0 20px rgba(13,162,231,0.3)',
            }}
          >
            <Icon name="conversion_path" size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">LakshPath</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="space-y-5 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 80, damping: 20 }}
        >
          <h1 className="text-[38px] font-extrabold leading-[1.15]">
            <span className="text-white">Your AI-Powered</span>
            <br />
            <span className="gradient-text-multi">Career Companion</span>
          </h1>
          <p className="text-[15px] text-[#94A3B8] leading-relaxed max-w-[400px]">
            Join 50,000+ students building their future with personalized career guidance.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 120 }}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: `${f.color}08`,
                  border: `1px solid ${f.color}20`,
                }}
              >
                <Icon name={f.icon} size={16} className="flex-shrink-0" style={{ color: f.color }} />
                <span className="text-xs font-medium text-[#94A3B8]">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          className="relative z-10 rounded-xl p-4"
          style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,0.3), rgba(15,23,42,0.2))',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Icon key={i} name="star" size={14} className="text-[#F59E0B]" filled />
            ))}
          </div>
          <p className="text-sm text-[#94A3B8] italic leading-relaxed">
            "LakshPath changed how I think about my career. The AI assessment was scarily accurate!"
          </p>
          <p className="text-xs text-[#64748B] mt-2">-- Priya S., IIT Delhi</p>
        </motion.div>
      </motion.div>

      {/* ─── Right Login Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient-bg opacity-40 pointer-events-none" />

        <motion.div
          className="w-full max-w-[400px] relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-[26px] font-bold text-white">Welcome back</h1>
            <p className="text-[14px] text-[#94A3B8] mt-1.5">Sign in to continue your career journey</p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-3 mb-5 flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
              }}
            >
              <Icon name="error" size={16} className="text-error flex-shrink-0" />
              <span className="text-sm text-error">{error}</span>
            </motion.div>
          )}

          {/* ─── Demo Mode CTA (Prominent!) ─── */}
          <motion.div variants={itemVariants} className="mb-5">
            <motion.button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2.5 relative overflow-hidden disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgba(13,162,231,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(13,162,231,0.25)',
                boxShadow: '0 0 24px rgba(13,162,231,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
              whileHover={{
                y: -1,
                boxShadow: '0 0 36px rgba(13,162,231,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                borderColor: 'rgba(13,162,231,0.4)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(13,162,231,0.06) 50%, transparent 60%)',
                backgroundSize: '250% 100%',
                animation: 'shimmer 4s ease-in-out infinite',
              }} />

              {demoLoading ? (
                <motion.span
                  className="inline-block w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <Icon name="play_circle" size={20} className="text-accent" />
                  <span className="relative z-[1]">Try Demo Mode</span>
                  <span className="text-[11px] font-medium text-accent/70 ml-1">-- No signup needed</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1E293B] to-transparent" />
            <span className="text-[12px] text-[#64748B]">or sign in with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1E293B] to-transparent" />
          </motion.div>

          {/* Google Sign In */}
          <motion.div variants={itemVariants} className="mb-4">
            <div
              className="rounded-xl p-0.5 flex justify-center [&>div]:!w-full"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Google login failed')}
                theme="filled_black"
                size="large"
                width="380"
                text="continue_with"
              />
            </div>
          </motion.div>

          {/* Email toggle */}
          <motion.div variants={itemVariants}>
            <button
              type="button"
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="w-full py-3 rounded-xl text-sm font-medium text-secondary hover:text-white flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <Icon name="mail" size={18} />
              Continue with Email
              <Icon name={showEmailForm ? 'expand_less' : 'expand_more'} size={16} />
            </button>
          </motion.div>

          {/* Expanded Email Form */}
          {showEmailForm && (
            <motion.form
              onSubmit={handleEmailLogin}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-[#94A3B8] block mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm text-[#94A3B8]">Password</label>
                    <button type="button" className="text-xs text-accent hover:text-accent-light transition-colors">
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field-input"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm disabled:opacity-50 relative overflow-hidden"
                  whileHover={{ y: -1, boxShadow: '0 8px 28px rgba(13,162,231,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{ boxShadow: '0 4px 16px rgba(13,162,231,0.25)' }}
                >
                  {loading ? (
                    <motion.span
                      className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : 'Sign In'}
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Sign Up Link */}
          <motion.p variants={itemVariants} className="text-center text-sm text-[#64748B] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-light font-semibold transition-colors">
              Sign up free
            </Link>
          </motion.p>

          {/* Trust indicators */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="shield" size={14} className="text-success" />
              Secure
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="lock" size={14} className="text-accent" />
              Encrypted
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="verified" size={14} className="text-[#8B5CF6]" />
              Trusted by 50K+
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
