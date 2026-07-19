import { Router, Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { getOrCreateUser } from '../services/list.service';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  reorderTasksSchema,
  taskQuerySchema,
} from '../validators/task.validator';
import { success } from '../lib/apiResponse';
import { NotFoundError } from '../lib/errors';
import { z } from 'zod';

const router = Router();

async function ensureUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await getOrCreateUser();
    (req as Request & { userId: string }).userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}

router.use(ensureUser);

// GET /tasks
router.get(
  '/',
  validate(taskQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const validatedQuery = (req as any).validatedQuery || req.query;
      const result = await taskService.getAll(userId, validatedQuery);
      success(res, result.tasks, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /tasks/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const task = await taskService.getById(req.params.id as string, userId);
    if (!task) throw new NotFoundError('任务');
    success(res, task);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id/pomodoros
router.get('/:id/pomodoros', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const { pomodoroService } = await import('../services/pomodoro.service');
    const result = await pomodoroService.getByTaskId(userId, req.params.id as string, page, pageSize);
    success(res, result.records, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
});

// POST /tasks
router.post(
  '/',
  validate(createTaskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const task = await taskService.create(userId, req.body);
      success(res, task);
    } catch (err) {
      next(err);
    }
  }
);

// POST /tasks/from-long-term/:id  — 从长期任务选取作为今日短期任务
const selectFromLongTermSchema = z.object({
  title: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  chapterIndex: z.number().int().min(1).optional(),
});

router.post(
  '/from-long-term/:id',
  validate(selectFromLongTermSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const task = await taskService.selectFromLongTerm(userId, req.params.id as string, req.body);
      success(res, task);
    } catch (err) {
      next(err);
    }
  }
);

// POST /tasks/:id/subtasks
router.post(
  '/:id/subtasks',
  validate(createTaskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const task = await taskService.create(userId, {
        ...req.body,
        parentId: req.params.id as string,
      });
      success(res, task);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /tasks/:id
router.put(
  '/:id',
  validate(updateTaskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const task = await taskService.update(req.params.id as string, userId, req.body);
      success(res, task);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /tasks/:id/status
router.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const task = await taskService.updateStatus(req.params.id as string, userId, req.body.status);
      success(res, task);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /tasks/reorder
router.patch(
  '/reorder',
  validate(reorderTasksSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      await taskService.reorder(userId, req.body.listId, req.body.orderedIds);
      success(res, null);
    } catch (err) {
      next(err);
    }
  }
);

// POST /tasks/:id/advance-chapter
router.post('/:id/advance-chapter', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const task = await taskService.advanceChapter(req.params.id as string, userId);
    success(res, task);
  } catch (err) {
    next(err);
  }
});

// PATCH /tasks/:id/chapters/:chapterIndex/toggle
const toggleChapterSchema = z.object({
  completed: z.boolean(),
});

router.patch(
  '/:id/chapters/:chapterIndex/toggle',
  validate(toggleChapterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const chapterIndex = parseInt(req.params.chapterIndex as string, 10);
      if (isNaN(chapterIndex) || chapterIndex < 1) {
        throw new Error('无效的章节编号');
      }
      const task = await taskService.toggleChapter(
        req.params.id as string,
        userId,
        chapterIndex,
        req.body.completed
      );
      success(res, task);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /tasks/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    await taskService.delete(req.params.id as string, userId);
    success(res, null);
  } catch (err) {
    next(err);
  }
});

export default router;
