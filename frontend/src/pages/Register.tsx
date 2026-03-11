import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import Icon from '../components/ui/Icon';
import { authAPI } from '../services/api';
import { useSubscription } from '../contexts/SubscriptionContext';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscribe } = useSubscription();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccess = async (data: any) => {
    const { token, user } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userName', user.name || '');
    localStorage.setItem('userEmail', user.email || '');
    if (user.avatarUrl) localStorage.setItem('userAvatar', user.avatarUrl);

    // Notify subscription context to re-fetch
    window.dispatchEvent(new Event('subscription-refresh'));

    // If ?plan=pro, open Razorpay checkout before navigating
    if (searchParams.get('plan') === 'pro') {
      try {
        await subscribe();
      } catch {
        // If payment cancelled or failed, continue to profile setup anyway
      }
    }

    navigate('/profile-setup', { replace: true });
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError('');
      const res = await authAPI.googleLogin(credentialResponse.credential);
      await handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.password) return;
    try {
      setLoading(true);
      setError('');
      const res = await authAPI.register(
        `${form.firstName} ${form.lastName}`.trim(),
        form.email,
        form.password,
      );
      await handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96, filter: 'blur(4px)' },
    visible: {
      opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 160, damping: 20 },
    },
  };

  const checks = [
    { text: 'Free AI career assessment', icon: 'psychology', color: '#0066FF' },
    { text: 'Personalized learning roadmap', icon: 'map', color: '#F59E0B' },
    { text: 'AI interview chat access', icon: 'mic', color: '#7C3AED' },
    { text: 'No credit card required', icon: 'verified', color: '#10B981' },
  ];

  const HIGHLIGHTS = [
    { value: '50K+', label: 'Students', gradient: 'from-[#0066FF] to-[#22D3EE]' },
    { value: '94%', label: 'Accuracy', gradient: 'from-[#7C3AED] to-[#A78BFA]' },
    { value: '500+', label: 'Careers', gradient: 'from-[#10B981] to-[#34D399]' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] flex">
      {/* ─── Left Brand Panel ─── */}
      <motion.div
        className="hidden lg:flex w-[640px] flex-col justify-between p-[60px_48px] relative overflow-hidden"
        style={{
          background: 'linear-gradient(200deg, #0B1628 0%, #0d2847 40%, rgba(0,102,255,0.10) 100%)',
        }}
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 50, damping: 18 }}
      >
        {/* Aurora gradient orbs */}
        <motion.div
          className="absolute top-20 right-12 w-72 h-72 rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #0066FF, transparent 70%)' }}
          animate={{ y: [0, -20, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-24 left-10 w-60 h-60 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }}
          animate={{ y: [0, 15, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-44 h-44 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #22D3EE, transparent 70%)' }}
          animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Morphing blob */}
        <div
          className="absolute top-1/3 right-1/3 w-56 h-56 opacity-[0.05] animate-morph"
          style={{ background: 'linear-gradient(135deg, #0066FF, #7C3AED, #22D3EE)', filter: 'blur(40px)' }}
        />

        {/* Grid pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-register" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-register)" />
        </svg>

        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#22D3EE] flex items-center justify-center"
            animate={{ boxShadow: ['0 0 0px rgba(0,102,255,0)', '0 0 20px rgba(0,102,255,0.4)', '0 0 0px rgba(0,102,255,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Icon name="conversion_path" size={18} className="text-white" />
          </motion.div>
          <span className="text-xl font-bold text-white">LakshPath</span>
        </motion.div>

        {/* Headline area */}
        <motion.div
          className="space-y-6 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 80, damping: 20 }}
        >
          <h1 className="text-4xl font-extrabold leading-[1.15]">
            <span className="text-white">Start Your Career</span>
            <br />
            <span className="gradient-text-multi">Transformation Today</span>
          </h1>
          <p className="text-base text-white/50 leading-relaxed max-w-[420px]">
            Create your free account and get instant access to AI career guidance trusted by 50,000+ students.
          </p>

          {/* Feature checks with icons */}
          <div className="space-y-3 pt-2">
            {checks.map((item, i) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 120, damping: 18 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${item.color}20, ${item.color}10)`,
                    border: `1px solid ${item.color}30`,
                    boxShadow: `0 2px 8px ${item.color}15`,
                  }}
                >
                  <span style={{ color: item.color }}><Icon name={item.icon} size={16} /></span>
                </div>
                <span className="text-sm text-white/50">{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Highlight stats */}
          <div className="flex gap-4 pt-4" style={{ perspective: '800px' }}>
            {HIGHLIGHTS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex-1 rounded-xl p-3 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(17,24,39,0.5), rgba(15,23,42,0.4))',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  transformStyle: 'preserve-3d',
                }}
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1 + i * 0.12, type: 'spring', stiffness: 120, damping: 18 }}
                whileHover={{
                  y: -4,
                  rotateX: -3,
                  boxShadow: '0 12px 30px rgba(0,102,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <div className="pointer-events-none absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <p className={`text-xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          className="relative z-10 rounded-xl p-4"
          style={{
            background: 'linear-gradient(145deg, rgba(17,24,39,0.3), rgba(15,23,42,0.2))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-sm text-white/50 italic leading-relaxed">
            "LakshPath's AI assessment was scarily accurate — it knew my strengths before I did."
          </p>
          <p className="text-xs text-white/40 mt-2">— Rahul V., BITS Pilani</p>
        </motion.div>
      </motion.div>

      {/* ─── Right Signup Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center px-10 lg:px-20 relative overflow-hidden">
        {/* Subtle mesh gradient bg */}
        <div className="absolute inset-0 mesh-gradient-bg opacity-50 pointer-events-none" />

        <motion.div
          className="w-full max-w-[400px] relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-7">
            <h1 className="text-[28px] font-bold text-white">Create your account</h1>
            <p className="text-[15px] text-white/50 mt-2">Get started in under 2 minutes</p>
          </motion.div>

          {searchParams.get('plan') === 'pro' && (
            <motion.div
              variants={itemVariants}
              className="rounded-xl p-3 mb-5 flex items-center gap-2"
              style={{
                background: 'linear-gradient(145deg, rgba(124,58,237,0.08), rgba(99,102,241,0.04))',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <Icon name="workspace_premium" size={18} style={{ color: '#7C3AED' }} />
              <span className="text-sm text-[#A78BFA]">Pro checkout will open after signup</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl p-3 mb-5 flex items-center gap-2"
              style={{
                background: 'linear-gradient(145deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <Icon name="error" size={18} className="text-error" />
              <span className="text-sm text-error">{error}</span>
            </motion.div>
          )}

          {/* Google Sign Up */}
          <motion.div variants={itemVariants} className="mb-4">
            <div
              className="rounded-xl p-0.5 flex justify-center [&>div]:!w-full"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Google signup failed')}
                theme="filled_black"
                size="large"
                width="400"
                text="signup_with"
              />
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1E293B] to-transparent" />
            <span className="text-[13px] text-white/40">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1E293B] to-transparent" />
          </motion.div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="space-y-4 mb-5">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-white/50 block mb-1.5">First name</label>
                  <input
                    placeholder="Priya"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="field-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-white/50 block mb-1.5">Last name</label>
                  <input
                    placeholder="Sharma"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="field-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/50 block mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="priya@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="field-input"
                />
              </div>
              <div>
                <label className="text-sm text-white/50 block mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="field-input"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-[15px] disabled:opacity-50 relative overflow-hidden"
                whileHover={{
                  y: -2,
                  boxShadow: '0 10px 36px rgba(0,102,255,0.4), 0 0 60px rgba(0,102,255,0.15)',
                }}
                whileTap={{ scale: 0.98, y: 1 }}
                style={{
                  boxShadow: '0 4px 18px rgba(0,102,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
                  backgroundSize: '250% 100%',
                  animation: 'shimmer 4s ease-in-out infinite',
                }} />
                <span className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                {loading ? (
                  <motion.span
                    className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : <span className="relative z-[1]">Create Account</span>}
              </motion.button>
            </motion.div>
          </form>

          {/* Terms */}
          <motion.p variants={itemVariants} className="text-center text-xs text-white/40 mt-4 leading-relaxed">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </motion.p>

          {/* Sign In Link */}
          <motion.p variants={itemVariants} className="text-center text-sm text-white/40 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light font-semibold transition-colors">
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
