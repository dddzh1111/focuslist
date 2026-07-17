import prisma from '../lib/prisma';

export const statsService = {
  async getOverview(userId: string) {
    const [
      totalPomodoros,
      totalFocusAgg,
      completedTasks,
      longTermTasks,
      completedShortTasks,
      totalChaptersAgg,
    ] = await Promise.all([
      prisma.pomodoroRecord.count({
        where: { userId, type: 'FOCUS', completed: true },
      }),
      prisma.pomodoroRecord.aggregate({
        where: { userId, type: 'FOCUS', completed: true },
        _sum: { duration: true },
      }),
      prisma.task.count({
        where: { userId, status: 'DONE' },
      }),
      prisma.task.count({
        where: { userId, isLongTerm: true },
      }),
      prisma.task.count({
        where: { userId, status: 'DONE', isLongTerm: false },
      }),
      prisma.task.aggregate({
        where: { userId, isLongTerm: true },
        _sum: { totalChapters: true, completedChapters: true },
      }),
    ]);

    return {
      totalPomodoros,
      totalFocusSec: totalFocusAgg._sum.duration || 0,
      totalFocusHours: ((totalFocusAgg._sum.duration || 0) / 3600).toFixed(1),
      completedTasks,
      // 长期任务统计
      longTermTasks,
      longTermTotalChapters: totalChaptersAgg._sum.totalChapters || 0,
      longTermCompletedChapters: totalChaptersAgg._sum.completedChapters || 0,
      longTermProgress: totalChaptersAgg._sum.totalChapters
        ? Math.round(((totalChaptersAgg._sum.completedChapters || 0) / totalChaptersAgg._sum.totalChapters) * 100)
        : 0,
      // 短期任务统计
      completedShortTasks,
    };
  },

  async getDaily(userId: string, start: string, end: string) {
    const stats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: new Date(start + 'T00:00:00.000Z'),
          lte: new Date(end + 'T23:59:59.999Z'),
        },
      },
      orderBy: { date: 'asc' },
    });
    return stats.map((s: { date: Date; totalFocusSec: number; completedPomos: number; completedTasks: number; interruptedPomos: number }) => ({
      date: s.date.toISOString().split('T')[0],
      totalFocusSec: s.totalFocusSec,
      completedPomos: s.completedPomos,
      completedTasks: s.completedTasks,
      interruptedPomos: s.interruptedPomos,
    }));
  },

  async getByTask(userId: string, start: string, end: string) {
    const records = await prisma.pomodoroRecord.groupBy({
      by: ['taskId'],
      where: {
        userId,
        type: 'FOCUS',
        completed: true,
        createdAt: {
          gte: new Date(start + 'T00:00:00.000Z'),
          lte: new Date(end + 'T23:59:59.999Z'),
        },
      },
      _sum: { duration: true },
      _count: { id: true },
      orderBy: { _sum: { duration: 'desc' } },
    });

    const taskIds = records.map((r: { taskId: string }) => r.taskId);
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { id: true, title: true },
    });
    const taskMap = new Map<string, { id: string; title: string }>(tasks.map((t: { id: string; title: string }) => [t.id, t]));

    return records.map((r: { taskId: string; _sum: { duration: number | null }; _count: { id: number } }) => ({
      taskId: r.taskId,
      title: taskMap.get(r.taskId)?.title || '已删除的任务',
      totalFocusSec: r._sum.duration || 0,
      totalPomodoros: r._count.id,
    }));
  },

  async getByList(userId: string, start: string, end: string) {
    const records = await prisma.pomodoroRecord.findMany({
      where: {
        userId,
        type: 'FOCUS',
        completed: true,
        createdAt: {
          gte: new Date(start + 'T00:00:00.000Z'),
          lte: new Date(end + 'T23:59:59.999Z'),
        },
      },
      include: {
        task: { select: { listId: true, list: { select: { id: true, name: true, color: true } } } },
      },
    });

    const map = new Map<string, { name: string; color: string; totalFocusSec: number; totalPomodoros: number }>();
    for (const r of records) {
      const listId = r.task.listId || 'unlisted';
      const list = r.task.list;
      const key = listId;
      if (!map.has(key)) {
        map.set(key, { name: list?.name || '未分类', color: list?.color || '#999', totalFocusSec: 0, totalPomodoros: 0 });
      }
      const entry = map.get(key)!;
      entry.totalFocusSec += r.duration;
      entry.totalPomodoros += 1;
    }

    return Array.from(map.entries()).map(([listId, data]) => ({ listId, ...data }));
  },

  async getListProgress(userId: string) {
    // 获取用户所有清单
    const lists = await prisma.list.findMany({
      where: { userId },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            tasks: {
              select: { id: true, status: true },
            },
          },
        },
        tasks: {
          select: { id: true, status: true, sectionId: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return lists.map((list: { id: string; name: string; color: string; tasks: { id: string; status: string; sectionId: string | null }[]; sections: { id: string; name: string; sortOrder: number; tasks: { id: string; status: string }[] }[] }) => {
      const totalTasks = list.tasks.length;
      const doneTasks = list.tasks.filter((t: { status: string }) => t.status === 'DONE').length;
      const inProgressTasks = list.tasks.filter((t: { status: string }) => t.status === 'IN_PROGRESS').length;
      const todoTasks = list.tasks.filter((t: { status: string }) => t.status === 'TODO').length;
      const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      const sections = list.sections.map((section: { id: string; name: string; sortOrder: number; tasks: { id: string; status: string }[] }) => {
        const sectionTotal = section.tasks.length;
        const sectionDone = section.tasks.filter((t: { status: string }) => t.status === 'DONE').length;
        const sectionRate = sectionTotal > 0 ? Math.round((sectionDone / sectionTotal) * 100) : 0;
        return {
          sectionId: section.id,
          name: section.name,
          sortOrder: section.sortOrder,
          totalTasks: sectionTotal,
          doneTasks: sectionDone,
          completionRate: sectionRate,
        };
      });

      return {
        listId: list.id,
        listName: list.name,
        color: list.color,
        totalTasks,
        doneTasks,
        inProgressTasks,
        todoTasks,
        completionRate,
        sections,
      };
    });
  },

  async getByTag(userId: string, start: string, end: string) {
    const records = await prisma.pomodoroRecord.findMany({
      where: {
        userId,
        type: 'FOCUS',
        completed: true,
        createdAt: {
          gte: new Date(start + 'T00:00:00.000Z'),
          lte: new Date(end + 'T23:59:59.999Z'),
        },
      },
      include: { task: { select: { tags: true } } },
    });

    const tagMap = new Map<string, { totalFocusSec: number; totalPomodoros: number }>();
    for (const r of records) {
      try {
        const tags: string[] = JSON.parse(r.task.tags);
        for (const tag of tags) {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { totalFocusSec: 0, totalPomodoros: 0 });
          }
          const entry = tagMap.get(tag)!;
          entry.totalFocusSec += r.duration;
          entry.totalPomodoros += 1;
        }
      } catch {
        // 忽略解析错误
      }
    }

    return Array.from(tagMap.entries())
      .map(([tag, data]) => ({ tag, ...data }))
      .sort((a, b) => b.totalFocusSec - a.totalFocusSec);
  },
};
