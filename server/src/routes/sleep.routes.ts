import { Router, Request, Response, NextFunction } from 'express';
import { sleepService } from '../services/sleep.service';
import { getOrCreateUser } from '../services/list.service';
import { validate } from '../middleware/validate';
import { success } from '../lib/apiResponse';
import { NotFoundError } from '../lib/errors';
import { createSleepRecordSchema, updateSleepRecordSchema, sleepQuerySchema } from '../validators/sleep.validator';

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

router.get(
  '/',
  validate(sleepQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const validatedQuery = (req as any).validatedQuery || req.query;
      const result = await sleepService.getAll(userId, validatedQuery);
      success(res, result.records, {
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

router.get(
  '/latest',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const record = await sleepService.getLatest(userId);
      success(res, record);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const { startDate, endDate } = req.query;
      const today = new Date();
      const defaultStart = new Date(today);
      defaultStart.setDate(today.getDate() - 7);
      const result = await sleepService.getStats(
        userId,
        (startDate as string) || defaultStart.toISOString().split('T')[0],
        (endDate as string) || today.toISOString().split('T')[0]
      );
      success(res, result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:date',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const record = await sleepService.getByDate(userId, req.params.date);
      if (!record) {
        throw new NotFoundError('睡眠记录不存在');
      }
      success(res, record);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  validate(createSleepRecordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const validatedBody = (req as any).validatedBody || req.body;
      const record = await sleepService.create(userId, validatedBody);
      success(res, record);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  validate(updateSleepRecordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const validatedBody = (req as any).validatedBody || req.body;
      const record = await sleepService.update(userId, req.params.id, validatedBody);
      if (!record) {
        throw new NotFoundError('睡眠记录不存在');
      }
      success(res, record);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const deleted = await sleepService.delete(userId, req.params.id);
      if (!deleted) {
        throw new NotFoundError('睡眠记录不存在');
      }
      success(res, null, { message: '删除成功' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
