/**
 * HTTP client for the Python ML microservice (FastAPI, port 8000 by default).
 * All methods fail gracefully — callers receive `null` on any network/API error
 * and should fall back to Gemini or rule-based logic.
 *
 * ML service API prefix: /ml
 *   POST /ml/careers/match
 *   POST /ml/interview/score
 *   POST /ml/salary/predict
 */
import env from '@config/env';

const ML_BASE = env.ML_SERVICE_URL;
const TIMEOUT_MS = 8000;

async function fetchML<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${ML_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[mlService] ${path} returned HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn(`[mlService] ${path} timed out after ${TIMEOUT_MS}ms`);
    } else {
      console.warn(`[mlService] ${path} failed:`, err?.message ?? err);
    }
    return null;
  }
}

// ── Career matching ─────────────────────────────────────────────────────────

export interface MLCareerMatch {
  id: string;
  title: string;
  field: string;
  matchScore: number;
  description: string;
  avgSalary: string;
  growthRate: string;
  keySkills: string[];
}

export interface MLCareerMatchResponse {
  topCareers: MLCareerMatch[];
}

/**
 * Ask the ML service to rank careers for the given quiz answers.
 * Maps to POST /ml/careers/match
 */
export async function mlRankCareers(
  answers: Record<string, unknown>,
): Promise<MLCareerMatchResponse | null> {
  return fetchML<MLCareerMatchResponse>('/ml/careers/match', { answers });
}

// ── Interview answer scoring ─────────────────────────────────────────────────

export interface MLScoreResult {
  score: number;         // 0–100
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Score a candidate's interview answer.
 * Maps to POST /ml/interview/score
 */
export async function mlScoreAnswer(params: {
  question: string;
  userAnswer: string;
  expectedAnswer: string;
  questionType?: string;
}): Promise<MLScoreResult | null> {
  return fetchML<MLScoreResult>('/ml/interview/score', {
    questionText: params.question,
    questionType: params.questionType ?? 'TECHNICAL',
    expectedAnswer: params.expectedAnswer,
    userAnswer: params.userAnswer,
  });
}

// ── Salary prediction ─────────────────────────────────────────────────────────

export interface MLSalaryResult {
  minSalaryLPA: number;
  maxSalaryLPA: number;
  medianSalaryLPA: number;
  cityMultiplier: number;
  confidence: number;
  source: string;
}

/**
 * Predict salary range for a role, city, and years of experience.
 * Maps to POST /ml/salary/predict
 */
export async function mlPredictSalary(params: {
  role: string;
  city?: string;
  experienceYears?: number;
  skills?: string[];
  education?: string;
}): Promise<MLSalaryResult | null> {
  return fetchML<MLSalaryResult>('/ml/salary/predict', {
    role: params.role,
    city: params.city ?? 'Bengaluru',
    experienceYears: params.experienceYears ?? 0,
    skills: params.skills ?? [],
    education: params.education ?? '',
  });
}
