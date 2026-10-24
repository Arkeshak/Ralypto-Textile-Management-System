import prisma from '../../db/prisma';

export class AIUsageService {
  async getQuota(businessId: string) {
    let quota = await prisma.aIUsageQuota.findUnique({
      where: { businessId },
    });

    if (!quota) {
      quota = await prisma.aIUsageQuota.create({
        data: {
          businessId,
          dailyTryOnLimit: 50,
          sessionTryOnLimit: 10,
          currentMonthGenerations: 0,
          monthlySpendingLimitLkr: 50000.0,
        },
      });
    }

    // Count today's try-on requests
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayUsageCount = await prisma.aITryOnJob.count({
      where: {
        businessId,
        createdAt: { gte: startOfToday },
        isDeleted: false,
      },
    });

    return {
      dailyLimit: quota.dailyTryOnLimit,
      sessionLimit: quota.sessionTryOnLimit,
      todayUsed: todayUsageCount,
      remainingToday: Math.max(0, quota.dailyTryOnLimit - todayUsageCount),
      monthlySpendingLimitLkr: quota.monthlySpendingLimitLkr,
    };
  }

  async checkQuota(businessId: string, sessionId?: string): Promise<void> {
    const quotaInfo = await this.getQuota(businessId);

    if (quotaInfo.remainingToday <= 0) {
      throw new Error(
        `Business daily AI try-on quota of ${quotaInfo.dailyLimit} requests has been reached. Please contact management or try again tomorrow.`
      );
    }

    if (sessionId) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const sessionUsage = await prisma.aITryOnJob.count({
        where: {
          businessId,
          sessionId,
          createdAt: { gte: startOfToday },
          isDeleted: false,
        },
      });

      if (sessionUsage >= quotaInfo.sessionLimit) {
        throw new Error(
          `You have reached the session limit of ${quotaInfo.sessionLimit} virtual try-on requests for today.`
        );
      }
    }
  }

  async recordUsage(businessId: string) {
    await prisma.aIUsageQuota.upsert({
      where: { businessId },
      update: {
        currentMonthGenerations: { increment: 1 },
      },
      create: {
        businessId,
        dailyTryOnLimit: 50,
        sessionTryOnLimit: 10,
        currentMonthGenerations: 1,
      },
    });
  }
}

export const aiUsageService = new AIUsageService();
