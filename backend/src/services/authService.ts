import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import env from '@config/env';
import prisma from '@lib/prisma';
import { AppError } from '@middleware/errorHandler';
import { emailService } from './emailService';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const TOKEN_EXPIRY = '7d';

type JwtPayload = {
  sub: string;
  email?: string | null;
};

const createToken = (payload: JwtPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

const logLogin = async (
  userId: string,
  method: 'GOOGLE' | 'EMAIL' | 'DEMO',
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failReason?: string
) => {
  try {
    await prisma.loginLog.create({
      data: {
        userId,
        method,
        success,
        ipAddress,
        userAgent,
        failReason,
      },
    });

    // Update user's last login and increment login count if successful
    if (success) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
          loginCount: { increment: 1 },
        },
      });
    }
  } catch (error) {
    console.error('Failed to log login:', error);
    // Don't throw error - logging failure shouldn't block login
  }
};

export const authService = {
  async signInWithGoogle(credential: string, ipAddress?: string, userAgent?: string) {
    if (!credential) {
      throw new AppError('Missing Google credential', 400);
    }

    let ticketPayload: Record<string, any> | undefined = undefined;
    let userId: string | null = null;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });

      ticketPayload = ticket.getPayload() ?? undefined;
    } catch (error) {
      console.error('Google token verification failed', error);
      throw new AppError('Invalid Google credential', 401);
    }

    if (!ticketPayload?.email) {
      throw new AppError('Google account is missing a verified email', 400);
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: ticketPayload.email },
      });

      const isNewUser = !existingUser;

      const user = await prisma.user.upsert({
        where: { email: ticketPayload.email },
        update: {
          name: ticketPayload.name ?? undefined,
          avatarUrl: ticketPayload.picture ?? undefined,
          googleId: ticketPayload.sub,
        },
        create: {
          email: ticketPayload.email,
          name: ticketPayload.name ?? ticketPayload.email.split('@')[0],
          avatarUrl: ticketPayload.picture,
          googleId: ticketPayload.sub,
        },
      });

      userId = user.id;

      // Log successful login
      await logLogin(user.id, 'GOOGLE', true, ipAddress, userAgent);

      // Send emails only if enabled and user has email
      if (user.email) {
        try {
          if (isNewUser && env.EMAIL_ENABLED) {
            emailService.sendWelcomeEmail(user.name || 'User', user.email).catch(err => {
              console.error('Failed to send welcome email:', err);
            });
          } else if (!isNewUser && env.EMAIL_ENABLED) {
            emailService.sendLoginAlert(user.name || 'User', user.email, {
              method: 'Google OAuth',
              ipAddress,
              timestamp: new Date(),
            }).catch(err => {
              console.error('Failed to send login alert:', err);
            });
          }
        } catch (emailError) {
          // Email errors should not block login
          console.error('Email service error:', emailError);
        }
      }

      const token = createToken({ sub: user.id, email: user.email });

      return {
        token,
        user,
        isNewUser,
      };
    } catch (error) {
      if (userId) {
        await logLogin(userId, 'GOOGLE', false, ipAddress, userAgent, (error as Error).message);
      }
      throw error;
    }
  },

  async signInAsDemoUser(ipAddress?: string, userAgent?: string) {
    const email = 'demo@lakshpath.ai';
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: 'Demo Explorer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        googleId: 'demo-google-id',
      },
    });

    // Log demo login
    await logLogin(user.id, 'DEMO', true, ipAddress, userAgent);

    const token = createToken({ sub: user.id, email: user.email });

    return {
      token,
      user,
    };
  },

  async getCurrentUser(userId: string) {
    if (!userId) {
      throw new AppError('Missing user id', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async registerWithEmail(
    name: string,
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        subscription: {
          create: { plan: 'FREE', status: 'ACTIVE' },
        },
      },
      include: { subscription: true },
    });

    await logLogin(user.id, 'EMAIL', true, ipAddress, userAgent);

    if (env.EMAIL_ENABLED && user.email) {
      emailService.sendWelcomeEmail(user.name || 'User', user.email).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
    }

    const token = createToken({ sub: user.id, email: user.email });

    return { token, user, isNewUser: true };
  },

  async loginWithEmail(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await logLogin(user.id, 'EMAIL', false, ipAddress, userAgent, 'Invalid password');
      throw new AppError('Invalid email or password', 401);
    }

    await logLogin(user.id, 'EMAIL', true, ipAddress, userAgent);

    if (env.EMAIL_ENABLED && user.email) {
      emailService.sendLoginAlert(user.name || 'User', user.email, {
        method: 'Email/Password',
        ipAddress,
        timestamp: new Date(),
      }).catch(err => {
        console.error('Failed to send login alert:', err);
      });
    }

    const token = createToken({ sub: user.id, email: user.email });

    return { token, user };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    // Generate a short-lived reset token (15 minutes)
    const resetToken = jwt.sign({ sub: user.id, purpose: 'password-reset' }, env.JWT_SECRET, {
      expiresIn: '15m',
    });

    if (env.EMAIL_ENABLED && user.email) {
      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await emailService.sendPasswordResetEmail(user.name || 'User', user.email, resetUrl);
    }

    return { message: 'If an account exists, a reset link has been sent.' };
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; purpose?: string };
      if (payload.purpose !== 'password-reset') {
        throw new AppError('Invalid reset token', 400);
      }

      const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

      await prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash },
      });

      return { message: 'Password has been reset successfully.' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired reset token', 400);
    }
  },
};
