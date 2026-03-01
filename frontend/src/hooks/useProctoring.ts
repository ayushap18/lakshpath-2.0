import { useState, useRef, useCallback, useEffect } from 'react';

export type ViolationType =
  | 'TAB_SWITCH'
  | 'MULTIPLE_PERSONS'
  | 'NO_PERSON'
  | 'PHONE_DETECTED'
  | 'SUSPICIOUS_OBJECT'
  | 'VOICE_DETECTED';

export interface Violation {
  type: ViolationType;
  message: string;
  timestamp: number;
}

interface UseProctoringOptions {
  enabled: boolean;
  maxViolations?: number;
  detectionIntervalMs?: number;
  onMaxViolations?: () => void;
  /** Called the FIRST time a warn-first type is detected (voice warning, no counter increment) */
  onFirstWarning?: (type: ViolationType, message: string) => void;
}

/** These types get a voice-only warning on first occurrence; counter starts from second */
const WARN_FIRST_TYPES: ViolationType[] = ['TAB_SWITCH', 'MULTIPLE_PERSONS', 'PHONE_DETECTED'];

export function useProctoring(options: UseProctoringOptions) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [violationCount, setViolationCount] = useState(0);
  const [lastWarning, setLastWarning] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [personDetected, setPersonDetected] = useState(false);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [isFirstWarning, setIsFirstWarning] = useState(false);

  // Video: callback ref so stream re-attaches across screen transitions
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const violationCountRef = useRef(0);
  const lastViolationRef = useRef<{ type: ViolationType; timestamp: number } | null>(null);
  const maxViolationsCalledRef = useRef(false);
  const onMaxViolationsRef = useRef(options.onMaxViolations);
  const onFirstWarningRef = useRef(options.onFirstWarning);
  const warnedTypesRef = useRef<Set<ViolationType>>(new Set());
  const aiSpeakingRef = useRef(false);

  // Audio monitoring refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onMaxViolationsRef.current = options.onMaxViolations;
    onFirstWarningRef.current = options.onFirstWarning;
  }, [options.onMaxViolations, options.onFirstWarning]);

  // Callback ref — auto-attaches camera stream when the <video> element mounts / changes
  const videoRef = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  const setAISpeaking = useCallback((speaking: boolean) => {
    aiSpeakingRef.current = speaking;
  }, []);

  const addViolation = useCallback((type: ViolationType, message: string) => {
    const now = Date.now();
    if (lastViolationRef.current?.type === type && now - lastViolationRef.current.timestamp < 5000) return;
    lastViolationRef.current = { type, timestamp: now };

    // First-warning-only: voice alert, NO counter increment
    if (WARN_FIRST_TYPES.includes(type) && !warnedTypesRef.current.has(type)) {
      warnedTypesRef.current.add(type);
      setLastWarning(message);
      setIsFirstWarning(true);
      setTimeout(() => { setLastWarning(null); setIsFirstWarning(false); }, 5000);
      onFirstWarningRef.current?.(type, message);
      return;
    }

    // Normal violation — counter increments
    const violation: Violation = { type, message, timestamp: now };
    setViolations(prev => [...prev, violation]);
    setLastWarning(message);
    setIsFirstWarning(false);
    setTimeout(() => setLastWarning(null), 4000);

    const newCount = violationCountRef.current + 1;
    violationCountRef.current = newCount;
    setViolationCount(newCount);

    const maxV = options.maxViolations || 5;
    if (newCount >= maxV && !maxViolationsCalledRef.current) {
      maxViolationsCalledRef.current = true;
      onMaxViolationsRef.current?.();
    }
  }, [options.maxViolations]);

  /* ---- Camera (640x480 for better phone detection) ---- */

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoElRef.current) {
        videoElRef.current.srcObject = stream;
        await videoElRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Camera access denied');
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoElRef.current) {
      videoElRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  /** Returns the raw MediaStream so extra <video> elements can display the feed */
  const getStream = useCallback(() => streamRef.current, []);

  /* ---- COCO-SSD model ---- */

  useEffect(() => {
    if (!options.enabled) return;
    let cancelled = false;

    const loadModel = async () => {
      try {
        await import('@tensorflow/tfjs');
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        const model = await cocoSsd.load();
        if (!cancelled) {
          modelRef.current = model;
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.warn('Failed to load COCO-SSD model:', err);
      }
    };

    loadModel();
    return () => { cancelled = true; };
  }, [options.enabled]);

  /* ---- Object detection loop ---- */

  const startDetection = useCallback(() => {
    if (intervalRef.current) return;

    const detect = async () => {
      if (!modelRef.current || !videoElRef.current || !isCameraActive) return;
      if (videoElRef.current.readyState < 2) return;

      try {
        const predictions = await modelRef.current.detect(videoElRef.current);
        const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.5);
        // Lower confidence for phones — they are small and harder for COCO-SSD
        const phones = predictions.filter((p: any) => p.class === 'cell phone' && p.score > 0.3);
        const suspicious = predictions.filter((p: any) =>
          ['book', 'laptop', 'remote', 'tablet'].includes(p.class) && p.score > 0.4
        );

        setPersonDetected(persons.length === 1);

        if (persons.length === 0) {
          addViolation('NO_PERSON', 'No person detected in frame');
        } else if (persons.length > 1) {
          addViolation('MULTIPLE_PERSONS', `${persons.length} persons detected — only 1 allowed`);
        }

        if (phones.length > 0) {
          addViolation('PHONE_DETECTED', 'Phone detected in frame');
        }

        if (suspicious.length > 0) {
          addViolation('SUSPICIOUS_OBJECT', `Suspicious object detected: ${suspicious.map((s: any) => s.class).join(', ')}`);
        }
      } catch {
        // Detection failed silently
      }
    };

    intervalRef.current = setInterval(detect, options.detectionIntervalMs || 3000);
    detect(); // Run once immediately
  }, [isCameraActive, addViolation, options.detectionIntervalMs]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /* ---- Voice / speech activity monitoring (Web Audio API) ---- */

  const startAudioMonitoring = useCallback(async () => {
    if (audioIntervalRef.current) return; // already monitoring
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      audioContextRef.current = ctx;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let voiceFrames = 0;

      audioIntervalRef.current = setInterval(() => {
        // Skip while the AI interviewer is speaking (its audio would trigger the mic)
        if (aiSpeakingRef.current) {
          voiceFrames = 0;
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        // Voice frequency range ≈ 85 – 3 400 Hz
        // 44 100 Hz / 512 FFT → ~86 Hz per bin  →  bins 1–40 ≈ 86 – 3 440 Hz
        const voiceBins = dataArray.slice(1, 40);
        const avg = voiceBins.reduce((s, v) => s + v, 0) / voiceBins.length;

        if (avg > 35) {
          voiceFrames++;
          if (voiceFrames >= 4) { // ~2 s sustained voice
            setIsVoiceDetected(true);
            addViolation('VOICE_DETECTED', 'Voice/speech detected — maintain silence during interview');
            voiceFrames = 0;
          }
        } else {
          voiceFrames = Math.max(0, voiceFrames - 1);
          if (voiceFrames === 0) setIsVoiceDetected(false);
        }
      }, 500);
    } catch (err) {
      console.warn('Audio monitoring unavailable:', err);
    }
  }, [addViolation]);

  const stopAudioMonitoring = useCallback(() => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    setIsVoiceDetected(false);
  }, []);

  /* ---- Tab / focus monitoring ---- */

  useEffect(() => {
    if (!options.enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation('TAB_SWITCH', 'Tab switch or window minimized detected');
      }
    };

    const handleBlur = () => {
      if (!document.hidden) {
        addViolation('TAB_SWITCH', 'Window lost focus');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [options.enabled, addViolation]);

  /* ---- Cleanup ---- */

  useEffect(() => {
    return () => {
      stopDetection();
      stopAudioMonitoring();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [stopDetection, stopAudioMonitoring]);

  return {
    videoRef,
    violations,
    violationCount,
    lastWarning,
    isFirstWarning,
    isModelLoaded,
    isCameraActive,
    cameraError,
    personDetected,
    isVoiceDetected,
    getStream,
    setAISpeaking,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection,
    startAudioMonitoring,
    stopAudioMonitoring,
  };
}
