import { useState, useRef, useCallback, useEffect } from 'react';
import { interviewAPI } from '../services/api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SessionPhase = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused';

export interface VoiceQuestion {
  id: string;
  question: string;
  type?: string;
  difficulty?: string;
  category?: string;
}

export interface VoiceEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface QARecord {
  question: VoiceQuestion;
  transcript: string;
  evaluation: VoiceEvaluation | null;
  timeTaken: number;
}

export interface SessionResult {
  overallScore: number;
  feedback: string;
  speechAnalysis: any;
  qaHistory: QARecord[];
  duration: number;
}

/* ------------------------------------------------------------------ */
/*  Browser Speech API helpers                                         */
/* ------------------------------------------------------------------ */

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const isSpeechSupported = !!SpeechRecognitionAPI;
export const isSynthesisSupported = 'speechSynthesis' in window;

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useVoiceSession() {
  /* State --------------------------------------------------------------- */
  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<VoiceQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<VoiceEvaluation | null>(null);
  const [qaHistory, setQaHistory] = useState<QARecord[]>([]);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  /* Refs ---------------------------------------------------------------- */
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerStartRef = useRef(0);
  const fullTranscriptRef = useRef('');
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const consecutiveScoresRef = useRef<number[]>([]);

  /* Session timer ------------------------------------------------------- */
  useEffect(() => {
    if (sessionId && !result) {
      sessionTimerRef.current = setInterval(() => setSessionTimer((t) => t + 1), 1000);
    }
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, [sessionId, result]);

  /* Cleanup on unmount ------------------------------------------------- */
  useEffect(() => {
    return () => {
      stopRecognition();
      window.speechSynthesis?.cancel();
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Speech Synthesis ────────────────────────────────────────────── */

  const speak = useCallback(async (text: string): Promise<void> => {
    setPhase('speaking');
    // Try ElevenLabs via backend proxy first
    try {
      const response = await interviewAPI.textToSpeech(text);
      if (response.data && !(response.data as any).fallback) {
        const blob = new Blob([response.data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        return new Promise((resolve) => {
          audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
          audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          audio.play().catch(() => resolve());
        });
      }
    } catch {
      // Fall through to Web Speech API
    }

    // Fallback: Web Speech API
    return new Promise((resolve) => {
      if (!isSynthesisSupported) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith('en-IN')) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  /* ── Speech Recognition ─────────────────────────────────────────── */

  const stopRecognition = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    answerStartRef.current = Date.now();

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    let finalText = '';
    let hasSpoken = false;

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (hasSpoken && finalText.trim()) {
          stopRecognition();
        }
      }, 3000);
    };

    recognition.onresult = (event: any) => {
      hasSpoken = true;
      let interim = '';
      finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalText);
      setInterimTranscript(interim);
      resetSilenceTimer();
    };

    recognition.onend = () => {
      const captured = finalText.trim();
      if (captured) {
        setTranscript(captured);
        setInterimTranscript('');
      }
      // If we captured speech, it'll be submitted by the caller
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // Ignore — user just hasn't spoken yet
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    setPhase('listening');
    recognition.start();
    resetSilenceTimer();
  }, [stopRecognition]);

  /* ── Core session flow ──────────────────────────────────────────── */

  const startSession = useCallback(async (type: string, diff: string, role?: string) => {
    setError(null);
    setPhase('processing');
    setResult(null);
    setQaHistory([]);
    setCurrentIdx(0);
    setSessionTimer(0);
    setDifficulty(diff.toUpperCase() as any);
    consecutiveScoresRef.current = [];
    fullTranscriptRef.current = '';

    try {
      const res = await interviewAPI.startSession(type.toUpperCase(), diff.toUpperCase(), role);
      const data = res.data?.data || res.data;
      const session = data.session;
      const qs: VoiceQuestion[] = (data.questions || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        difficulty: q.difficulty,
        category: q.category,
      }));

      setSessionId(session.id);
      setQuestions(qs);

      if (qs.length > 0) {
        // Speak the first question, then start listening
        await speak(`Question 1. ${qs[0].question}`);
        startListening();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session. Please try again.');
      setPhase('idle');
    }
  }, [speak, startListening]);

  const submitAnswer = useCallback(async () => {
    const currentQ = questions[currentIdx];
    if (!currentQ || !transcript.trim()) return;

    stopRecognition();
    setPhase('processing');
    const timeTaken = Math.round((Date.now() - answerStartRef.current) / 1000);
    fullTranscriptRef.current += `\nQ: ${currentQ.question}\nA: ${transcript}\n`;

    try {
      const res = await interviewAPI.submitAnswer(currentQ.id, transcript, timeTaken);
      const data = res.data?.data || res.data;
      const evalResult: VoiceEvaluation = {
        score: data.evaluation?.score ?? 0,
        feedback: data.evaluation?.feedback || 'Answer evaluated.',
        strengths: data.evaluation?.strengths || [],
        improvements: data.evaluation?.improvements || [],
      };

      setEvaluation(evalResult);
      setQaHistory((prev) => [...prev, { question: currentQ, transcript, evaluation: evalResult, timeTaken }]);

      // Adaptive difficulty
      consecutiveScoresRef.current.push(evalResult.score);
      if (consecutiveScoresRef.current.length >= 2) {
        const last2 = consecutiveScoresRef.current.slice(-2);
        if (last2.every((s) => s >= 80) && difficulty !== 'HARD') {
          setDifficulty((d) => d === 'EASY' ? 'MEDIUM' : 'HARD');
          consecutiveScoresRef.current = [];
        } else if (last2.every((s) => s < 40) && difficulty !== 'EASY') {
          setDifficulty((d) => d === 'HARD' ? 'MEDIUM' : 'EASY');
          consecutiveScoresRef.current = [];
        }
      }

      // Speak feedback
      const feedbackText = `Score: ${evalResult.score} out of 100. ${evalResult.feedback}`;
      await speak(feedbackText);

    } catch (err: any) {
      setEvaluation({ score: 0, feedback: 'Could not evaluate answer.', strengths: [], improvements: [] });
      setQaHistory((prev) => [...prev, { question: currentQ, transcript, evaluation: null, timeTaken }]);
    }
  }, [questions, currentIdx, transcript, stopRecognition, speak, difficulty]);

  const nextQuestion = useCallback(async () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      // End session
      await endSession();
      return;
    }

    setCurrentIdx(nextIdx);
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);

    const q = questions[nextIdx];
    await speak(`Question ${nextIdx + 1}. ${q.question}`);
    startListening();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, questions, speak, startListening]);

  const skipQuestion = useCallback(async () => {
    stopRecognition();
    const currentQ = questions[currentIdx];
    if (currentQ) {
      setQaHistory((prev) => [...prev, { question: currentQ, transcript: '(skipped)', evaluation: null, timeTaken: 0 }]);
    }
    await nextQuestion();
  }, [stopRecognition, questions, currentIdx, nextQuestion]);

  const endSession = useCallback(async () => {
    stopRecognition();
    window.speechSynthesis?.cancel();
    setPhase('processing');

    try {
      if (sessionId) {
        const res = await interviewAPI.completeSession(sessionId, fullTranscriptRef.current);
        const data = res.data?.data || res.data;
        setResult({
          overallScore: data.overallScore ?? Math.round(qaHistory.reduce((sum, r) => sum + (r.evaluation?.score ?? 0), 0) / Math.max(qaHistory.length, 1)),
          feedback: data.feedback || 'Session completed.',
          speechAnalysis: data.speechAnalysis || null,
          qaHistory,
          duration: sessionTimer,
        });
      } else {
        setResult({
          overallScore: Math.round(qaHistory.reduce((sum, r) => sum + (r.evaluation?.score ?? 0), 0) / Math.max(qaHistory.length, 1)),
          feedback: 'Session completed.',
          speechAnalysis: null,
          qaHistory,
          duration: sessionTimer,
        });
      }
    } catch {
      setResult({
        overallScore: Math.round(qaHistory.reduce((sum, r) => sum + (r.evaluation?.score ?? 0), 0) / Math.max(qaHistory.length, 1)),
        feedback: 'Session completed (results may be partial).',
        speechAnalysis: null,
        qaHistory,
        duration: sessionTimer,
      });
    }

    setPhase('idle');
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
  }, [sessionId, stopRecognition, qaHistory, sessionTimer]);

  const reset = useCallback(() => {
    stopRecognition();
    window.speechSynthesis?.cancel();
    setPhase('idle');
    setSessionId(null);
    setQuestions([]);
    setCurrentIdx(0);
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);
    setQaHistory([]);
    setResult(null);
    setError(null);
    setSessionTimer(0);
    fullTranscriptRef.current = '';
    consecutiveScoresRef.current = [];
  }, [stopRecognition]);

  /* ── Return ─────────────────────────────────────────────────────── */

  return {
    // State
    phase,
    sessionId,
    questions,
    currentIdx,
    currentQuestion: questions[currentIdx] || null,
    transcript,
    interimTranscript,
    evaluation,
    qaHistory,
    result,
    error,
    sessionTimer,
    difficulty,
    totalQuestions: questions.length,

    // Actions
    startSession,
    startListening,
    stopListening: stopRecognition,
    submitAnswer,
    nextQuestion,
    skipQuestion,
    endSession,
    speak,
    reset,
  };
}
