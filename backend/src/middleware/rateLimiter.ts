import rateLimit from 'express-rate-limit';
import env from '@config/env';

const isProd = env.NODE_ENV === 'production';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 200 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/health',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 5 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 30 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached, please wait before trying again.' },
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many webhook requests.' },
});
