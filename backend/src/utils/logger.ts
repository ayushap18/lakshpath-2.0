import env from '@config/env';

const logger = {
  info: (context: string, message: string, meta?: Record<string, unknown>) => {
    if (env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({ level: 'info', context, message, ...meta, timestamp: new Date().toISOString() }));
    }
  },
  warn: (context: string, message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', context, message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (context: string, message: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', context, message, ...meta, timestamp: new Date().toISOString() }));
  },
};

export default logger;
