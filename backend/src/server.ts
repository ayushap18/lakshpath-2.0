import * as Sentry from '@sentry/node';
import env from '@config/env';
import prisma from '@lib/prisma';
import app from './app';

// Initialise Sentry before anything else (no-op when DSN is unset)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}

const server = app.listen(env.PORT, () => {
  console.log(`LakshPath API listening on port ${env.PORT}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.PORT} is already in use. Please stop the other process or set PORT to a different value.`);
    process.exit(1);
  }
  console.error('Server error:', error);
  process.exit(1);
});

// FIX L-9/L-10: Graceful shutdown with timeout and Prisma disconnect
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Prisma disconnected.');
    } catch (err) {
      console.error('Error disconnecting Prisma:', err);
    }
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
