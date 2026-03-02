import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import env from '@config/env';
import apiRouter from '@routes/index';
import { errorHandler } from '@middleware/errorHandler';
import { globalLimiter } from '@middleware/rateLimiter';

const app = express();

// Trust proxy in production (Cloud Run, Railway, etc.)
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers — full CSP in production, relaxed in dev
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://accounts.google.com", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "https://*.googleusercontent.com"],
      connectSrc: ["'self'", "https://lumberjack.razorpay.com", "https://api.razorpay.com", "https://generativelanguage.googleapis.com", "https://accounts.google.com"],
      frameSrc: ["https://api.razorpay.com", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: env.NODE_ENV === 'production' ? { policy: 'same-origin-allow-popups' as const } : false,
  hsts: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
}));

const allowedOrigins = env.CLIENT_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAllOrigins = !allowedOrigins || allowedOrigins.length === 0 || allowedOrigins.includes('*');

if (env.NODE_ENV === 'production' && allowAllOrigins) {
  console.warn('WARNING: CORS allows all origins in production. Set CLIENT_ORIGIN to your frontend domain.');
}

const corsOptions: CorsOptions = allowAllOrigins
  ? { origin: true, credentials: true }
  : {
      origin(origin, callback) {
        if (!origin || allowedOrigins?.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    };

app.use(cors(corsOptions));

// FIX CRIT-2: Razorpay webhook needs raw body for HMAC verification.
// Register express.raw() for webhook route BEFORE express.json() parses it.
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(globalLimiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

app.use('/api', apiRouter);

// FIX M-49: Catch-all for unmatched /api/* routes (404) before SPA wildcard
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler MUST be registered before the wildcard static file route
// so that API errors (thrown by routes/services) are caught properly
app.use(errorHandler);

// Serve frontend static files in all environments
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath, {
  maxAge: env.NODE_ENV === 'production' ? '1y' : 0,
  etag: true,
}));
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

export default app;
