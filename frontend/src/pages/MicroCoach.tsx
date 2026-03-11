import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAssessment } from '../hooks/useAssessment';
import { assessmentAPI, learningEnhancedAPI } from '../services/api';

/* ───── Animation Variants ───── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const slideDown = {
  hidden: { opacity: 0, height: 0, y: -12 },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -12,
    transition: { duration: 0.2 },
  },
};

const taskCardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: i * 0.07,
      type: 'spring',
      stiffness: 280,
      damping: 22,
    },
  }),
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const checkboxSpring = {
  unchecked: { scale: 1 },
  checked: {
    scale: [1, 1.35, 0.9, 1.1, 1],
    transition: { type: 'spring', stiffness: 500, damping: 15, duration: 0.5 },
  },
};

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 0px rgba(0,102,255,0.0)',
      '0 0 20px rgba(0,102,255,0.3)',
      '0 0 0px rgba(0,102,255,0.0)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

/* ───── Animated Progress Fill Component ───── */
const AnimatedSkillBar = ({ value, color }: { value: number; color: string }) => {
  const colorMap: Record<string, string> = {
    success: '#22c55e',
    accent: '#0066FF',
    warning: '#f59e0b',
  };
  const fillColor = colorMap[color] || colorMap.accent;

  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: fillColor }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
};

const MicroCoach = () => {
  const { results } = useAssessment();
  const [tasks, setTasks] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [concept, setConcept] = useState('');
  const [depth, setDepth] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [nextAction, setNextAction] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNextAction();
  }, []);

  const loadNextAction = async () => {
    try {
      const res = await learningEnhancedAPI.getNextAction();
      // Backend wraps in { success, data }
      setNextAction(res.data?.data || res.data);
    } catch {
      // ignore
    }
  };

  // Extract skills from assessment results for snapshot
  const skills = results?.heatmap || results?.skills || [];
  const microCoachData = results?.microCoach;

  useEffect(() => {
    if (microCoachData?.microTasks) {
      setTasks(microCoachData.microTasks);
    }
  }, [microCoachData]);

  const handleGenerateTasks = async () => {
    setGenerating(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId') || 'demo';
      const res = await assessmentAPI.generateMicroCoach(userId);
      if (res.data?.microTasks) {
        setTasks(res.data.microTasks);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate tasks');
    }
    setGenerating(false);
  };

  const handleExplain = async () => {
    if (!concept.trim()) return;
    setExplaining(true);
    setError('');
    try {
      const res = await learningEnhancedAPI.explainConcept({ concept: concept.trim(), depth });
      // Backend wraps in { success, data }
      setExplanation(res.data?.data || res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to explain concept');
    }
    setExplaining(false);
  };

  const toggleTask = (index: number) => {
    setTasks((prev) => prev.map((t, i) => i === index ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Micro-Coach</h1>
        <p className="text-[#94A3B8] mt-1">Daily learning tasks powered by AI</p>
      </motion.div>

      {/* Skill Snapshot */}
      {skills.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Skill Snapshot</h2>
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {skills.slice(0, 6).map((skill: any, i: number) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  custom={i}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{skill.name}</span>
                    <motion.span
                      className="text-xs text-[#64748B]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      {skill.score || skill.level || 0}%
                    </motion.span>
                  </div>
                  <AnimatedSkillBar
                    value={skill.score || skill.level || 0}
                    color={skill.score >= 70 ? 'success' : skill.score >= 40 ? 'accent' : 'warning'}
                  />
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      )}

      {/* AI Concept Explainer */}
      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Icon name="auto_awesome" size={20} className="text-[#0066FF]" />
            </motion.span>
            AI Concept Explainer
          </h2>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <motion.input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Enter a concept to understand (e.g., REST APIs, Machine Learning)"
              className="flex-1 bg-inset border border-white/5 rounded-xl px-4 py-3 text-white placeholder-[#64748B] outline-none text-sm transition-shadow duration-300"
              whileFocus={{
                boxShadow: '0 0 0 2px rgba(0,102,255,0.3), 0 0 20px rgba(0,102,255,0.1)',
                borderColor: 'rgba(0,102,255,0.5)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
            />
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((d) => (
                <motion.button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                    depth === d ? 'bg-[#0066FF] text-white' : 'bg-inset text-[#64748B] border border-white/5'
                  }`}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 12px rgba(0,102,255,0.2)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={depth === d ? {
                    boxShadow: '0 0 12px rgba(0,102,255,0.3)',
                  } : {
                    boxShadow: '0 0 0px rgba(0,102,255,0)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {d}
                </motion.button>
              ))}
            </div>
            <Button variant="primary" onClick={handleExplain} loading={explaining} disabled={!concept.trim()}>
              Explain
            </Button>
          </div>

          {/* Explanation Result - Slide Down Reveal */}
          <AnimatePresence mode="wait">
            {explanation && (
              <motion.div
                key="explanation"
                variants={slideDown}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-inset rounded-xl p-4 border border-white/5 overflow-hidden space-y-3"
              >
                <motion.p
                  className="text-sm text-white leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {explanation.explanation || explanation.summary || explanation.content || (typeof explanation === 'string' ? explanation : JSON.stringify(explanation))}
                </motion.p>
                {explanation.keyPoints && Array.isArray(explanation.keyPoints) && explanation.keyPoints.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#0066FF] mb-1">Key Points</p>
                    <ul className="list-disc list-inside space-y-1">
                      {explanation.keyPoints.map((kp: string, ki: number) => (
                        <li key={ki} className="text-xs text-[#94A3B8]">{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {explanation.analogies && Array.isArray(explanation.analogies) && explanation.analogies.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#0066FF] mb-1">Analogies</p>
                    {explanation.analogies.map((a: string, ai: number) => (
                      <p key={ai} className="text-xs text-[#94A3B8]">{a}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Micro-Learning Tasks */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Micro-Learning Tasks</h2>
            <div className="flex items-center gap-3">
              {tasks.length > 0 && (
                <motion.span
                  className="text-sm text-[#94A3B8]"
                  key={completedCount}
                  initial={{ scale: 1.3, color: '#0066FF' }}
                  animate={{ scale: 1, color: '#94A3B8' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {completedCount}/{tasks.length} done
                </motion.span>
              )}

              {/* Generate Tasks Button with Glow + Loading */}
              <motion.div
                whileHover={{
                  boxShadow: '0 0 20px rgba(0,102,255,0.3)',
                }}
                className="rounded-xl"
                animate={generating ? {
                  boxShadow: [
                    '0 0 0px rgba(0,102,255,0)',
                    '0 0 25px rgba(0,102,255,0.4)',
                    '0 0 0px rgba(0,102,255,0)',
                  ],
                } : {}}
                transition={generating ? { duration: 1.2, repeat: Infinity } : {}}
              >
                <Button variant="secondary" size="sm" onClick={handleGenerateTasks} loading={generating}>
                  <motion.span
                    animate={generating ? { rotate: 360 } : { rotate: 0 }}
                    transition={generating ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                    style={{ display: 'inline-flex' }}
                  >
                    <Icon name="refresh" size={16} />
                  </motion.span>{' '}
                  Generate Tasks
                </Button>
              </motion.div>
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasks.map((task: any, i: number) => (
                  <motion.div
                    key={`task-${i}-${task.title}`}
                    custom={i}
                    variants={taskCardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    whileHover={{
                      y: -3,
                      boxShadow: task.completed
                        ? '0 0 15px rgba(34,197,94,0.15)'
                        : '0 0 15px rgba(0,102,255,0.15)',
                      borderColor: task.completed
                        ? 'rgba(34,197,94,0.3)'
                        : 'rgba(0,102,255,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                      task.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-inset border-white/5'
                    }`}
                  >
                    {/* Checkbox with Spring Pop */}
                    <motion.button
                      onClick={() => toggleTask(i)}
                      variants={checkboxSpring}
                      animate={task.completed ? 'checked' : 'unchecked'}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        task.completed ? 'bg-green-500 border-green-500' : 'border-white/20 hover:border-[#0066FF]'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {task.completed && (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          >
                            <Icon name="check" size={14} className="text-white" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      {/* Task Title with Strikethrough Slide */}
                      <div className="relative inline-block">
                        <p className={`text-sm font-medium transition-colors duration-300 ${
                          task.completed ? 'text-[#64748B]' : 'text-white'
                        }`}>
                          {task.title}
                        </p>
                        {task.completed && (
                          <motion.div
                            className="absolute top-1/2 left-0 h-[1.5px] bg-[#64748B]/60"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge size="sm" variant="accent">{task.skill}</Badge>
                        {task.resourceUrl && (
                          <motion.a
                            href={task.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#0066FF] hover:text-[#38bdf8] flex items-center gap-1"
                            whileHover={{ x: 2 }}
                          >
                            <Icon name="open_in_new" size={12} /> Resource
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon name="school" size={40} className="text-[#64748B] mx-auto mb-3" />
              </motion.div>
              <p className="text-[#94A3B8] mb-4">No tasks yet. Generate AI-powered learning tasks based on your assessment.</p>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Next Best Action */}
      <AnimatePresence>
        {nextAction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <motion.div
              variants={pulseGlow}
              animate="animate"
              className="rounded-2xl"
            >
              <Card className="border-[#0066FF]/20 bg-[#0066FF]/5">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Icon name="lightbulb" size={24} className="text-[#0066FF] mt-0.5" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white">Next Best Action</h3>
                    <p className="text-sm text-[#94A3B8] mt-1">{nextAction.action || nextAction.suggestion || JSON.stringify(nextAction)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm text-red-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MicroCoach;
