import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { useRoadmap } from '../hooks/useRoadmap';

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const phaseCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 240,
      damping: 22,
      delay: i * 0.12,
    },
  }),
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
};

const milestoneVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 26,
      delay: i * 0.06,
    },
  }),
};

const timelineLineVariants = {
  hidden: { height: 0 },
  visible: {
    height: '100%',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

const checkboxSpring = {
  scale: [1, 1.35, 1],
  transition: { type: 'spring', stiffness: 500, damping: 15 },
};

/* ------------------------------------------------------------------ */
/*  Rotating Ring SVG for Phase Numbers                                */
/* ------------------------------------------------------------------ */

const RotatingRing = ({ progress, index }: { progress: number; index: number }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
      {/* Outer rotating ring */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 48 48"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(124, 58, 237, 0.15)"
          strokeWidth="2.5"
        />
        {/* Animated progress arc */}
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
        </defs>
      </svg>
      {/* Inner phase number */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-[#0066FF] flex items-center justify-center text-white font-bold text-sm z-10">
        {index + 1}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Animated Milestone Checkbox                                        */
/* ------------------------------------------------------------------ */

const MilestoneCheckbox = ({
  done,
  inProgress,
  onClick,
}: {
  done: boolean;
  inProgress: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-300 ${
      done
        ? 'bg-emerald-500 border-emerald-500'
        : inProgress
        ? 'border-[#0066FF] animate-pulse'
        : 'border-white/20 hover:border-white/40'
    }`}
    animate={done ? checkboxSpring : { scale: 1 }}
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
  >
    <AnimatePresence mode="wait">
      {done && (
        <motion.span
          key="check"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <Icon name="check" size={14} className="text-white" />
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const Roadmap = () => {
  const { roadmap, loading, generating, error, toggleMilestone, generateRoadmap } = useRoadmap();

  /* ---- Loading State ---- */
  if (loading || generating) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="rounded-2xl p-6 h-28" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-5 w-56 rounded-lg bg-white/8 mb-3" />
          <div className="h-3 w-80 rounded-lg bg-white/5" />
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl p-5 flex gap-4 items-start" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-10 h-10 rounded-full bg-white/8 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-white/8" />
              <div className="h-3 w-full rounded bg-white/5" />
              <div className="h-3 w-3/4 rounded bg-white/5" />
            </div>
          </div>
        ))}
        {generating && (
          <p className="text-center text-sm text-[#94A3B8] pt-2 animate-pulse">Generating your personalized roadmap…</p>
        )}
      </div>
    );
  }

  /* ---- Empty State ---- */
  if (!roadmap) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-64 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div variants={floatVariants} animate="animate">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-[#0066FF]/20 border border-purple-500/20 flex items-center justify-center mb-5">
            <Icon name="route" size={40} className="text-[#64748B]" />
          </div>
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-2">No Roadmap Yet</h2>
        <p className="text-[#94A3B8] mb-6 max-w-sm">
          Take the career assessment to get a personalized roadmap, or generate a default full-stack developer roadmap.
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => (window.location.href = '/quiz-intro')}>
            Take Assessment
          </Button>
          <Button variant="ghost" onClick={() => generateRoadmap('demo')}>
            Quick Start Roadmap
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ---- Data Extraction ---- */
  const phases = roadmap.phases || roadmap.roadmap?.phases || [];
  const title = roadmap.careerTitle || roadmap.title || roadmap.roadmap?.title || 'Your Career';
  const progress = roadmap.progress || roadmap.roadmap?.progress || 0;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ================================================================ */}
      {/*  Header with Animated Gradient + Shimmer                         */}
      {/* ================================================================ */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl">
        {/* Gradient background layer */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(0,102,255,0.15) 50%, rgba(34,211,238,0.10) 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 6s ease infinite',
          }}
        />

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.04) 45%, transparent 60%)',
            backgroundSize: '250% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />

        <div className="relative border border-[#1E293B] rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.span
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <Icon name="auto_awesome" size={22} className="text-[#22D3EE]" />
                </motion.span>
                <h1 className="text-2xl font-bold text-white">Learning Roadmap</h1>
              </div>
              <p className="text-[#94A3B8]">{title}</p>
            </div>
            <Badge variant="accent" size="md">
              {Math.round(progress)}% Complete
            </Badge>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative">
            <div className="w-full bg-white/5 rounded-full overflow-hidden h-4">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: 'linear-gradient(90deg, #7C3AED, #0066FF, #22D3EE)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 4s ease infinite',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Shine sweep on the bar */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }}
                />
              </motion.div>
            </div>
            {/* Percentage label beneath bar */}
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-[#64748B]">Progress</span>
              <span className="text-xs font-medium text-[#22D3EE]">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================================================================ */}
      {/*  Phases                                                          */}
      {/* ================================================================ */}
      <div className="space-y-6">
        <AnimatePresence mode="sync">
          {phases.map((phase: any, pi: number) => {
            const milestones = phase.milestones || [];
            const completedCount = milestones.filter(
              (m: any) => m.completed || m.status === 'completed',
            ).length;
            const phaseProgress =
              milestones.length > 0
                ? Math.round((completedCount / milestones.length) * 100)
                : 0;

            return (
              <motion.div
                key={phase.id || pi}
                custom={pi}
                variants={phaseCardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{
                  y: -4,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
              >
                {/* Subtle border glow wrapper */}
                <div
                  className="rounded-2xl transition-shadow duration-500"
                  style={{
                    boxShadow:
                      phaseProgress === 100
                        ? '0 0 20px rgba(34,211,238,0.08), inset 0 0 0 1px rgba(34,211,238,0.12)'
                        : 'none',
                  }}
                >
                  <Card className="overflow-hidden">
                    {/* Phase header row */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <RotatingRing progress={phaseProgress} index={pi} />
                        <div>
                          <h3 className="font-semibold text-white text-base">
                            {phase.name || phase.title}
                          </h3>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {phase.duration} &middot; {completedCount}/{milestones.length} done
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {phaseProgress === 100 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            <Badge variant="success" size="sm">
                              Completed
                            </Badge>
                          </motion.div>
                        )}
                        <ProgressBar
                          value={completedCount}
                          max={milestones.length || 1}
                          color="success"
                          size="sm"
                          className="w-24"
                        />
                      </div>
                    </div>

                    {/* Timeline + Milestones */}
                    <div className="relative ml-6 pl-7">
                      {/* Animated timeline line */}
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full overflow-hidden"
                        variants={timelineLineVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        <div
                          className="w-full h-full"
                          style={{
                            background:
                              'linear-gradient(to bottom, rgba(124,58,237,0.4), rgba(0,102,255,0.15), transparent)',
                          }}
                        />
                      </motion.div>

                      <div className="space-y-1">
                        {milestones.map((m: any, mi: number) => {
                          const done = m.completed || m.status === 'completed';
                          const inProgress = m.status === 'in-progress' || m.status === 'in_progress';

                          return (
                            <motion.div
                              key={m.id || mi}
                              custom={mi}
                              variants={milestoneVariants}
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true, amount: 0.3 }}
                              className="flex items-start gap-3 py-2.5 group"
                            >
                              {/* Connector dot on the timeline */}
                              <div className="absolute left-0 mt-2 -translate-x-[3px]">
                                <motion.div
                                  className={`w-2 h-2 rounded-full ${
                                    done
                                      ? 'bg-emerald-400'
                                      : inProgress
                                      ? 'bg-[#0066FF]'
                                      : 'bg-[#111827]'
                                  }`}
                                  initial={{ scale: 0 }}
                                  whileInView={{ scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: mi * 0.08 }}
                                />
                              </div>

                              <MilestoneCheckbox
                                done={done}
                                inProgress={inProgress}
                                onClick={() => toggleMilestone(m.id, !done)}
                              />

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium transition-colors duration-300 ${
                                    done ? 'text-[#64748B] line-through' : 'text-white'
                                  }`}
                                >
                                  {m.title}
                                </p>
                                {m.description && (
                                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                                    {m.description}
                                  </p>
                                )}

                                {/* Resources */}
                                {m.resources && m.resources.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {m.resources.slice(0, 3).map((r: any, ri: number) => (
                                      <motion.a
                                        key={ri}
                                        href={r.link || r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[#0066FF] bg-[#0066FF]/5 px-2.5 py-1 rounded-lg border border-transparent transition-colors duration-300 hover:text-[#22D3EE] hover:bg-[#0066FF]/10 hover:border-[#0066FF]/20"
                                        whileHover={{ x: 4 }}
                                        transition={{
                                          type: 'spring',
                                          stiffness: 400,
                                          damping: 20,
                                        }}
                                      >
                                        <Icon name="open_in_new" size={12} />{' '}
                                        {r.title || r.platform}
                                      </motion.a>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <span className="text-xs text-[#64748B] flex-shrink-0 mt-0.5">
                                {m.duration || m.estimatedTime}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ---- Error ---- */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm text-red-400 text-center bg-red-400/5 border border-red-400/10 rounded-xl py-3 px-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  Inline Keyframes                                                */}
      {/* ================================================================ */}
      <style>{`
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default Roadmap;
