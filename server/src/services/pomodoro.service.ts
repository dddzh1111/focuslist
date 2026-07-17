import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { taskService } from './task.service';

export const pomodoroService = {
  async create(
    userId: string,
    data: {
      taskId: string;
      startTime: string;
      endTime?: string | null;
      duration: number;
      type?: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
      completed?: boolean;
    }
  ) {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 创建番茄记录
      const record = await tx.pomodoroRecord.create({
        data: {
          taskId: data.taskId,
          userId,
          startTime: new Date(data.startTime),
          endTime: data.endTime ? new Date(data.endTime) : null,
          duration: data.duration,
          type: data.type || 'FOCUS',
          completed: data.completed ?? true,
        },
      });

      // 2. 如果是专注类型且已完成，更新任务统计
      if (data.type !== 'SHORT_BREAK' && data.type !== 'LONG_BREAK' && data.completed !== false) {
        await tx.task.update({
          where: { id: data.taskId },
          data: {
            completedPomos: { increment: 1 },
            totalFocusTime: { increment: data.duration },
          },
        });

        // 3. 更新每日统计快照
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await tx.dailyStats.upsert({
          where: {
            userId_date: { userId, date: today },
          },
          create: {
            userId,
            date: today,
            totalFocusSec: data.duration,
            completedPomos: 1,
          },
          update: {
            totalFocusSec: { increment: data.duration },
            completedPomos: { increment: 1 },
          },
        });
      }

      return record;
    });

    return result;
  },

  async getAll(userId: string, page = 1, pageSize = 20) {
    const [records, total] = await Promise.all([
      prisma.pomodoroRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          task: { select: { id: true, title: true } },
        },
      }),
      prisma.pomodoroRecord.count({ where: { userId } }),
    ]);
    return { records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await prisma.pomodoroRecord.findMany({
      where: {
        userId,
        createdAt: { gte: today, lt: tomorrow },
        type: 'FOCUS',
        completed: true,
      },
    });

    const completedPomos = records.length;
    const totalFocusSec = records.reduce((sum: number, r) => sum + r.duration, 0);

    return { completedPomos, totalFocusSec, records };
  },

  async interrupt(id: string, userId: string, interruptedAt: string) {
    return prisma.pomodoroRecord.update({
      where: { id, userId },
      data: {
        completed: false,
        interruptedAt: new Date(interruptedAt),
      },
    });
  },
};
