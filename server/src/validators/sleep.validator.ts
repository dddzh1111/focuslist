import { z } from 'zod';

export const createSleepRecordSchema = z.object({
  date: z.string(),
  sleepTime: z.string(),
  wakeTime: z.string().optional(),
  quality: z.enum(['GREAT', 'GOOD', 'FAIR', 'POOR']).optional(),
  notes: z.string().optional(),
});

export const updateSleepRecordSchema = z.object({
  sleepTime: z.string().optional(),
  wakeTime: z.string().optional(),
  quality: z.enum(['GREAT', 'GOOD', 'FAIR', 'POOR']).optional(),
  notes: z.string().optional(),
});

export const sleepQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
});
