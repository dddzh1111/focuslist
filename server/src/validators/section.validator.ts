import { z } from 'zod';

export const createSectionSchema = z.object({
  name: z.string().min(1, '单元名称不能为空').max(100),
  sortOrder: z.number().int().optional(),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().optional(),
});
