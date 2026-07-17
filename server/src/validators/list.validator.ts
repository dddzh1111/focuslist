import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().min(1, '清单名称不能为空').max(100),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const reorderListsSchema = z.object({
  orderedIds: z.array(z.string()),
});
