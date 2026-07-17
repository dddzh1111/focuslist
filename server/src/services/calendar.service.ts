import prisma from '../lib/prisma';

export const calendarService = {
  async getByDateRange(userId: string, start: string, end: string) {
    // 1. 有截止日期的每日任务
    const tasksWithDate = await prisma.task.findMany({
      where: {
        userId,
        isLongTerm: false,
        dueDate: {
          gte: new Date(start + 'T00:00:00.000Z'),
          lte: new Date(end + 'T23:59:59.999Z'),
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        listId: true,
        list: { select: { id: true, name: true, color: true } },
        estimatedPomos: true,
        completedPomos: true,
      },
      orderBy: [{ dueDate: 'asc' }, { sortOrder: 'asc' }],
    });

    // 2. 没有截止日期的每日任务
    const tasksWithoutDate = await prisma.task.findMany({
      where: {
        userId,
        isLongTerm: false,
        dueDate: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        listId: true,
        list: { select: { id: true, name: true, color: true } },
        estimatedPomos: true,
        completedPomos: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // 3. 合并并按日期分组
    const grouped: Record<string, typeof tasksWithDate> = {};

    for (const task of tasksWithDate) {
      const dateKey = task.dueDate!.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    }

    // 无截止日期的每日任务归入今天
    const today = new Date().toISOString().split('T')[0];
    if (tasksWithoutDate.length > 0) {
      if (!grouped[today]) {
        grouped[today] = [];
      }
      grouped[today].push(...tasksWithoutDate);
    }

    return grouped;
  },
};
