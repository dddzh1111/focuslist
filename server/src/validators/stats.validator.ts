import { z } from 'zod';

export const statsQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period: z.enum(['7d', '30d', '90d']).optional(),
});
