import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const taskService = {
  async getAll(
    userId: string,
    filters: {
      status?: string;
      priority?: string;
      listId?: string;
      sectionId?: string;
      tag?: string;
      keyword?: string;
      dueDate?: string;
      isLongTerm?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      page?: number;
      pageSize?: number;
    }
  ) {
    const { status, priority, listId, sectionId, tag, keyword, dueDate, isLongTerm, sort, order, page = 1, pageSize = 20 } = filters;

    const where: Record<string, unknown> = { userId };

    if (status) {
      where.status = { in: status.split(',') };
    }
    if (priority) {
      where.priority = priority;
    }
    if (listId) {
      where.listId = listId;
    }
    if (sectionId) {
      where.sectionId = sectionId;
    }
    if (isLongTerm !== undefined) {
      where.isLongTerm = isLongTerm === 'true';
    }
    if (keyword) {
      where.title = { contains: keyword };
    }
    if (dueDate === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueDate = { gte: today, lt: tomorrow };
    } else if (dueDate === 'week') {
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      where.dueDate = { gte: now, lte: weekEnd };
    } else if (dueDate === 'overdue') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'DONE' };
    }

    const orderBy: Record<string, string> = {};
    const sortField = sort || 'sortOrder';
    orderBy[sortField] = order || 'asc';

    try {
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where: where as any,
          orderBy: orderBy as any,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            list: { select: { id: true, name: true, color: true } },
            section: { select: { id: true, name: true } },
            children: {
              select: { id: true, title: true, status: true, priority: true },
              orderBy: { sortOrder: 'asc' },
            },
            _count: { select: { pomodoros: true } },
          },
        }),
        prisma.task.count({ where: where as any }),
      ]);
      return { tasks, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    } catch (err) {
      console.error('[getAll] ERROR:', err);
      throw err;
    }
  },

  async getById(id: string, userId: string) {
    return prisma.task.findFirst({
      where: { id, userId },
      include: {
        list: { select: { id: true, name: true, color: true } },
        section: { select: { id: true, name: true } },
        sourceTask: { select: { id: true, title: true, totalChapters: true, completedChapters: true } },
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        pomodoros: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  },

  async create(
    userId: string,
    data: {
      title: string;
      description?: string;
      priority?: 'HIGH' | 'MEDIUM' | 'LOW';
      dueDate?: string | null;
      estimatedPomos?: number;
      focusDuration?: number;
      tags?: string[];
      listId?: string | null;
      sectionId?: string | null;
      parentId?: string | null;
      isLongTerm?: boolean;
      totalChapters?: number;
      sourceTaskId?: string | null;
    }
  ) {
    return prisma.task.create({
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
      },
      include: {
        list: { select: { id: true, name: true, color: true } },
        section: { select: { id: true, name: true } },
      },
    });
  },

  // 从长期任务选取章节作为今天的短期任务
  async selectFromLongTerm(
    userId: string,
    longTermTaskId: string,
    data: {
      chapterIndex?: number;
      title?: string;
      dueDate?: string | null;
    }
  ) {
    const sourceTask = await prisma.task.findFirst({
      where: { id: longTermTaskId, userId, isLongTerm: true },
    });
    if (!sourceTask) throw new Error('长期任务不存在');

    const chapterLabel = data.chapterIndex ? `第${data.chapterIndex}章` : '';

    return prisma.task.create({
      data: {
        title: data.title || `${sourceTask.title}${chapterLabel ? ' ' + chapterLabel : ''}`,
        description: data.chapterIndex
          ? `来自长期任务: ${sourceTask.title}，今日学习第${data.chapterIndex}章`
          : `来自长期任务: ${sourceTask.title}`,
        priority: sourceTask.priority,
        listId: sourceTask.listId,
        sourceTaskId: longTermTaskId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        isLongTerm: false,
        userId,
      },
      include: {
        sourceTask: { select: { id: true, title: true, totalChapters: true, completedChapters: true } },
      },
    });
  },

  async update(
    id: string,
    userId: string,
    data: Record<string, unknown>
  ) {
    if (data.tags) {
      data.tags = JSON.stringify(data.tags);
    }
    if (data.dueDate !== undefined) {
      data.dueDate = data.dueDate ? new Date(data.dueDate as string) : null;
    }
    if (data.completedAt !== undefined) {
      data.completedAt = data.completedAt ? new Date(data.completedAt as string) : null;
    }
    return prisma.task.update({
      where: { id, userId },
      data,
      include: {
        list: { select: { id: true, name: true, color: true } },
        section: { select: { id: true, name: true } },
      },
    });
  },

  async updateStatus(id: string, userId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new Error('任务不存在');

    const data: Record<string, unknown> = { status };
    if (status === 'DONE') {
      data.completedAt = new Date();
      // 如果是短期任务且有来源长期任务，自动递增来源的 completedChapters
      if (task.sourceTaskId && !task.isLongTerm) {
        await prisma.task.update({
          where: { id: task.sourceTaskId },
          data: { completedChapters: { increment: 1 } },
        });
      }
    } else {
      data.completedAt = null;
    }
    return prisma.task.update({ where: { id, userId }, data });
  },

  async delete(id: string, userId: string) {
    return prisma.task.delete({ where: { id, userId } });
  },

  async reorder(userId: string, listId: string | null, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      prisma.task.update({
        where: { id, userId },
        data: { sortOrder: index, listId: listId || null },
      })
    );
    await prisma.$transaction(updates);
  },

  async addPomodoroCount(id: string, duration: number) {
    return prisma.task.update({
      where: { id },
      data: {
        completedPomos: { increment: 1 },
        totalFocusTime: { increment: duration },
      },
    });
  },

  // 切换长期任务单个章节的完成状态
  async toggleChapter(id: string, userId: string, chapterIndex: number, completed: boolean) {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new Error('任务不存在');
    if (!task.isLongTerm) throw new Error('该任务不是长期任务');
    if (task.totalChapters <= 0) throw new Error('该长期任务未设置总章节数');
    if (chapterIndex < 1 || chapterIndex > task.totalChapters) throw new Error('章节编号超出范围');

    let completions: number[] = [];
    try {
      completions = JSON.parse(task.chapterCompletions);
      if (!Array.isArray(completions)) completions = [];
    } catch { completions = []; }

    if (completed) {
      if (!completions.includes(chapterIndex)) completions.push(chapterIndex);
    } else {
      completions = completions.filter((c) => c !== chapterIndex);
    }

    const newCount = completions.length;
    const shouldMarkDone = newCount >= task.totalChapters;

    return prisma.task.update({
      where: { id, userId },
      data: {
        chapterCompletions: JSON.stringify(completions),
        completedChapters: newCount,
        ...(shouldMarkDone ? { status: 'DONE' as const, completedAt: new Date() } : {}),
      },
      include: {
        list: { select: { id: true, name: true, color: true } },
        section: { select: { id: true, name: true } },
        sourceTask: { select: { id: true, title: true, totalChapters: true, completedChapters: true } },
      },
    });
  },

  // 长期任务章节手动推进
  async advanceChapter(id: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new Error('任务不存在');
    }
    if (!task.isLongTerm) {
      throw new Error('该任务不是长期任务，无法推进章节');
    }
    if (task.totalChapters <= 0) {
      throw new Error('该长期任务未设置总章节数');
    }
    if (task.completedChapters >= task.totalChapters) {
      throw new Error('所有章节已完成');
    }

    const newCompletedChapters = task.completedChapters + 1;
    const shouldMarkDone = newCompletedChapters >= task.totalChapters;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 更新任务的已完成章节数，必要时标记为 DONE
      const updatedTask = await tx.task.update({
        where: { id, userId },
        data: {
          completedChapters: { increment: 1 },
          ...(shouldMarkDone
            ? { status: 'DONE', completedAt: new Date() }
            : {}),
        },
        include: {
          list: { select: { id: true, name: true, color: true } },
          section: { select: { id: true, name: true } },
          sourceTask: { select: { id: true, title: true, totalChapters: true, completedChapters: true } },
        },
      });

      // 2. 更新今日统计：完成章节数
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await tx.dailyStats.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        create: {
          userId,
          date: today,
          completedTasks: 1,
        },
        update: {
          completedTasks: { increment: 1 },
        },
      });

      return updatedTask;
    });
  },
};
