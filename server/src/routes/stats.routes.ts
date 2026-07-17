import { Router, Request, Response, NextFunction } from 'express';
import { statsService } from '../services/stats.service';
import { getOrCreateUser } from '../services/list.service';
import { success } from '../lib/apiResponse';

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

// GET /stats/overview
router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const data = await statsService.getOverview(userId);
    success(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /stats/daily
router.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const start = (req.query.start as string) || new Date().toISOString().split('T')[0];
    const end = (req.query.end as string) || new Date().toISOString().split('T')[0];
    const data = await statsService.getDaily(userId, start, end);
    success(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /stats/by-task
router.get('/by-task', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const start = (req.query.start as string) || new Date().toISOString().split('T')[0];
    const end = (req.query.end as string) || new Date().toISOString().split('T')[0];
    const data = await statsService.getByTask(userId, start, end);
    success(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /stats/by-list
router.get('/by-list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const start = (req.query.start as string) || new Date().toISOString().split('T')[0];
    const end = (req.query.end as string) || new Date().toISOString().split('T')[0];
    const data = await statsService.getByList(userId, start, end);
    success(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /stats/by-tag
router.get('/by-tag', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const start = (req.query.start as string) || new Date().toISOString().split('T')[0];
    const end = (req.query.end as string) || new Date().toISOString().split('T')[0];
    const data = await statsService.getByTag(userId, start, end);
    success(res, data);
  } catch (err) {
    next(err);
  }
});

// GET /stats/list-progress
router.get('/list-progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const data = await statsService.getListProgress(userId);
    success(res, data);
  } catch (err) {
    next(err);
  }
});

export default router;
