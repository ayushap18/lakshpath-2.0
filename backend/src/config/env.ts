import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  GEMINI_API_KEY: z.string().optional(), // unused on Cloud Run (Vertex AI uses ADC); kept for local dev
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GCP_PROJECT_ID: z.string().default('gen-lang-client-0843895857'),
  GCP_REGION: z.string().default('us-central1'), // Vertex AI Gemini is available in us-central1
  GOOGLE_CLIENT_ID: z.string({ required_error: 'GOOGLE_CLIENT_ID is required' }).min(1),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/lakshpath'),
  CLIENT_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().default('lakshpath-dev-secret'),
  DEMO_MODE_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value: 'true' | 'false') => value === 'true'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  GITHUB_TOKEN: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  // Razorpay billing
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PLAN_ID_PRO: z.string().optional(),
  RAZORPAY_PLAN_ID_PRO_YEARLY: z.string().optional(),
  // ML microservice
  ML_SERVICE_URL: z.string().default('http://localhost:8000'),
  // Auth
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  // Email / SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@lakshpath.ai'),
  SMTP_SECURE: z.string().default('false'),
  EMAIL_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value: 'true' | 'false') => value === 'true'),
});

const env = envSchema.parse(process.env);

// Production safety checks
if (env.NODE_ENV === 'production') {
  const warnings: string[] = [];

  // FIX CRIT-4: Throw on insecure JWT_SECRET in production instead of just warning
  if (env.JWT_SECRET === 'lakshpath-dev-secret') {
    throw new Error('FATAL: JWT_SECRET is the default dev secret. Cannot start in production. Set a strong random value (64+ chars).');
  }
  // FIX M-26: Throw if DATABASE_URL points to localhost in production
  if (env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.startsWith('file:')) {
    throw new Error('FATAL: DATABASE_URL points to localhost/SQLite in production. Use a managed PostgreSQL connection string.');
  }
  if (env.JWT_SECRET.length < 32) {
    warnings.push('WARNING: JWT_SECRET is too short. Use at least 32 characters.');
  }
  if (!env.CLIENT_ORIGIN || env.CLIENT_ORIGIN === '*') {
    warnings.push('WARNING: CLIENT_ORIGIN not set. CORS is open to all origins.');
  }
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    warnings.push('WARNING: Razorpay keys not configured. Billing will fail.');
  }
  if (!env.RAZORPAY_PLAN_ID_PRO) {
    warnings.push('WARNING: RAZORPAY_PLAN_ID_PRO not set. Pro subscriptions will fail.');
  }
  if (env.DEMO_MODE_ENABLED) {
    warnings.push('WARNING: Demo mode is enabled in production.');
  }

  if (warnings.length > 0) {
    console.warn('\n========== PRODUCTION CONFIG WARNINGS ==========');
    warnings.forEach(w => console.warn(`  ${w}`));
    console.warn('=================================================\n');
  }
}

export default env;
