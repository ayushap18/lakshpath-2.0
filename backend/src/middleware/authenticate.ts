import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import env from '@config/env';
import prisma from '@lib/prisma';

interface TokenPayload {
  sub: string;
  email?: string;
  iat: number;
  exp: number;
}

const extractToken = (req: Request) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.substring('Bearer '.length);
  }

  return null;
};

// Lightweight streak update (fire and forget, non-blocking)
const updateStreak = (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  prisma.user.findUnique({ where: { id: userId }, select: { lastActiveDate: true, streakCount: true } })
    .then(user => {
      if (!user) return;
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
      if (lastActive) lastActive.setHours(0, 0, 0, 0);

      // Already updated today
      if (lastActive && lastActive.getTime() === today.getTime()) return;

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = lastActive && lastActive.getTime() === yesterday.getTime();

      return prisma.user.update({
        where: { id: userId },
        data: {
          lastActiveDate: new Date(),
          streakCount: isConsecutive ? (user.streakCount || 0) + 1 : 1,
        },
      });
    })
    .catch(() => { /* non-critical, ignore silently */ });
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    // FIX M-3: Verify user still exists in DB (handles deleted/banned users)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = { id: user.id, email: user.email || payload.email };
    updateStreak(payload.sub);
    return next();
  } catch (error) {
    console.error('JWT verification failed', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const attachUserIfPresent = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = { id: payload.sub, email: payload.email };
  } catch (error) {
    console.warn('Optional JWT verification failed', error);
  }

  next();
};
