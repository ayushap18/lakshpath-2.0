import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const appError = err instanceof AppError ? err : null;

  // Always log in non-production; log only unexpected errors in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error handler caught:', err);
  } else if (!appError) {
    // FIX M-25: Log unexpected errors in production without exposing to client
    console.error('Unexpected error:', err);
  }

  if (appError) {
    // Known AppError — safe to expose message to client
    res.status(appError.statusCode).json({
      error: appError.message,
      details: appError.details,
    });
  } else {
    // FIX M-25: Don't leak error details in production for non-AppError
    res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error',
    });
  }
};
