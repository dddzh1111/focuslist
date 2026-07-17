import { z } from 'zod';

const dateLikeSchema = z.union([
  z.string().datetime(),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确，应为 YYYY-MM-DD'),
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: dateLikeSchema.optional().nullable(),
  estimatedPomos: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  listId: z.string().uuid().optional().nullable(),
  sectionId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  // 长期任务相关
  isLongTerm: z.boolean().optional(),
  totalChapters: z.number().int().min(0).optional(),
  sourceTaskId: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime().optional().nullable(),
  completedChapters: z.number().int().min(0).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

export const reorderTasksSchema = z.object({
  listId: z.string().uuid().optional().nullable(),
  orderedIds: z.array(z.string()),
});

export const taskQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  listId: z.string().optional(),
  sectionId: z.string().optional(),
  tag: z.string().optional(),
  keyword: z.string().optional(),
  dueDate: z.enum(['today', 'week', 'overdue']).optional(),
  isLongTerm: z.enum(['true', 'false']).optional(),
  sort: z.enum(['priority', 'dueDate', 'createdAt', 'sortOrder']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.preprocess((v) => Number(v) || 1, z.number().int().min(1)).optional().default(1),
  pageSize: z.preprocess((v) => Number(v) || 20, z.number().int().min(1).max(100)).optional().default(20),
});
