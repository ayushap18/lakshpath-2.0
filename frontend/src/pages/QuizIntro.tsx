import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};

const HIGHLIGHTS = [
  { icon: 'quiz', title: '8 Smart Questions', desc: 'Focused on your tech skills, DSA, system design & career goals', color: '#0da2e7', bgColor: 'rgba(13,162,231,0.08)' },
  { icon: 'auto_awesome', title: 'AI-Powered Analysis', desc: 'Gemini AI maps your skills to the best tech career paths', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)' },
  { icon: 'person_search', title: 'Tech Role Matching', desc: 'Get matched to SDE, ML Engineer, DevOps & more based on your profile', color: '#10B981', bgColor: 'rgba(16,185,129,0.08)' },
  { icon: 'timer', title: '3 Minutes', desc: 'Quick and focused — designed for engineering students', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)' },
];

const STEPS = [
  { num: '01', label: 'Answer Questions', icon: 'edit_note' },
  { num: '02', label: 'AI Analyzes', icon: 'psychology' },
  { num: '03', label: 'Get Matched', icon: 'rocket_launch' },
];

const QuizIntro = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #22D3EE, transparent 70%)' }}
        animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full text-center relative z-10"
      >
        {/* Logo icon with glow */}
        <motion.div variants={item} className="flex items-center gap-3 justify-center mb-8">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #0da2e7, #8B5CF6)',
              boxShadow: '0 8px 32px rgba(13,162,231,0.35)',
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon name="conversion_path" size={32} className="text-white" />
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ border: '2px solid rgba(13,162,231,0.3)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={item} className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Find Your Ideal
          <br />
          <span className="gradient-text-multi">Tech Career Path</span>
        </motion.h1>

        <motion.p variants={item} className="text-secondary text-lg mb-8 max-w-md mx-auto leading-relaxed">
          Our AI assessment maps your programming skills, DSA knowledge, and tech interests to recommend the best roles — SDE, ML Engineer, DevOps, and more.
        </motion.p>

        {/* Process Steps (linear flow) */}
        <motion.div variants={item} className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, rgba(30,41,59,0.6), rgba(15,23,42,0.4))',
                    border: '1px solid rgba(13,162,231,0.15)',
                  }}
                >
                  <Icon name={step.icon} size={20} style={{ color: '#0da2e7' }} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-wider">{step.num}</p>
                  <p className="text-xs text-secondary font-medium">{step.label}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, rgba(13,162,231,0.3), rgba(139,92,246,0.15))' }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {HIGHLIGHTS.map((h, i) => (
            <motion.div
              key={h.title}
              variants={item}
              className="rounded-2xl p-5 text-left relative overflow-hidden group cursor-default"
              style={{
                background: 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.3))',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              whileHover={{
                y: -4,
                borderColor: `${h.color}30`,
                boxShadow: `0 16px 40px -8px rgba(0,0,0,0.3), 0 0 24px ${h.color}10`,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Top highlight */}
              <div className="absolute top-0 left-4 right-4 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }}
              />
              {/* Corner glow */}
              <div
                className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-[0.06] pointer-events-none group-hover:opacity-[0.12] transition-opacity"
                style={{ background: `radial-gradient(circle, ${h.color}, transparent 70%)` }}
              />

              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 relative z-[1]"
                style={{
                  background: h.bgColor,
                  border: `1px solid ${h.color}20`,
                }}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200 }}
              >
                <Icon name={h.icon} size={22} style={{ color: h.color }} />
              </motion.div>
              <h3 className="text-sm font-bold text-white mb-1 relative z-[1]">{h.title}</h3>
              <p className="text-xs text-muted leading-relaxed relative z-[1]">{h.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={item} className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button variant="primary" size="lg" onClick={() => navigate('/assessment')} className="px-14">
              Start Assessment
              <Icon name="arrow_forward" size={20} />
            </Button>
          </motion.div>

          <button
            onClick={() => navigate('/dashboard')}
            className="block mx-auto text-sm text-muted hover:text-accent transition-colors duration-200 flex items-center gap-1.5"
          >
            <Icon name="arrow_back" size={16} />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Trust indicator */}
        <motion.div
          variants={item}
          className="mt-8 flex items-center justify-center gap-4"
        >
          {[
            { icon: 'lock', label: 'Private & Secure' },
            { icon: 'verified', label: 'AI Verified Results' },
            { icon: 'groups', label: '50K+ Assessed' },
          ].map((trust) => (
            <div key={trust.label} className="flex items-center gap-1.5">
              <Icon name={trust.icon} size={14} style={{ color: '#64748B' }} />
              <span className="text-[11px] text-muted">{trust.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizIntro;
