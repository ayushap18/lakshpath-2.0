import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { useVoiceSession, isSpeechSupported, isSynthesisSupported } from '../hooks/useVoiceSession';

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 140, damping: 20 } },
};
const fadeScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INTERVIEW_TYPES = [
  { id: 'TECHNICAL', label: 'Technical', icon: 'code', color: '#0da2e7', desc: 'DSA, system design, CS fundamentals' },
  { id: 'BEHAVIORAL', label: 'Behavioral', icon: 'psychology', color: '#8B5CF6', desc: 'STAR method, leadership, teamwork' },
  { id: 'SYSTEM_DESIGN', label: 'System Design', icon: 'architecture', color: '#10B981', desc: 'Scalability, databases, architecture' },
  { id: 'CODING', label: 'HR Round', icon: 'person', color: '#F59E0B', desc: 'Tell me about yourself, strengths, goals' },
];

const DIFFICULTIES = [
  { id: 'EASY', label: 'Easy', color: '#10B981' },
  { id: 'MEDIUM', label: 'Medium', color: '#F59E0B' },
  { id: 'HARD', label: 'Hard', color: '#EF4444' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Mic Animation Component                                            */
/* ------------------------------------------------------------------ */

const MicVisualizer = ({ phase }: { phase: string }) => {
  const isListening = phase === 'listening';
  const isProcessing = phase === 'processing';
  const isSpeaking = phase === 'speaking';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: isListening
            ? 'rgba(13,162,231,0.08)'
            : isSpeaking
              ? 'rgba(139,92,246,0.08)'
              : 'rgba(255,255,255,0.03)',
          border: `2px solid ${isListening ? 'rgba(13,162,231,0.3)' : isSpeaking ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
        }}
        animate={
          isListening
            ? { scale: [1, 1.1, 1], borderColor: ['rgba(13,162,231,0.3)', 'rgba(13,162,231,0.6)', 'rgba(13,162,231,0.3)'] }
            : isProcessing
              ? { rotate: 360 }
              : {}
        }
        transition={
          isListening
            ? { duration: 1.5, repeat: Infinity }
            : isProcessing
              ? { duration: 2, repeat: Infinity, ease: 'linear' }
              : {}
        }
      />

      {/* Inner circle */}
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, rgba(13,162,231,0.2), rgba(13,162,231,0.1))'
            : isSpeaking
              ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
          border: `1px solid ${isListening ? 'rgba(13,162,231,0.4)' : isSpeaking ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
        }}
        animate={isListening ? { scale: [1, 1.05, 1] } : {}}
        transition={isListening ? { duration: 0.8, repeat: Infinity } : {}}
      >
        <Icon
          name={isListening ? 'mic' : isSpeaking ? 'volume_up' : isProcessing ? 'hourglass_top' : 'mic_off'}
          size={32}
          className={isListening ? 'text-accent' : isSpeaking ? 'text-[#8B5CF6]' : 'text-muted'}
        />
      </motion.div>

      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border border-[#0da2e7]/20"
            animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-[#0da2e7]/15"
            animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Score Ring (reused from PlacementPrep style)                       */
/* ------------------------------------------------------------------ */

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-[120px] h-[120px] flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-2xl font-extrabold text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {score}
        </motion.span>
        <span className="text-[10px] text-secondary">/100</span>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

const AILive = () => {
  const voice = useVoiceSession();

  /* Setup state */
  const [selectedType, setSelectedType] = useState<string>('TECHNICAL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('MEDIUM');
  const [role, setRole] = useState('');
  const [starting, setStarting] = useState(false);

  const isInSession = !!voice.sessionId && !voice.result;
  const showResults = !!voice.result;
  const showSetup = !isInSession && !showResults;

  /* Start handler */
  const handleStart = useCallback(async () => {
    setStarting(true);
    await voice.startSession(selectedType, selectedDifficulty, role || undefined);
    setStarting(false);
  }, [voice, selectedType, selectedDifficulty, role]);

  /* Auto-submit when recognition stops and we have a transcript */
  useEffect(() => {
    if (voice.phase === 'idle' && voice.transcript && voice.sessionId && !voice.evaluation && !voice.result) {
      voice.submitAnswer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.phase, voice.transcript]);

  /* Browser compat check */
  const browserOk = isSpeechSupported && isSynthesisSupported;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6 pb-8">
      {/* ─── Header ─── */}
      <motion.div variants={item}>
        <div
          className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13,162,231,0.1), rgba(139,92,246,0.06), rgba(15,23,42,0.9))',
            border: '1px solid rgba(13,162,231,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.07] pointer-events-none" style={{ background: 'radial-gradient(circle, #0da2e7, transparent 70%)' }} />
          <div className="relative z-[1]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(13,162,231,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(13,162,231,0.2)' }}>
                <Icon name="videocam" size={24} className="text-accent" filled />
              </div>
              <Badge variant="gradient" size="sm">Voice-Powered AI</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-3 tracking-tight">AI Live 1:1 Sessions</h1>
            <p className="text-secondary text-sm md:text-base mt-1.5 max-w-2xl">
              Practice interviews with real-time voice interaction. Speak your answers naturally and get instant AI evaluation.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Browser Compat Warning ─── */}
      {!browserOk && (
        <motion.div variants={item}>
          <Card glass>
            <div className="flex items-center gap-3 p-1">
              <Icon name="warning" size={20} className="text-warning" filled />
              <div>
                <p className="text-sm text-white font-semibold">Browser Not Fully Supported</p>
                <p className="text-xs text-secondary">
                  {!isSpeechSupported ? 'Speech recognition' : 'Speech synthesis'} is not available.
                  Please use Google Chrome or Microsoft Edge for the best experience.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ─── Error Toast ─── */}
      <AnimatePresence>
        {voice.error && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
          >
            <div className="flex items-center gap-2">
              <Icon name="error" size={18} />
              {voice.error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  SETUP SCREEN                                                     */}
      {/* ================================================================ */}

      <AnimatePresence mode="wait">
        {showSetup && (
          <motion.div key="setup" variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="space-y-5">
            {/* Interview Type */}
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-white mb-3">Select Interview Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {INTERVIEW_TYPES.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`p-4 rounded-xl text-left transition-all border ${selectedType === t.id ? 'ring-1' : ''}`}
                    style={{
                      background: selectedType === t.id ? `${t.color}10` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedType === t.id ? `${t.color}40` : 'rgba(255,255,255,0.06)'}`,
                      ...(selectedType === t.id ? { ringColor: `${t.color}30` } : {}),
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: `${t.color}15`, border: `1px solid ${t.color}25` }}>
                      <Icon name={t.icon} size={20} style={{ color: t.color }} />
                    </div>
                    <p className="text-sm font-bold text-white">{t.label}</p>
                    <p className="text-[11px] text-muted mt-0.5">{t.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Difficulty */}
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-white mb-3">Select Difficulty</h2>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => (
                  <motion.button
                    key={d.id}
                    onClick={() => setSelectedDifficulty(d.id)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all border`}
                    style={{
                      background: selectedDifficulty === d.id ? `${d.color}12` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedDifficulty === d.id ? `${d.color}40` : 'rgba(255,255,255,0.06)'}`,
                      color: selectedDifficulty === d.id ? d.color : 'rgba(255,255,255,0.5)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {d.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Role (optional) */}
            <motion.div variants={item}>
              <h2 className="text-sm font-bold text-white mb-3">Target Role <span className="text-muted font-normal">(optional)</span></h2>
              <input
                type="text"
                placeholder="e.g. Full Stack Developer, Data Scientist..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-muted bg-white/[0.03] border border-white/[0.06] focus:border-[#0da2e7]/40 focus:outline-none transition-all"
              />
            </motion.div>

            {/* Start Button */}
            <motion.div variants={item}>
              <Button variant="primary" size="lg" className="w-full" onClick={handleStart} loading={starting} disabled={!browserOk || starting}>
                <Icon name="mic" size={20} />
                Start Live Session
              </Button>
              <p className="text-center text-[11px] text-muted mt-2">
                5 questions · Voice-based · Adaptive difficulty · Instant AI feedback
              </p>
            </motion.div>

            {/* How it works */}
            <motion.div variants={item}>
              <Card glass>
                <h3 className="text-sm font-bold text-white mb-3">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { icon: 'play_circle', title: 'Start', desc: 'AI asks you a question via voice' },
                    { icon: 'mic', title: 'Speak', desc: 'Answer naturally using your microphone' },
                    { icon: 'smart_toy', title: 'Evaluate', desc: 'AI scores and provides instant feedback' },
                    { icon: 'analytics', title: 'Improve', desc: 'Get detailed session analytics' },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(13,162,231,0.1)', border: '1px solid rgba(13,162,231,0.15)' }}>
                        <Icon name={step.icon} size={20} className="text-accent" />
                      </div>
                      <p className="text-xs font-bold text-white">{step.title}</p>
                      <p className="text-[10px] text-muted mt-0.5">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  LIVE SESSION SCREEN                                              */}
        {/* ================================================================ */}

        {isInSession && (
          <motion.div key="session" variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="space-y-5">
            {/* Status Bar */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant="accent">Q{voice.currentIdx + 1} of {voice.totalQuestions}</Badge>
                  <Badge variant={voice.difficulty === 'HARD' ? 'error' : voice.difficulty === 'MEDIUM' ? 'warning' : 'success'} size="sm">
                    {voice.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(13,162,231,0.08)', border: '1px solid rgba(13,162,231,0.15)' }}>
                    <Icon name="timer" size={16} className="text-accent" />
                    <span className="text-sm font-mono font-bold text-white">{formatTime(voice.sessionTimer)}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={voice.endSession}>
                    <Icon name="stop" size={16} /> End Session
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Question Display */}
            <motion.div variants={item}>
              <Card glass glow>
                <div className="flex flex-col items-center py-4">
                  {/* Question text */}
                  {voice.currentQuestion && (
                    <div className="text-center mb-6 max-w-2xl">
                      <p className="text-xs text-muted mb-2">{voice.currentQuestion.category || voice.currentQuestion.type}</p>
                      <p className="text-white text-base md:text-lg leading-relaxed">{voice.currentQuestion.question}</p>
                    </div>
                  )}

                  {/* Mic Visualizer */}
                  <MicVisualizer phase={voice.phase} />

                  {/* Phase indicator */}
                  <p className="text-sm text-secondary mt-4 font-medium">
                    {voice.phase === 'listening' && 'Listening... speak your answer'}
                    {voice.phase === 'processing' && 'Evaluating your answer...'}
                    {voice.phase === 'speaking' && 'AI is speaking...'}
                    {voice.phase === 'idle' && !voice.evaluation && 'Ready'}
                    {voice.phase === 'idle' && voice.evaluation && 'Answer evaluated'}
                  </p>

                  {/* Live Transcript */}
                  {(voice.transcript || voice.interimTranscript) && (
                    <div className="mt-4 w-full max-w-2xl p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="subtitles" size={14} className="text-accent" />
                        <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">Your Answer</span>
                      </div>
                      <p className="text-sm text-white leading-relaxed">
                        {voice.transcript}
                        {voice.interimTranscript && <span className="text-muted italic"> {voice.interimTranscript}</span>}
                      </p>
                    </div>
                  )}

                  {/* Evaluation Result */}
                  <AnimatePresence>
                    {voice.evaluation && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full max-w-2xl overflow-hidden mt-4">
                        <div className="p-4 rounded-xl" style={{ background: voice.evaluation.score >= 60 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${voice.evaluation.score >= 60 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-2xl font-extrabold ${voice.evaluation.score >= 60 ? 'text-success' : 'text-error'}`}>{voice.evaluation.score}/100</span>
                            <Badge variant={voice.evaluation.score >= 60 ? 'success' : 'error'} size="sm">
                              {voice.evaluation.score >= 80 ? 'Excellent' : voice.evaluation.score >= 60 ? 'Good' : voice.evaluation.score >= 40 ? 'Fair' : 'Needs Work'}
                            </Badge>
                          </div>
                          <p className="text-sm text-secondary mb-3">{voice.evaluation.feedback}</p>
                          {voice.evaluation.strengths.length > 0 && (
                            <div className="mb-2">
                              <p className="text-[11px] text-success font-semibold mb-1">Strengths:</p>
                              {voice.evaluation.strengths.map((s, i) => (
                                <p key={i} className="text-[11px] text-secondary flex items-start gap-1"><Icon name="check" size={12} className="text-success mt-0.5" /> {s}</p>
                              ))}
                            </div>
                          )}
                          {voice.evaluation.improvements.length > 0 && (
                            <div>
                              <p className="text-[11px] text-warning font-semibold mb-1">Improvements:</p>
                              {voice.evaluation.improvements.map((s, i) => (
                                <p key={i} className="text-[11px] text-secondary flex items-start gap-1"><Icon name="lightbulb" size={12} className="text-warning mt-0.5" /> {s}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>

            {/* Controls */}
            <motion.div variants={item}>
              <div className="flex items-center justify-center gap-3">
                {voice.phase === 'listening' ? (
                  <Button variant="secondary" size="md" onClick={voice.stopListening}>
                    <Icon name="stop" size={18} /> Stop Recording
                  </Button>
                ) : voice.evaluation ? (
                  <Button variant="primary" size="md" onClick={voice.nextQuestion}>
                    {voice.currentIdx < voice.totalQuestions - 1 ? (
                      <>Next Question <Icon name="arrow_forward" size={18} /></>
                    ) : (
                      <>Finish Session <Icon name="check_circle" size={18} /></>
                    )}
                  </Button>
                ) : voice.phase === 'idle' && !voice.evaluation && voice.transcript ? (
                  <Button variant="primary" size="md" onClick={voice.submitAnswer}>
                    <Icon name="send" size={18} /> Submit Answer
                  </Button>
                ) : null}

                {voice.phase !== 'processing' && voice.phase !== 'speaking' && (
                  <Button variant="ghost" size="md" onClick={voice.skipQuestion}>
                    <Icon name="skip_next" size={18} /> Skip
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div variants={item}>
              <div className="flex items-center gap-3">
                <ProgressBar value={((voice.currentIdx + (voice.evaluation ? 1 : 0)) / voice.totalQuestions) * 100} color="accent" size="sm" className="flex-1" />
                <span className="text-[11px] text-muted">{voice.currentIdx + (voice.evaluation ? 1 : 0)}/{voice.totalQuestions} completed</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/*  RESULTS SCREEN                                                   */}
        {/* ================================================================ */}

        {showResults && voice.result && (
          <motion.div key="results" variants={fadeScale} initial="hidden" animate="visible" exit="exit" className="space-y-5">
            {/* Score Overview */}
            <motion.div variants={item}>
              <Card glass glow>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreRing score={voice.result.overallScore} />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-bold text-white mb-1">
                      {voice.result.overallScore >= 70 ? 'Great Performance!' : voice.result.overallScore >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-secondary text-sm mb-3">{voice.result.feedback}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5"><Icon name="timer" size={14} className="text-accent" /><span className="text-secondary">Duration: {formatTime(voice.result.duration)}</span></div>
                      <div className="flex items-center gap-1.5"><Icon name="help" size={14} className="text-accent" /><span className="text-secondary">{voice.result.qaHistory.length} Questions</span></div>
                      <div className="flex items-center gap-1.5"><Icon name="speed" size={14} className="text-accent" /><span className="text-secondary">Final: {voice.difficulty}</span></div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Speech Analysis */}
            {voice.result.speechAnalysis && (
              <motion.div variants={item}>
                <Card glass>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="record_voice_over" size={18} className="text-accent" />
                    <h3 className="text-sm font-bold text-white">Speech Analysis</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Confidence', value: voice.result.speechAnalysis.confidence || 'N/A', icon: 'sentiment_satisfied' },
                      { label: 'Clarity', value: voice.result.speechAnalysis.clarity || 'N/A', icon: 'visibility' },
                      { label: 'Pace', value: voice.result.speechAnalysis.pace || 'N/A', icon: 'speed' },
                      { label: 'Filler Words', value: voice.result.speechAnalysis.fillerWords || 'N/A', icon: 'edit_note' },
                    ].map((m) => (
                      <div key={m.label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Icon name={m.icon} size={18} className="text-accent mx-auto mb-1" />
                        <p className="text-xs font-bold text-white">{typeof m.value === 'number' ? `${m.value}%` : m.value}</p>
                        <p className="text-[10px] text-muted">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Per-Question Breakdown */}
            <motion.div variants={item}>
              <Card glass>
                <h3 className="text-sm font-bold text-white mb-3">Question-by-Question Breakdown</h3>
                <div className="space-y-3">
                  {voice.result.qaHistory.map((qa, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">Q{i + 1}: {qa.question.question}</p>
                        </div>
                        {qa.evaluation && (
                          <Badge variant={qa.evaluation.score >= 60 ? 'success' : qa.evaluation.score >= 40 ? 'warning' : 'error'} size="sm">
                            {qa.evaluation.score}/100
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-secondary mb-1">
                        <span className="text-muted">Your answer:</span> {qa.transcript === '(skipped)' ? <span className="italic text-muted">Skipped</span> : qa.transcript}
                      </p>
                      {qa.evaluation && (
                        <p className="text-[11px] text-muted">{qa.evaluation.feedback}</p>
                      )}
                      {qa.timeTaken > 0 && (
                        <p className="text-[10px] text-muted mt-1 flex items-center gap-1"><Icon name="timer" size={10} /> {qa.timeTaken}s</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Start New */}
            <motion.div variants={item} className="flex justify-center">
              <Button variant="primary" size="lg" onClick={voice.reset}>
                <Icon name="refresh" size={20} /> Start New Session
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AILive;
