import prisma from '../lib/prisma';

export interface CreateSleepRecordData {
  date: string;
  sleepTime: string;
  wakeTime?: string;
  quality?: 'GREAT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
}

export interface UpdateSleepRecordData {
  sleepTime?: string;
  wakeTime?: string;
  quality?: 'GREAT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
}

function calculateDurationMinutes(sleepTime: string, wakeTime?: string): number | null {
  if (!wakeTime) return null;
  const sleep = new Date(sleepTime).getTime();
  const wake = new Date(wakeTime).getTime();
  if (isNaN(sleep) || isNaN(wake)) return null;
  return Math.round((wake - sleep) / (1000 * 60));
}

export const sleepService = {
  async getAll(userId: string, options?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }) {
    const { startDate, endDate, page = 1, pageSize = 30 } = options || {};

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const [records, total] = await Promise.all([
      prisma.sleepRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.sleepRecord.count({ where }),
    ]);

    return {
      records,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getByDate(userId: string, date: string) {
    return prisma.sleepRecord.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
    });
  },

  async create(userId: string, data: CreateSleepRecordData) {
    const durationMinutes = calculateDurationMinutes(data.sleepTime, data.wakeTime);

    return prisma.sleepRecord.create({
      data: {
        userId,
        date: new Date(data.date),
        sleepTime: new Date(data.sleepTime),
        wakeTime: data.wakeTime ? new Date(data.wakeTime) : null,
        durationMinutes,
        quality: data.quality,
        notes: data.notes || '',
      },
    });
  },

  async update(userId: string, id: string, data: UpdateSleepRecordData) {
    const existing = await prisma.sleepRecord.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const sleepTime = data.sleepTime ? new Date(data.sleepTime) : existing.sleepTime;
    const wakeTime = data.wakeTime !== undefined
      ? (data.wakeTime ? new Date(data.wakeTime) : null)
      : existing.wakeTime;

    const durationMinutes = calculateDurationMinutes(
      sleepTime.toISOString(),
      wakeTime?.toISOString()
    );

    return prisma.sleepRecord.update({
      where: { id },
      data: {
        ...(data.sleepTime && { sleepTime: new Date(data.sleepTime) }),
        ...(data.wakeTime !== undefined && {
          wakeTime: data.wakeTime ? new Date(data.wakeTime) : null,
        }),
        ...(data.quality !== undefined && { quality: data.quality }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(durationMinutes !== null && { durationMinutes }),
      },
    });
  },

  async delete(userId: string, id: string) {
    const existing = await prisma.sleepRecord.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.sleepRecord.delete({ where: { id } });
    return true;
  },

  async getStats(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await prisma.sleepRecord.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    const recordsWithDuration = records.filter((r) => r.durationMinutes !== null);
    const totalDuration = recordsWithDuration.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
    const avgDuration = recordsWithDuration.length > 0
      ? Math.round(totalDuration / recordsWithDuration.length)
      : 0;

    const qualityCounts: Record<string, number> = { GREAT: 0, GOOD: 0, FAIR: 0, POOR: 0 };
    records.forEach((r) => {
      if (r.quality) {
        qualityCounts[r.quality] = (qualityCounts[r.quality] || 0) + 1;
      }
    });

    return {
      totalRecords: records.length,
      avgDurationMinutes: avgDuration,
      totalDurationMinutes: totalDuration,
      qualityCounts,
      records,
    };
  },

  async getLatest(userId: string) {
    return prisma.sleepRecord.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  },
};
