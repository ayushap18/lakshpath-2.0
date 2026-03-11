import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Skeleton, { SkeletonStatCard } from '../components/ui/Skeleton';
import { useInterview } from '../hooks/useInterview';

const TYPES = ['Technical', 'Behavioral', 'HR', 'System Design'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

/* ─── animation variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45 } },
};

const sidebarCardVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12, duration: 0.45, ease: 'easeOut' },
  }),
};

const feedbackItemVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const sessionCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
};

const Interview = () => {
  const { sessions, stats, loading, error, startSession, submitAnswer, refetch } = useInterview();
  const [mode, setMode] = useState<'setup' | 'active'>('setup');
  const [type, setType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [role, setRole] = useState('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleStart = async () => {
    const data = await startSession(type.toUpperCase().replace(/ /g, '_'), difficulty.toUpperCase(), role || undefined);
    if (data) {
      const questions = data.questions || [];
      setActiveSession(data.session || data);
      setAllQuestions(questions);
      setQuestionIndex(0);
      setCurrentQ(questions[0] || null);
      setMode('active');
      setFeedback([]);
      setAnswer('');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQ || !answer.trim()) return;
    setSubmitting(true);
    const result = await submitAnswer(currentQ.id, answer);
    if (result) {
      const evalData = result.evaluation || result;
      setFeedback((prev) => [...prev, {
        question: currentQ.questionText || currentQ.question,
        answer,
        feedback: evalData.feedback || evalData,
        score: evalData.score,
        strengths: evalData.strengths,
        improvements: evalData.improvements,
      }]);
      setAnswer('');
      // Advance to next question
      const nextIdx = questionIndex + 1;
      if (nextIdx < allQuestions.length) {
        setQuestionIndex(nextIdx);
        setCurrentQ(allQuestions[nextIdx]);
      } else {
        // All questions done
        setMode('setup');
        refetch();
      }
    }
    setSubmitting(false);
  };

  const handleEndSession = () => {
    setMode('setup');
    setActiveSession(null);
    setAllQuestions([]);
    setQuestionIndex(0);
    refetch();
  };

  /* ─── loading state ─── */
  if (loading && !activeSession) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="40%" height={32} />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <Skeleton variant="rectangular" height={300} />
      </div>
    );
  }

  /* ─── active interview session ─── */
  if (mode === 'active' && activeSession) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="active"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex gap-6 h-[calc(100vh-8rem)]"
        >
          {/* Left -- Question & Answer */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col border border-[#1E293B]">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="accent">{type} &middot; {difficulty}</Badge>
                <Button variant="ghost" size="sm" onClick={handleEndSession}>
                  End Session <Icon name="close" size={16} />
                </Button>
              </div>

              {/* Question counter */}
              <p className="text-xs text-white/40 mb-2">
                Question {questionIndex + 1} of {allQuestions.length}
              </p>

              {/* Question with slide-in from right */}
              <motion.h2
                key={currentQ?.id || currentQ?.questionText}
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                className="text-lg font-bold text-white mb-6"
              >
                {currentQ?.questionText || currentQ?.question || 'Loading question...'}
              </motion.h2>

              {/* Answer area with fade-in */}
              <motion.textarea
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={type === 'Technical' ? 'Write your code or solution here...' : 'Type your answer...'}
                className={`flex-1 w-full bg-[#111827] border border-[#1E293B] rounded-xl p-4 text-white placeholder-white/40 outline-none focus:border-[#0066FF]/50 resize-none transition-colors duration-200 ${
                  type === 'Technical' ? 'font-mono text-sm' : ''
                }`}
              />

              <div className="flex items-center justify-end gap-3 mt-4">
                {/* Submit button with loading spinner */}
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(0,102,255,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl"
                >
                  <Button variant="primary" onClick={handleSubmitAnswer} loading={submitting} disabled={!answer.trim()}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Analyzing...
                      </span>
                    ) : (
                      <>Submit Answer <Icon name="send" size={16} /></>
                    )}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </div>

          {/* Right -- AI Analysis (STAR sidebar) */}
          <div className="w-80 flex flex-col space-y-4 overflow-y-auto">
            <motion.div custom={0} variants={sidebarCardVariants} initial="hidden" animate="visible">
              <Card className="border border-[#1E293B]">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="auto_awesome" size={20} className="text-[#0066FF]" />
                  <h3 className="font-semibold text-white">STAR Analysis</h3>
                </div>
                {feedback.length === 0 ? (
                  <p className="text-sm text-white/40">Submit your first answer to see AI feedback here.</p>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {feedback.map((f, i) => (
                        <motion.div
                          key={i}
                          variants={feedbackItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-[#111827] rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-[#0066FF] font-medium">Q{i + 1} Feedback</p>
                            {f.score != null && (
                              <Badge variant={f.score >= 70 ? 'success' : f.score >= 40 ? 'warning' : 'error'} size="sm">
                                {Math.round(f.score)}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/50">
                            {typeof f.feedback === 'string' ? f.feedback : (f.feedback?.feedback || 'Answer evaluated.')}
                          </p>
                          {f.strengths && Array.isArray(f.strengths) && f.strengths.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-green-400 font-medium mb-1">Strengths</p>
                              {f.strengths.map((s: string, si: number) => (
                                <p key={si} className="text-xs text-white/50">+ {s}</p>
                              ))}
                            </div>
                          )}
                          {f.improvements && Array.isArray(f.improvements) && f.improvements.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-amber-400 font-medium mb-1">Improve</p>
                              {f.improvements.map((imp: string, ii: number) => (
                                <p key={ii} className="text-xs text-white/50">- {imp}</p>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div custom={1} variants={sidebarCardVariants} initial="hidden" animate="visible">
              <Card className="border border-[#1E293B]">
                <h4 className="text-sm font-semibold text-white mb-2">Session Progress</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#111827] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#0066FF] to-[#22D3EE] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${allQuestions.length > 0 ? (feedback.length / allQuestions.length) * 100 : 0}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-white/50 whitespace-nowrap">{feedback.length}/{allQuestions.length}</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ─── setup view ─── */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="setup"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, x: -40 }}
        className="space-y-6"
      >
        {/* Title with gradient text */}
        <motion.h1
          variants={itemVariants}
          className="text-2xl font-bold bg-gradient-to-r from-[#0066FF] via-[#22D3EE] to-[#0066FF] bg-clip-text text-transparent"
        >
          Interview Practice Lab
        </motion.h1>

        {/* Stats with staggered entrance */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: stats?.totalSessions || sessions.length || 0, icon: 'record_voice_over', delay: 0 },
            { label: 'Avg Score', value: stats?.avgScore ? `${Math.round(stats.avgScore)}%` : 'N/A', icon: 'analytics', delay: 1 },
            { label: 'Best Score', value: stats?.bestScore ? `${Math.round(stats.bestScore)}%` : 'N/A', icon: 'emoji_events', delay: 2 },
            { label: 'This Week', value: stats?.thisWeek || 0, icon: 'calendar_today', delay: 3 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + stat.delay * 0.1, duration: 0.45, ease: 'easeOut' }}
            >
              <StatCard label={stat.label} value={stat.value} icon={stat.icon} />
            </motion.div>
          ))}
        </motion.div>

        {/* Setup config card */}
        <motion.div variants={itemVariants}>
          <Card className="border border-[#1E293B]">
            <h2 className="text-lg font-semibold text-white mb-4">Start New Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Interview type */}
              <div>
                <label className="text-sm text-white/50 mb-2 block">Interview Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <motion.button
                      key={t}
                      onClick={() => setType(t)}
                      whileHover={{
                        y: -2,
                        boxShadow: type === t
                          ? '0 0 16px rgba(0,102,255,0.45)'
                          : '0 0 12px rgba(0,102,255,0.15)',
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                        type === t
                          ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25'
                          : 'bg-[#111827] text-white/50 border border-[#1E293B] hover:text-white'
                      }`}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm text-white/50 mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <motion.button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      whileHover={{
                        y: -2,
                        boxShadow: difficulty === d
                          ? '0 0 16px rgba(0,102,255,0.45)'
                          : '0 0 12px rgba(0,102,255,0.15)',
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                        difficulty === d
                          ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25'
                          : 'bg-[#111827] text-white/50 border border-[#1E293B] hover:text-white'
                      }`}
                    >
                      {d}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Target role */}
              <div>
                <label className="text-sm text-white/50 mb-2 block">Target Role (Optional)</label>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Frontend Developer"
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-2 text-white placeholder-white/40 outline-none text-sm focus:border-[#0066FF]/50 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Start session button with accent glow */}
            <motion.div
              whileHover={{ boxShadow: '0 0 24px rgba(0,102,255,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-block rounded-xl"
            >
              <Button variant="primary" onClick={handleStart} loading={loading}>
                Start Session <Icon name="play_arrow" size={18} />
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {/* Previous Sessions with staggered entrance */}
        {sessions.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-4">Previous Sessions</h2>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((s: any, i: number) => (
                <motion.div
                  key={s.id}
                  custom={i}
                  variants={sessionCardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -2,
                    boxShadow: '0 4px 20px rgba(0,102,255,0.1)',
                    transition: { duration: 0.2 },
                  }}
                >
                  <Card className="flex items-center justify-between border border-[#1E293B] transition-colors duration-200 hover:border-[#0066FF]/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center">
                        <Icon name="record_voice_over" size={20} className="text-[#0066FF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.type || 'Interview'} &middot; {s.difficulty || 'Medium'}</p>
                        <p className="text-xs text-white/40">{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={s.score >= 70 ? 'success' : s.score >= 40 ? 'warning' : 'error'}>
                      {s.score ? `${Math.round(s.score)}%` : 'N/A'}
                    </Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-error"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Interview;
