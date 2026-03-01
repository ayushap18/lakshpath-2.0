import { Request, Response, NextFunction } from 'express';
import prisma from '@lib/prisma';

export const adminController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, proUsers, totalPayments, recentPayments] = await Promise.all([
        prisma.user.count(),
        prisma.subscription.count({ where: { plan: 'PRO', status: 'ACTIVE' } }),
        prisma.payment.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.payment.count({
          where: {
            status: 'SUCCESS',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      const mrr = proUsers * 499; // ₹499 per Pro user per month
      const conversionRate = totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : '0';

      res.status(200).json({
        totalUsers,
        proUsers,
        freeUsers: totalUsers - proUsers,
        mrr,
        totalRevenue: (totalPayments._sum.amount || 0) / 100, // Convert paise to rupees
        totalTransactions: totalPayments._count,
        monthlyTransactions: recentPayments,
        conversionRate: parseFloat(conversionRate),
      });
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || '';
      const planFilter = req.query.plan as string;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (planFilter === 'PRO') {
        where.subscription = { plan: 'PRO', status: 'ACTIVE' };
      } else if (planFilter === 'FREE') {
        where.OR = [
          { subscription: null },
          { subscription: { plan: 'FREE' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: { subscription: true },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        users: users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatarUrl,
          role: u.role,
          plan: u.subscription?.plan || 'FREE',
          subscriptionStatus: u.subscription?.status || null,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
          loginCount: u.loginCount,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          subscription: true,
          payments: { orderBy: { createdAt: 'desc' }, take: 10 },
          usageLogs: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        college: user.college,
        degree: user.degree,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        subscription: user.subscription,
        payments: user.payments.map(p => ({
          id: p.id,
          amount: p.amount / 100,
          currency: p.currency,
          status: p.status,
          plan: p.plan,
          createdAt: p.createdAt,
        })),
        recentUsage: user.usageLogs,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role, plan } = req.body;

      const updateData: any = {};
      if (role && ['USER', 'ADMIN'].includes(role)) {
        updateData.role = role;
      }

      if (plan && ['FREE', 'PRO'].includes(plan)) {
        await prisma.subscription.upsert({
          where: { userId: id },
          update: { plan, status: 'ACTIVE' },
          create: { userId: id, plan, status: 'ACTIVE' },
        });
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({ where: { id }, data: updateData });
      }

      res.status(200).json({ message: 'User updated' });
    } catch (error) {
      next(error);
    }
  },

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.payment.count(),
      ]);

      // Monthly revenue for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyPayments = await prisma.payment.findMany({
        where: { status: 'SUCCESS', createdAt: { gte: sixMonthsAgo } },
        select: { amount: true, createdAt: true },
      });

      const monthlyRevenue: Record<string, number> = {};
      monthlyPayments.forEach(p => {
        const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + p.amount / 100;
      });

      res.status(200).json({
        payments: payments.map(p => ({
          id: p.id,
          userName: p.user.name,
          userEmail: p.user.email,
          amount: p.amount / 100,
          currency: p.currency,
          status: p.status,
          plan: p.plan,
          createdAt: p.createdAt,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        monthlyRevenue,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUsageStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const usageLogs = await prisma.usageLog.groupBy({
        by: ['feature'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: true,
      });

      const featureUsage = usageLogs.map(l => ({
        feature: l.feature,
        count: l._count,
      }));

      res.status(200).json({ featureUsage, period: '30d' });
    } catch (error) {
      next(error);
    }
  },
};
