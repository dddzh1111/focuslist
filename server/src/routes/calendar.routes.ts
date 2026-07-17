import { Router, Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/calendar.service';
import { getOrCreateUser } from '../services/list.service';
import { validate } from '../middleware/validate';
import { calendarQuerySchema } from '../validators/calendar.validator';
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

// GET /calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get(
  '/',
  validate(calendarQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const { start, end } = req.query as { start: string; end: string };
      const grouped = await calendarService.getByDateRange(userId, start, end);
      success(res, grouped);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
