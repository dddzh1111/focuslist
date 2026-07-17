import { Router, Request, Response, NextFunction } from 'express';
import { pomodoroService } from '../services/pomodoro.service';
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

// POST /
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const record = await pomodoroService.create(userId, req.body);
    success(res, record);
  } catch (err) {
    next(err);
  }
});

// GET /
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await pomodoroService.getAll(userId, page, pageSize);
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

// GET /today
router.get('/today', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const summary = await pomodoroService.getToday(userId);
    success(res, summary);
  } catch (err) {
    next(err);
  }
});

// PATCH /:id/interrupt
router.patch('/:id/interrupt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const interruptedAt = req.body.interruptedAt || new Date().toISOString();
    const record = await pomodoroService.interrupt(req.params.id as string, userId, interruptedAt);
    success(res, record);
  } catch (err) {
    next(err);
  }
});

export default router;
