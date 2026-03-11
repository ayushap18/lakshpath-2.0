import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import { assessmentAPI } from '../services/api';

interface QuestionDef {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'rating' | 'text';
  options?: string[];
}

const QUESTIONS: QuestionDef[] = [
  { id: 'q1', question: 'What is your current education level?', type: 'single', options: ['2nd Year B.Tech/BE', '3rd Year B.Tech/BE', 'Final Year B.Tech/BE', 'MCA / M.Tech', 'Recent Graduate'] },
  { id: 'q2', question: 'Which programming languages are you comfortable with?', type: 'multiple', options: ['Python', 'JavaScript/TypeScript', 'Java', 'C/C++', 'Go/Rust', 'SQL'] },
  { id: 'q3', question: 'Which tech domains interest you the most?', type: 'multiple', options: ['Full Stack Web Dev', 'AI / Machine Learning', 'Mobile App Dev', 'Cloud & DevOps', 'Cybersecurity', 'Data Science', 'Blockchain / Web3', 'Embedded / IoT'] },
  { id: 'q4', question: 'Rate your DSA & problem-solving skills', type: 'rating' },
  { id: 'q5', question: 'Rate your system design & architecture knowledge', type: 'rating' },
  { id: 'q6', question: 'What is your target tech role?', type: 'single', options: ['Software Engineer (SDE)', 'Frontend Developer', 'Backend Developer', 'Data Scientist / ML Engineer', 'DevOps / Cloud Engineer', 'Not sure yet'] },
  { id: 'q7', question: 'When are your campus placements?', type: 'single', options: ['Already started', 'Within 3 months', '3-6 months away', '6-12 months away', 'Not applicable'] },
  { id: 'q8', question: 'What is your biggest tech career challenge right now?', type: 'text' },
];

/* ───── Animation Variants ───── */
const questionVariants = {
  enter: {
    opacity: 0,
    rotateY: 25,
    x: 60,
    scale: 0.96,
    filter: 'blur(4px)',
  },
  center: {
    opacity: 1,
    rotateY: 0,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    rotateY: -25,
    x: -60,
    scale: 0.96,
    filter: 'blur(4px)',
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

const optionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  }),
};

const patternVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  }),
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const chipSpring = {
  tap: { scale: 0.92 },
  selected: {
    scale: [1, 1.12, 0.95, 1.03, 1],
    transition: { type: 'spring', stiffness: 400, damping: 12, duration: 0.45 },
  },
};

/* ───── Animated Counter Component ───── */
const AnimatedPercentage = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    const duration = 400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display}%</span>;
};

/* ───── Pulsing Ring Component for Submitting ───── */
const PulsingRing = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full border-2 border-[#0066FF]"
    style={{ width: size, height: size }}
    initial={{ opacity: 0.6, scale: 0.8 }}
    animate={{
      opacity: [0.6, 0],
      scale: [0.8, 2.2],
    }}
    transition={{
      duration: 2.2,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

/* ───── Orbiting Dot Component ───── */
const OrbitDot = ({ delay, radius, duration }: { delay: number; radius: number; duration: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full bg-[#0066FF]"
    style={{ top: '50%', left: '50%', marginTop: -4, marginLeft: -4 }}
    animate={{
      x: [radius, 0, -radius, 0, radius],
      y: [0, -radius, 0, radius, 0],
      opacity: [0.9, 0.5, 0.9, 0.5, 0.9],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

const Assessment = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const q = QUESTIONS[current];
  const answer = answers[q.id];

  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);
  const [prevPatternCount, setPrevPatternCount] = useState(0);

  const updatePatterns = (ans: Record<string, any>) => {
    const patterns: string[] = [];
    const langs = ans.q2 || [];
    const domains = ans.q3 || [];
    if (langs.length >= 3) patterns.push('Polyglot developer profile detected');
    if (langs.includes('Python') && domains.includes('AI / Machine Learning')) patterns.push('Strong AI/ML career alignment');
    if (langs.includes('JavaScript/TypeScript') && domains.includes('Full Stack Web Dev')) patterns.push('Full Stack developer trajectory');
    if (domains.includes('Cloud & DevOps')) patterns.push('Cloud-native engineering interest');
    if (ans.q4 >= 4) patterns.push('Strong DSA problem-solver');
    if (ans.q5 >= 4) patterns.push('System design thinker');
    if (ans.q4 >= 3 && ans.q5 >= 3) patterns.push('SDE-ready skill combination');
    if (domains.includes('Cybersecurity')) patterns.push('Security-focused career path');
    if (ans.q7 === 'Already started' || ans.q7 === 'Within 3 months') patterns.push('Urgent placement prep needed');
    setPrevPatternCount(detectedPatterns.length);
    setDetectedPatterns(patterns);
  };

  const setAnswer = (val: any) => {
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    updatePatterns(newAnswers);
  };

  const toggleMultiple = (opt: string) => {
    const selected: string[] = answer || [];
    setAnswer(selected.includes(opt) ? selected.filter((s: string) => s !== opt) : [...selected, opt]);
  };

  const canNext = () => {
    if (!answer) return false;
    if (q.type === 'multiple' && Array.isArray(answer) && answer.length === 0) return false;
    if (q.type === 'text' && typeof answer === 'string' && !answer.trim()) return false;
    return true;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const userId = localStorage.getItem('userId') || 'demo';
      const userName = localStorage.getItem('userName') || 'Student';
      const userEmail = localStorage.getItem('userEmail') || '';
      await assessmentAPI.submit({
        answers,
        user: { id: userId, name: userName, email: userEmail },
        profile: {
          name: userName,
          education: answers.q1,
          interests: answers.q3 || [],
        },
      });
      localStorage.setItem('assessmentCompleted', 'true');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const isLast = current === QUESTIONS.length - 1;
  const progressPercent = Math.round(((current + 1) / QUESTIONS.length) * 100);

  /* ───── Submitting State ───── */
  if (submitting) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center relative"
        >
          {/* Pulsing Rings */}
          <div className="relative flex items-center justify-center mb-8" style={{ width: 120, height: 120, margin: '0 auto' }}>
            <PulsingRing delay={0} size={80} />
            <PulsingRing delay={0.5} size={80} />
            <PulsingRing delay={1.0} size={80} />
            <PulsingRing delay={1.5} size={80} />

            {/* Orbiting Dots */}
            <OrbitDot delay={0} radius={45} duration={3} />
            <OrbitDot delay={0.75} radius={45} duration={3} />
            <OrbitDot delay={1.5} radius={45} duration={3} />
            <OrbitDot delay={2.25} radius={45} duration={3} />

            {/* Center spinner */}
            <motion.div
              className="w-16 h-16 border-4 border-[#0066FF]/30 border-t-[#0066FF] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <motion.h2
            className="text-2xl font-bold text-white mb-2"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Analyzing Your Responses
          </motion.h2>
          <motion.p
            className="text-[#94A3B8]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Gemini AI is finding your perfect career matches...
          </motion.p>

          {/* Animated progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#0066FF]"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left Column -- Questions */}
      <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-16 max-w-3xl">
        {/* Progress */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#94A3B8]">Question {current + 1} of {QUESTIONS.length}</span>
            <motion.span
              className="text-sm text-[#0066FF] font-medium"
              key={progressPercent}
            >
              <AnimatedPercentage value={progressPercent} />
            </motion.span>
          </div>
          {/* Animated Progress Fill */}
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#0066FF]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </motion.div>

        {/* Question with 3D Perspective Rotation */}
        <div style={{ perspective: 1200 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex-1"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-white mb-8"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {q.question}
              </motion.h2>

              {/* Single Choice with Hover Glow */}
              {q.type === 'single' && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <motion.button
                      key={opt}
                      custom={i}
                      variants={optionVariants}
                      initial="hidden"
                      animate={answer === opt ? {
                        boxShadow: '0 0 12px rgba(0,102,255,0.25)',
                        scale: 1,
                        opacity: 1,
                        y: 0,
                      } : 'visible'}
                      onClick={() => setAnswer(opt)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-colors ${
                        answer === opt
                          ? 'bg-[#0066FF]/10 border-[#0066FF] text-white'
                          : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:text-white'
                      }`}
                      whileHover={{
                        y: -2,
                        boxShadow: '0 0 16px rgba(0,102,255,0.15)',
                        borderColor: answer === opt ? 'rgba(0,102,255,1)' : 'rgba(255,255,255,0.15)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Multiple Choice Chips with Spring Scale */}
              {q.type === 'multiple' && q.options && (
                <div className="flex flex-wrap gap-3">
                  {q.options.map((opt, i) => {
                    const selected = (answer || []).includes(opt);
                    return (
                      <motion.button
                        key={opt}
                        custom={i}
                        variants={optionVariants}
                        initial="hidden"
                        animate={selected ? chipSpring.selected : 'visible'}
                        onClick={() => toggleMultiple(opt)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-[#0066FF]/10 border-[#0066FF] text-white'
                            : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:border-white/20'
                        }`}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: '0 0 12px rgba(0,102,255,0.15)',
                        }}
                        whileTap={chipSpring.tap}
                      >
                        <AnimatePresence mode="wait">
                          {selected && (
                            <motion.span
                              key="check-chip"
                              initial={{ width: 0, opacity: 0, marginRight: 0 }}
                              animate={{ width: 'auto', opacity: 1, marginRight: 4 }}
                              exit={{ width: 0, opacity: 0, marginRight: 0 }}
                              transition={{ duration: 0.2 }}
                              className="inline-flex overflow-hidden"
                            >
                              <Icon name="check" size={16} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Rating Buttons with Hover Scale + Glow */}
              {q.type === 'rating' && (
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((n, i) => (
                    <motion.button
                      key={n}
                      custom={i}
                      variants={optionVariants}
                      initial="hidden"
                      animate={answer === n ? {
                        boxShadow: '0 0 14px rgba(0,102,255,0.35)',
                        scale: [1, 1.15, 1],
                        opacity: 1,
                        y: 0,
                      } : 'visible'}
                      onClick={() => setAnswer(n)}
                      className={`w-14 h-14 rounded-xl border text-lg font-bold transition-colors ${
                        answer === n
                          ? 'bg-[#0066FF] border-[#0066FF] text-white'
                          : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:border-white/20'
                      }`}
                      whileHover={{
                        scale: 1.1,
                        boxShadow: '0 0 16px rgba(0,102,255,0.25)',
                      }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Text Area with Focus Glow */}
              {q.type === 'text' && (
                <motion.textarea
                  value={answer || ''}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-xl p-4 text-white placeholder-[#64748B] outline-none min-h-[120px] resize-none transition-shadow duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileFocus={{
                    boxShadow: '0 0 0 2px rgba(0,102,255,0.3), 0 0 24px rgba(0,102,255,0.1)',
                    borderColor: 'rgba(0,102,255,0.5)',
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-2 overflow-hidden"
            >
              <Icon name="error" size={18} className="text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation with Accent Glow */}
        <div className="flex items-center gap-4 mt-8">
          <AnimatePresence>
            {current > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <motion.div
                  whileHover={{ boxShadow: '0 0 16px rgba(0,102,255,0.2)' }}
                  className="rounded-xl"
                >
                  <Button variant="secondary" size="md" onClick={() => setCurrent((p) => p - 1)}>
                    <Icon name="arrow_back" size={18} /> Previous
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1" />
          <motion.div
            whileHover={{
              boxShadow: '0 0 20px rgba(0,102,255,0.3)',
            }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl"
          >
            {isLast ? (
              <Button variant="primary" size="md" onClick={handleSubmit} disabled={!canNext()}>
                Submit <Icon name="check" size={18} />
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={() => setCurrent((p) => p + 1)} disabled={!canNext()}>
                Next <Icon name="arrow_forward" size={18} />
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Column -- Gemini Analysis */}
      <div className="hidden lg:flex w-96 bg-inset border-l border-white/5 p-8 flex-col">
        <motion.div
          className="flex items-center gap-2 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#38bdf8] flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 0px rgba(0,102,255,0)',
                '0 0 14px rgba(0,102,255,0.4)',
                '0 0 0px rgba(0,102,255,0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Icon name="auto_awesome" size={18} className="text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white">Gemini Analysis</h3>
        </motion.div>

        <div className="flex-1 space-y-4">
          {detectedPatterns.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3"
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(0,102,255,0)',
                    '0 0 12px rgba(0,102,255,0.2)',
                    '0 0 0px rgba(0,102,255,0)',
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Icon name="psychology" size={24} className="text-[#64748B]" />
                </motion.div>
              </motion.div>
              <p className="text-sm text-[#64748B]">AI is analyzing your responses...</p>
              <p className="text-xs text-[#64748B] mt-1">Patterns will appear as you answer</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {detectedPatterns.map((pattern, i) => {
                const isNew = i >= prevPatternCount;
                return (
                  <motion.div
                    key={pattern}
                    custom={i}
                    variants={patternVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-start gap-3 relative overflow-hidden"
                  >
                    {/* Pulse glow overlay for newly detected patterns */}
                    {isNew && (
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        initial={{
                          boxShadow: 'inset 0 0 20px rgba(0,102,255,0.3)',
                        }}
                        animate={{
                          boxShadow: 'inset 0 0 0px rgba(0,102,255,0)',
                        }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    )}
                    <motion.div
                      initial={isNew ? { scale: 0, rotate: -90 } : { scale: 1 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15, delay: isNew ? i * 0.12 + 0.15 : 0 }}
                    >
                      <Icon name="check_circle" size={18} className="text-green-500 mt-0.5" />
                    </motion.div>
                    <span className="text-sm text-white">{pattern}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <motion.div
          className="mt-4 bg-[#111827] border border-[#1E293B] rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-[#64748B]">
            Progress: {Object.keys(answers).length}/{QUESTIONS.length} questions answered
          </p>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full rounded-full bg-[#0066FF]"
              animate={{ width: `${(Object.keys(answers).length / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Assessment;
