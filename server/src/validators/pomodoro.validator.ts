import { z } from 'zod';

export const createPomodoroSchema = z.object({
  taskId: z.string().uuid('无效的任务 ID'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  duration: z.number().int().min(1, '计时时长必须大于 0'),
  type: z.enum(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK']).optional(),
  completed: z.boolean().optional(),
});

export const interruptPomodoroSchema = z.object({
  interruptedAt: z.string().datetime(),
});
