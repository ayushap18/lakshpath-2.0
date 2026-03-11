import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import Icon from '../components/ui/Icon';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { useProctoring } from '../hooks/useProctoring';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { interviewAPI } from '../services/api';

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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CodingQuestion {
  problemStatement: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  difficulty: string;
  tags: string[];
  starterCode?: Record<string, string>;
}

interface CodeAnalysis {
  score: number;
  feedback: string;
  correctness: number;
  timeComplexity: string;
  spaceComplexity: string;
  codeQuality: number;
  edgeCaseHandling: number;
  namingConventions: number;
  strengths: string[];
  improvements: string[];
  optimalApproach?: string;
}

interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

type InterviewScreen = 'setup' | 'camera-check' | 'interview' | 'results';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COMPANIES = [
  { id: 'TCS', label: 'TCS', color: '#0066FF', icon: 'business' },
  { id: 'INFOSYS', label: 'Infosys', color: '#10B981', icon: 'apartment' },
  { id: 'WIPRO', label: 'Wipro', color: '#7C3AED', icon: 'corporate_fare' },
  { id: 'GOOGLE', label: 'Google', color: '#F59E0B', icon: 'search' },
  { id: 'AMAZON', label: 'Amazon', color: '#EF4444', icon: 'shopping_cart' },
  { id: 'MICROSOFT', label: 'Microsoft', color: '#3B82F6', icon: 'window' },
  { id: 'META', label: 'Meta', color: '#EC4899', icon: 'group' },
  { id: 'FLIPKART', label: 'Flipkart', color: '#F97316', icon: 'store' },
];

const DIFFICULTIES = [
  { id: 'EASY', label: 'Easy', color: '#10B981' },
  { id: 'MEDIUM', label: 'Medium', color: '#F59E0B' },
  { id: 'HARD', label: 'Hard', color: '#EF4444' },
];

const LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
];

const TOTAL_QUESTIONS = 5;

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

/* ------------------------------------------------------------------ */
/*  ScoreRing Component                                                */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={10} fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={10} fill="none" strokeLinecap="round"
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        strokeDasharray={circ} transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={size * 0.28} fontWeight="bold" transform={`rotate(90 ${size / 2} ${size / 2})`}>
        {score}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AICodeInterview() {
  const { addToast } = useToast();

  // Screen state
  const [screen, setScreen] = useState<InterviewScreen>('setup');

  // Setup state
  const [selectedCompany, setSelectedCompany] = useState('TCS');
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  // Interview state
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [code, setCode] = useState('');
  const [, setCodes] = useState<string[]>([]);
  const [analyses, setAnalyses] = useState<(CodeAnalysis | null)[]>([]);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [outputTab, setOutputTab] = useState<'output' | 'tests'>('output');
  const [rawOutput, setRawOutput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [autoEndReason, setAutoEndReason] = useState<string | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // Timer
  const [sessionTimer, setSessionTimer] = useState(0);
  const [questionTimers, setQuestionTimers] = useState<number[]>([]);
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Speaking state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Code execution
  const { executeCode, isExecuting } = useCodeExecution();

  // Proctoring
  const handleAutoEnd = useCallback(() => {
    addToast('error', 'Interview Terminated', 'Too many proctoring violations. Interview ended automatically.');
    setAutoEndReason('Suspicious activity: exceeded maximum violation threshold (5 warnings)');
    setScreen('results');
  }, [addToast]);

  // Ref to hold voice-warning handler (breaks circular dep: proctoring → speakText → proctoring)
  const firstWarningHandlerRef = useRef<(type: string, message: string) => void>();

  const proctoring = useProctoring({
    enabled: screen === 'camera-check' || screen === 'interview',
    maxViolations: 5,
    detectionIntervalMs: 3000,
    onMaxViolations: handleAutoEnd,
    onFirstWarning: (type, message) => firstWarningHandlerRef.current?.(type, message),
  });

  // Start/stop detection during camera-check and interview
  useEffect(() => {
    if ((screen === 'camera-check' || screen === 'interview') && proctoring.isCameraActive && proctoring.isModelLoaded) {
      proctoring.startDetection();
    }
    if (screen === 'interview') {
      proctoring.startAudioMonitoring();
    }
    return () => {
      if (screen !== 'camera-check' && screen !== 'interview') {
        proctoring.stopDetection();
      }
      if (screen !== 'interview') {
        proctoring.stopAudioMonitoring();
      }
    };
  }, [screen, proctoring.isCameraActive, proctoring.isModelLoaded, proctoring]);

  // Proctoring warning toasts
  useEffect(() => {
    if (proctoring.lastWarning && screen === 'interview') {
      if (proctoring.isFirstWarning) {
        addToast('info', 'First Warning', `${proctoring.lastWarning}. Next time will count as a violation.`);
      } else {
        const remaining = 5 - proctoring.violationCount;
        addToast('error', 'Proctoring Violation', `${proctoring.lastWarning}. ${remaining} warning(s) remaining.`);
      }
    }
  }, [proctoring.lastWarning, proctoring.violationCount, proctoring.isFirstWarning, screen, addToast]);

  // Timer
  useEffect(() => {
    if (screen === 'interview') {
      timerRef.current = setInterval(() => setSessionTimer(p => p + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen]);

  // Speak question using Web Speech API
  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    proctoring.setAISpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en-IN')) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => { setIsSpeaking(false); proctoring.setAISpeaking(false); };
    utterance.onerror = () => { setIsSpeaking(false); proctoring.setAISpeaking(false); };
    window.speechSynthesis.speak(utterance);
  }, [proctoring]);

  // Wire up first-warning voice handler (now that speakText is available)
  const FIRST_WARNING_VOICE: Record<string, string> = {
    TAB_SWITCH: 'Warning. You are switching tabs. Please stay on this window. Next time this will count as a proctoring violation.',
    MULTIPLE_PERSONS: 'Warning. Multiple persons detected in camera. Only one person is allowed. Next detection will count as a violation.',
    PHONE_DETECTED: 'Warning. A phone has been detected in the frame. Please remove it immediately. Next time will count as a violation.',
  };

  useEffect(() => {
    firstWarningHandlerRef.current = (type: string) => {
      speakText(FIRST_WARNING_VOICE[type] || 'Warning detected. Next occurrence will count as a violation.');
    };
  }, [speakText]);

  // Fetch a question
  const fetchQuestion = useCallback(async (index: number) => {
    setIsFetchingQuestion(true);
    try {
      const res = await interviewAPI.generateCodingQuestion({
        company: selectedCompany,
        difficulty: selectedDifficulty,
        language: selectedLanguage,
        questionIndex: index + 1,
      });
      const q = (res.data as any).question as CodingQuestion;
      setQuestions(prev => {
        const next = [...prev];
        next[index] = q;
        return next;
      });
      return q;
    } catch {
      addToast('error', 'Error', 'Failed to load question. Using fallback.');
      return null;
    } finally {
      setIsFetchingQuestion(false);
    }
  }, [selectedCompany, selectedDifficulty, selectedLanguage, addToast]);

  // Start interview (called from camera check)
  const startInterview = useCallback(async () => {
    const q = await fetchQuestion(0);
    if (q) {
      const starter = q.starterCode?.[selectedLanguage] || '';
      setCode(starter);
      setCodes([starter]);
      setAnalyses([null]);
      setQuestionTimers([]);
      questionStartRef.current = Date.now();
      setScreen('interview');
      // Speak the first question
      setTimeout(() => speakText(`Question 1. ${q.problemStatement.substring(0, 300)}`), 500);
    }
  }, [fetchQuestion, selectedLanguage, proctoring, speakText]);

  // Prefetch next question
  useEffect(() => {
    if (screen === 'interview' && currentIdx < TOTAL_QUESTIONS - 1 && !questions[currentIdx + 1]) {
      fetchQuestion(currentIdx + 1);
    }
  }, [screen, currentIdx, questions, fetchQuestion]);

  // Run code against test cases
  const handleRunCode = useCallback(async () => {
    const q = questions[currentIdx];
    if (!q) return;

    setRawOutput('Running...');
    setTestResults([]);
    setOutputTab('tests');

    const allTests = q.testCases;

    try {
      const results = await Promise.allSettled(
        allTests.map(tc => executeCode(selectedLanguage, code, tc.input))
      );

      const tcResults: TestCaseResult[] = results.map((r, i) => {
        const tc = allTests[i];
        if (r.status === 'fulfilled') {
          const actual = r.value.stdout.trim();
          return {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: actual,
            passed: actual === tc.expectedOutput.trim(),
          };
        }
        return {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Execution error',
          passed: false,
        };
      });

      setTestResults(tcResults);

      // Build raw output from first visible test
      const firstResult = results[0];
      if (firstResult?.status === 'fulfilled') {
        const r = firstResult.value;
        setRawOutput(r.stderr ? `${r.stdout}\n\nSTDERR:\n${r.stderr}` : r.stdout || '(no output)');
      } else {
        setRawOutput('Execution failed');
      }
    } catch {
      setRawOutput('Code execution service unavailable');
    }
  }, [questions, currentIdx, code, selectedLanguage, executeCode]);

  // Submit answer
  const handleSubmit = useCallback(async () => {
    const q = questions[currentIdx];
    if (!q) return;

    setIsSubmitting(true);
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);
    setQuestionTimers(prev => { const n = [...prev]; n[currentIdx] = timeTaken; return n; });

    // Save code for this question
    setCodes(prev => { const n = [...prev]; n[currentIdx] = code; return n; });

    // Run test cases if not already run
    let currentTestResults = testResults;
    if (testResults.length === 0) {
      try {
        const results = await Promise.allSettled(
          q.testCases.map(tc => executeCode(selectedLanguage, code, tc.input))
        );
        currentTestResults = results.map((r, i) => {
          const tc = q.testCases[i];
          if (r.status === 'fulfilled') {
            const actual = r.value.stdout.trim();
            return { input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: actual, passed: actual === tc.expectedOutput.trim() };
          }
          return { input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: 'Error', passed: false };
        });
        setTestResults(currentTestResults);
      } catch {
        currentTestResults = q.testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: 'Error', passed: false }));
      }
    }

    // Get AI analysis
    try {
      const res = await interviewAPI.analyzeCode({
        problemStatement: q.problemStatement,
        code,
        language: selectedLanguage,
        testResults: currentTestResults,
        timeTaken,
      });
      const analysis = (res.data as any).analysis as CodeAnalysis;
      setAnalyses(prev => { const n = [...prev]; n[currentIdx] = analysis; return n; });
    } catch {
      const passed = currentTestResults.filter(t => t.passed).length;
      const total = currentTestResults.length;
      setAnalyses(prev => {
        const n = [...prev];
        n[currentIdx] = {
          score: total > 0 ? Math.round((passed / total) * 100) : 0,
          feedback: `${passed}/${total} test cases passed.`,
          correctness: total > 0 ? Math.round((passed / total) * 100) : 0,
          timeComplexity: 'N/A', spaceComplexity: 'N/A',
          codeQuality: 50, edgeCaseHandling: 50, namingConventions: 50,
          strengths: [], improvements: [],
        };
        return n;
      });
    }

    setIsSubmitting(false);

    // Move to next question or results
    if (currentIdx < TOTAL_QUESTIONS - 1) {
      const nextQ = questions[currentIdx + 1];
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const starter = nextQ?.starterCode?.[selectedLanguage] || '';
      setCode(starter);
      setTestResults([]);
      setRawOutput('');
      setOutputTab('output');
      questionStartRef.current = Date.now();
      setCodes(prev => { const n = [...prev]; if (!n[nextIdx]) n[nextIdx] = starter; return n; });
      setAnalyses(prev => { const n = [...prev]; if (n.length <= nextIdx) n.push(null); return n; });
      if (nextQ) {
        setTimeout(() => speakText(`Question ${nextIdx + 1}. ${nextQ.problemStatement.substring(0, 300)}`), 300);
      }
    } else {
      proctoring.stopDetection();
      proctoring.stopAudioMonitoring();
      setScreen('results');
    }
  }, [questions, currentIdx, code, testResults, selectedLanguage, executeCode, proctoring, speakText]);

  // Skip question
  const handleSkip = useCallback(() => {
    setCodes(prev => { const n = [...prev]; n[currentIdx] = code; return n; });
    setAnalyses(prev => { const n = [...prev]; n[currentIdx] = { score: 0, feedback: 'Skipped', correctness: 0, timeComplexity: 'N/A', spaceComplexity: 'N/A', codeQuality: 0, edgeCaseHandling: 0, namingConventions: 0, strengths: [], improvements: ['Question was skipped'] }; return n; });
    const timeTaken = Math.round((Date.now() - questionStartRef.current) / 1000);
    setQuestionTimers(prev => { const n = [...prev]; n[currentIdx] = timeTaken; return n; });

    if (currentIdx < TOTAL_QUESTIONS - 1) {
      const nextIdx = currentIdx + 1;
      const nextQ = questions[nextIdx];
      setCurrentIdx(nextIdx);
      const starter = nextQ?.starterCode?.[selectedLanguage] || '';
      setCode(starter);
      setTestResults([]);
      setRawOutput('');
      questionStartRef.current = Date.now();
      if (nextQ) setTimeout(() => speakText(`Question ${nextIdx + 1}. ${nextQ.problemStatement.substring(0, 300)}`), 300);
    } else {
      proctoring.stopDetection();
      proctoring.stopAudioMonitoring();
      setScreen('results');
    }
  }, [currentIdx, code, questions, selectedLanguage, proctoring, speakText]);

  // Keyboard shortcut: Ctrl+Enter to run code
  useEffect(() => {
    if (screen !== 'interview') return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, handleRunCode]);

  // Calculate results
  const overallScore = analyses.filter(Boolean).length > 0
    ? Math.round(analyses.filter(Boolean).reduce((s, a) => s + (a?.score || 0), 0) / analyses.filter(Boolean).length)
    : 0;

  const proctoringStatus = autoEndReason ? 'Terminated' : proctoring.violationCount > 0 ? 'Flagged' : 'Clean';

  /* ================================================================== */
  /*  SETUP SCREEN                                                       */
  /* ================================================================== */

  if (screen === 'setup') {
    return (
      <motion.div className="p-6 max-w-5xl mx-auto space-y-6" variants={container} initial="hidden" animate="visible">
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold text-primary">AI Code Interviewer</h1>
          <p className="text-secondary mt-1">Real-time proctored coding interview with AI evaluation</p>
        </motion.div>

        {/* Company Selection */}
        <motion.div variants={item}>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Target Company</h3>
            <div className="grid grid-cols-4 gap-2">
              {COMPANIES.map(c => (
                <motion.button key={c.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCompany(c.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    selectedCompany === c.id
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-white/5 bg-white/[0.02] text-secondary hover:border-white/[0.06] hover:bg-white/[0.04]'
                  }`}>
                  <Icon name={c.icon} size={18} style={{ color: c.color }} />
                  {c.label}
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Difficulty + Language */}
        <motion.div variants={item} className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Difficulty</h3>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <motion.button key={d.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selectedDifficulty === d.id
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-white/5 bg-white/[0.02] text-secondary hover:border-white/[0.06]'
                  }`}>
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: d.color }} />
                  {d.label}
                </motion.button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Language</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <motion.button key={l.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedLanguage(l.id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selectedLanguage === l.id
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-white/5 bg-white/[0.02] text-secondary hover:border-white/[0.06]'
                  }`}>
                  {l.label}
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div variants={item}>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">How It Works</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: 'videocam', title: 'Camera On', desc: 'Proctored with AI detection' },
                { icon: 'code', title: '5 Questions', desc: 'Company-specific coding problems' },
                { icon: 'play_arrow', title: 'Run & Test', desc: 'Real-time code compilation' },
                { icon: 'analytics', title: 'AI Review', desc: 'Detailed code analysis & score' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                    <Icon name={s.icon} size={20} className="text-accent" />
                  </div>
                  <p className="text-sm font-medium text-primary">{s.title}</p>
                  <p className="text-xs text-tertiary mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Proctoring Rules */}
        <motion.div variants={item}>
          <Card className="p-4 border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <Icon name="shield" size={20} className="text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-300">Proctoring Rules</p>
                <ul className="text-xs text-yellow-300/70 mt-1 space-y-0.5 list-disc list-inside">
                  <li>Camera must be on throughout the interview</li>
                  <li>Only one person allowed in frame</li>
                  <li>No phones, books, or other devices</li>
                  <li>Switching tabs/windows will trigger a warning</li>
                  <li>Talking or voice activity will be monitored</li>
                  <li>5 violations = automatic termination</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Button onClick={() => { proctoring.startCamera(); setScreen('camera-check'); }} className="w-full py-3 text-base">
            <Icon name="videocam" size={20} className="mr-2" /> Start Interview
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  /* ================================================================== */
  /*  CAMERA CHECK SCREEN                                                */
  /* ================================================================== */

  if (screen === 'camera-check') {
    const allReady = proctoring.isCameraActive && proctoring.isModelLoaded && proctoring.personDetected;

    return (
      <motion.div className="p-6 max-w-2xl mx-auto space-y-6" variants={container} initial="hidden" animate="visible">
        <motion.div variants={item}>
          <h2 className="text-xl font-bold text-primary">Camera Check</h2>
          <p className="text-secondary text-sm mt-1">Verify your camera and proctoring setup before starting</p>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-4 overflow-hidden">
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={proctoring.videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              {!proctoring.isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
                  <div className="text-center">
                    <Icon name="videocam_off" size={48} className="text-tertiary mx-auto mb-2" />
                    <p className="text-secondary text-sm">
                      {proctoring.cameraError || 'Initializing camera...'}
                    </p>
                    {proctoring.cameraError && (
                      <Button onClick={proctoring.startCamera} className="mt-3 text-sm">
                        Retry Camera
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Status Checks */}
        <motion.div variants={item}>
          <Card className="p-4 space-y-3">
            {[
              { label: 'Camera Active', ready: proctoring.isCameraActive, icon: 'videocam' },
              { label: 'AI Model Loaded', ready: proctoring.isModelLoaded, icon: 'psychology' },
              { label: 'Person Verified', ready: proctoring.personDetected, icon: 'person' },
            ].map(check => (
              <div key={check.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  check.ready ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                }`}>
                  <Icon name={check.ready ? 'check_circle' : 'hourglass_top'}
                    size={18} className={check.ready ? 'text-emerald-400' : 'text-tertiary animate-spin'} />
                </div>
                <span className={`text-sm font-medium ${check.ready ? 'text-emerald-400' : 'text-secondary'}`}>
                  {check.label}
                </span>
                {check.ready && <Badge variant="success" size="sm">Ready</Badge>}
              </div>
            ))}
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex gap-3">
          <Button variant="secondary" onClick={() => { proctoring.stopCamera(); setScreen('setup'); }} className="flex-1">
            Back
          </Button>
          <Button onClick={startInterview} disabled={!allReady} className="flex-1">
            {isFetchingQuestion ? 'Loading...' : 'Begin Interview'}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  /* ================================================================== */
  /*  INTERVIEW SCREEN                                                   */
  /* ================================================================== */

  if (screen === 'interview') {
    const currentQ = questions[currentIdx];
    const monacoLang = selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'c' ? 'c' : selectedLanguage;
    const companyData = COMPANIES.find(c => c.id === selectedCompany);

    return (
      <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-mono text-secondary">
              <Icon name="timer" size={16} className="text-accent" />
              {formatTime(sessionTimer)}
            </div>
            <Badge variant="accent" size="sm">Q {currentIdx + 1}/{TOTAL_QUESTIONS}</Badge>
            <Badge variant={selectedDifficulty === 'EASY' ? 'success' : selectedDifficulty === 'MEDIUM' ? 'warning' : 'error'} size="sm">
              {selectedDifficulty}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Violation counter */}
            <div className={`flex items-center gap-1.5 text-sm ${proctoring.violationCount > 0 ? 'text-red-400' : 'text-secondary'}`}>
              <Icon name="shield" size={16} />
              {proctoring.violationCount}/5
            </div>

            {/* Voice indicator */}
            {proctoring.isVoiceDetected && (
              <div className="flex items-center gap-1 text-red-400 text-xs">
                <Icon name="mic" size={14} className="animate-pulse" />
                Voice
              </div>
            )}

            <Button variant="secondary" size="sm" onClick={() => { proctoring.stopDetection(); proctoring.stopAudioMonitoring(); setScreen('results'); }}>
              End
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT PANEL — Cameras + Question */}
          <div className="w-[40%] border-r border-white/5 overflow-y-auto p-4 space-y-4">

            {/* AI Interviewer + User Camera */}
            <div className="flex items-stretch gap-3">
              {/* AI Interviewer Avatar */}
              <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-accent/5 to-violet-500/5 border border-accent/10">
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center ${
                    isSpeaking ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#0a0a0f]' : ''
                  }`}>
                    <Icon name="smart_toy" size={24} className="text-white" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0f] ${
                    isSpeaking ? 'bg-accent animate-pulse' : 'bg-emerald-500'
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">AI Interviewer</p>
                  <p className="text-xs text-secondary">{companyData?.label || selectedCompany}</p>
                  {isSpeaking && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3].map(i => (
                          <motion.div key={i} className="w-0.5 bg-accent rounded-full"
                            animate={{ height: [3, 10, 3] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-accent ml-1">Speaking...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Camera */}
              <div className="relative w-36 rounded-xl overflow-hidden border border-white/[0.06] bg-black shrink-0">
                <video ref={proctoring.videoRef} autoPlay playsInline muted
                  className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-white">YOU</span>
                </div>
                {proctoring.isVoiceDetected && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-red-500/80 rounded-full px-2 py-0.5">
                    <span className="text-[8px] font-bold text-white flex items-center gap-1">
                      <Icon name="mic" size={10} /> Voice
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Question Content */}
            {isFetchingQuestion || !currentQ ? (
              <div className="space-y-5">
                <Skeleton variant="rectangular" height={200} className="rounded-2xl" />
                <Skeleton variant="rectangular" height={300} className="rounded-2xl" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentQ.tags.map(tag => (
                    <Badge key={tag} variant="accent" size="sm">{tag}</Badge>
                  ))}
                  {isSpeaking && (
                    <Badge variant="warning" size="sm">
                      <Icon name="volume_up" size={12} className="mr-1 animate-pulse" /> Speaking
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-primary mb-2">Problem Statement</h3>
                  <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{currentQ.problemStatement}</p>
                </div>

                {currentQ.constraints.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-1">Constraints</h4>
                    <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                      {currentQ.constraints.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {currentQ.examples.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2">Examples</h4>
                    {currentQ.examples.map((ex, i) => (
                      <div key={i} className="mb-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                        <div className="mb-1"><span className="text-tertiary">Input:</span> <code className="text-accent">{ex.input}</code></div>
                        <div className="mb-1"><span className="text-tertiary">Output:</span> <code className="text-emerald-400">{ex.output}</code></div>
                        {ex.explanation && <div className="text-tertiary mt-1">Explanation: {ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Visible test cases */}
                <div>
                  <h4 className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2">Test Cases</h4>
                  {currentQ.testCases.filter(t => !t.isHidden).map((tc, i) => (
                    <div key={i} className="mb-2 p-2 rounded bg-white/[0.02] border border-white/5 text-xs font-mono">
                      <span className="text-tertiary">In:</span> {tc.input} → <span className="text-emerald-400">{tc.expectedOutput}</span>
                    </div>
                  ))}
                  {currentQ.testCases.filter(t => t.isHidden).length > 0 && (
                    <p className="text-xs text-tertiary">+ {currentQ.testCases.filter(t => t.isHidden).length} hidden test case(s)</p>
                  )}
                </div>

                <div className="text-xs text-tertiary">
                  <span className="mr-3">Expected: {currentQ.expectedTimeComplexity}</span>
                  <span>{currentQ.expectedSpaceComplexity}</span>
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL — Editor + Output */}
          <div className="w-[60%] flex flex-col">
            {/* Monaco Editor */}
            <div className="flex-1 min-h-0" style={{ height: '60%' }}>
              <Editor
                height="100%"
                language={monacoLang}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  padding: { top: 12 },
                }}
                loading={
                  <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                    <Icon name="hourglass_top" size={24} className="text-accent animate-spin" />
                    <span className="text-secondary ml-2 text-sm">Loading editor...</span>
                  </div>
                }
              />
            </div>

            {/* Output Console */}
            <div className="border-t border-white/5" style={{ height: '40%' }}>
              <div className="flex items-center border-b border-white/5">
                <button onClick={() => setOutputTab('output')}
                  className={`px-4 py-2 text-xs font-medium ${outputTab === 'output' ? 'text-accent border-b-2 border-accent' : 'text-tertiary'}`}>
                  Output
                </button>
                <button onClick={() => setOutputTab('tests')}
                  className={`px-4 py-2 text-xs font-medium ${outputTab === 'tests' ? 'text-accent border-b-2 border-accent' : 'text-tertiary'}`}>
                  Test Results {testResults.length > 0 && `(${testResults.filter(t => t.passed).length}/${testResults.length})`}
                </button>
              </div>

              <div className="overflow-y-auto p-3 h-[calc(100%-33px)]">
                {outputTab === 'output' ? (
                  <pre className="text-xs font-mono text-secondary whitespace-pre-wrap">
                    {rawOutput || 'Run your code to see output...'}
                  </pre>
                ) : (
                  <div className="space-y-2">
                    {testResults.length === 0 ? (
                      <p className="text-xs text-tertiary">Run your code to see test results...</p>
                    ) : (
                      testResults.map((tr, i) => {
                        const tc = questions[currentIdx]?.testCases[i];
                        const isHidden = tc?.isHidden;
                        return (
                          <div key={i} className={`p-2 rounded border text-xs ${
                            tr.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Icon name={tr.passed ? 'check_circle' : 'cancel'} size={14}
                                className={tr.passed ? 'text-emerald-400' : 'text-red-400'} />
                              <span className={`font-medium ${tr.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                Test {i + 1} {isHidden ? '(Hidden)' : ''} — {tr.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                            {!isHidden && (
                              <div className="font-mono text-tertiary ml-5">
                                <div>Input: {tr.input}</div>
                                <div>Expected: {tr.expectedOutput}</div>
                                {!tr.passed && <div className="text-red-400">Got: {tr.actualOutput}</div>}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-surface/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleRunCode} disabled={isExecuting || !currentQ}>
              <Icon name="play_arrow" size={16} className="mr-1" />
              {isExecuting ? 'Running...' : 'Run Code'}
              <span className="ml-2 text-[10px] text-tertiary">(Ctrl+Enter)</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleSkip} disabled={isSubmitting}>
              Skip
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !currentQ}>
              <Icon name="send" size={16} className="mr-1" />
              {isSubmitting ? 'Submitting...' : currentIdx < TOTAL_QUESTIONS - 1 ? 'Submit & Next' : 'Submit & Finish'}
            </Button>
          </div>
        </div>

        {/* Proctoring Warning Overlay */}
        <AnimatePresence>
          {proctoring.lastWarning && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl backdrop-blur-sm shadow-2xl ${
                proctoring.isFirstWarning
                  ? 'bg-amber-500/90 border border-amber-400/50'
                  : 'bg-red-500/90 border border-red-400/50'
              }`}>
              <div className="flex items-center gap-2">
                <Icon name="warning" size={20} className="text-white" />
                <span className="text-white text-sm font-medium">
                  {proctoring.isFirstWarning ? `${proctoring.lastWarning} — this is a warning` : proctoring.lastWarning}
                </span>
                {proctoring.isFirstWarning
                  ? <Badge variant="warning" size="sm">Warning</Badge>
                  : <Badge variant="error" size="sm">{5 - proctoring.violationCount} left</Badge>
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ================================================================== */
  /*  RESULTS SCREEN                                                     */
  /* ================================================================== */

  return (
    <motion.div className="p-6 max-w-4xl mx-auto space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-primary">Interview Results</h1>
        <p className="text-secondary text-sm mt-1">{selectedCompany} — {selectedDifficulty} — {selectedLanguage}</p>
      </motion.div>

      {/* Auto-end banner */}
      {autoEndReason && (
        <motion.div variants={item}>
          <Card className="p-4 border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-3">
              <Icon name="gpp_bad" size={24} className="text-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-400">Interview Terminated</p>
                <p className="text-xs text-red-300/70">{autoEndReason}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Score + Proctoring Summary */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        <Card className="p-6 flex flex-col items-center justify-center">
          <ScoreRing score={overallScore} size={140} />
          <p className="text-lg font-bold text-primary mt-3">
            {overallScore >= 70 ? 'Excellent!' : overallScore >= 40 ? 'Good Effort' : 'Keep Practicing'}
          </p>
          <p className="text-xs text-secondary mt-1">
            {analyses.filter(Boolean).length} of {TOTAL_QUESTIONS} questions evaluated  |  {formatTime(sessionTimer)}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Proctoring Report</h3>
          <div className="flex items-center gap-2 mb-4">
            <Icon name={proctoringStatus === 'Clean' ? 'verified_user' : 'gpp_bad'} size={24}
              className={proctoringStatus === 'Clean' ? 'text-emerald-400' : 'text-red-400'} />
            <Badge variant={proctoringStatus === 'Clean' ? 'success' : 'error'}>{proctoringStatus}</Badge>
          </div>
          <div className="space-y-2">
            {['TAB_SWITCH', 'MULTIPLE_PERSONS', 'NO_PERSON', 'PHONE_DETECTED', 'SUSPICIOUS_OBJECT', 'VOICE_DETECTED'].map(type => {
              const count = proctoring.violations.filter(v => v.type === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="text-secondary">{type.replace(/_/g, ' ')}</span>
                  <Badge variant="error" size="sm">{count}</Badge>
                </div>
              );
            })}
            {proctoring.violationCount === 0 && (
              <p className="text-xs text-emerald-400">No violations detected</p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Code Quality Summary */}
      {analyses.filter(Boolean).length > 0 && (
        <motion.div variants={item}>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Code Quality Averages</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Correctness', key: 'correctness' },
                { label: 'Code Quality', key: 'codeQuality' },
                { label: 'Edge Cases', key: 'edgeCaseHandling' },
                { label: 'Naming', key: 'namingConventions' },
              ].map(m => {
                const vals = analyses.filter(Boolean).map(a => (a as any)[m.key] || 0);
                const avg = vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
                const color = avg >= 70 ? 'text-emerald-400' : avg >= 40 ? 'text-yellow-400' : 'text-red-400';
                return (
                  <div key={m.key} className="text-center">
                    <p className={`text-2xl font-bold ${color}`}>{avg}</p>
                    <p className="text-xs text-tertiary mt-1">{m.label}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Per-Question Breakdown */}
      <motion.div variants={item}>
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Question Breakdown</h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            if (!q) return null;
            const a = analyses[i];
            const isExpanded = expandedQ === i;
            return (
              <Card key={i} className="overflow-hidden">
                <button onClick={() => setExpandedQ(isExpanded ? null : i)}
                  className="w-full p-4 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      a && a.score >= 70 ? 'bg-emerald-500/10' : a && a.score >= 40 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                    }`}>
                      <span className={`text-sm font-bold ${
                        a && a.score >= 70 ? 'text-emerald-400' : a && a.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{a?.score ?? '-'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary truncate max-w-md">
                        Q{i + 1}: {q.problemStatement.substring(0, 80)}...
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {q.tags.map(t => <Badge key={t} variant="accent" size="sm">{t}</Badge>)}
                        {questionTimers[i] && (
                          <span className="text-[10px] text-tertiary">{formatTime(questionTimers[i])}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={20} className="text-tertiary" />
                </button>

                <AnimatePresence>
                  {isExpanded && a && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-sm text-secondary">{a.feedback}</p>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <p className="text-tertiary">Time Complexity</p>
                            <p className="text-primary font-mono">{a.timeComplexity}</p>
                          </div>
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <p className="text-tertiary">Space Complexity</p>
                            <p className="text-primary font-mono">{a.spaceComplexity}</p>
                          </div>
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <p className="text-tertiary">Correctness</p>
                            <p className="text-primary font-mono">{a.correctness}%</p>
                          </div>
                        </div>
                        {a.strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-emerald-400 mb-1">Strengths</p>
                            <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                              {a.strengths.map((s, si) => <li key={si}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {a.improvements.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-yellow-400 mb-1">Improvements</p>
                            <ul className="text-xs text-secondary space-y-0.5 list-disc list-inside">
                              {a.improvements.map((im, ii) => <li key={ii}>{im}</li>)}
                            </ul>
                          </div>
                        )}
                        {a.optimalApproach && (
                          <div className="p-2 rounded bg-accent/5 border border-accent/20 text-xs text-accent">
                            <Icon name="lightbulb" size={14} className="inline mr-1" />
                            {a.optimalApproach}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Button onClick={() => {
          setScreen('setup');
          setQuestions([]);
          setCodes([]);
          setAnalyses([]);
          setTestResults([]);
          setCurrentIdx(0);
          setSessionTimer(0);
          setAutoEndReason(null);
          setRawOutput('');
          setCode('');
          setExpandedQ(null);
          proctoring.stopCamera();
        }} className="w-full py-3">
          Start New Interview
        </Button>
      </motion.div>
    </motion.div>
  );
}
