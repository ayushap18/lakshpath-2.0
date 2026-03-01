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

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
const allowedOrigins = env.CLIENT_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAllOrigins = !allowedOrigins || allowedOrigins.length === 0 || allowedOrigins.includes('*');

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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(globalLimiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

app.use('/api', apiRouter);

// Error handler MUST be registered before the wildcard static file route
// so that API errors (thrown by routes/services) are caught properly
app.use(errorHandler);

// Serve frontend static files in all environments
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

export default app;
