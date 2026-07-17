import { Router, Request, Response, NextFunction } from 'express';
import { settingsService } from '../services/settings.service';
import { getOrCreateUser } from '../services/list.service';
import { validate } from '../middleware/validate';
import { updateSettingsSchema } from '../validators/settings.validator';
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

// GET /settings
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const settings = await settingsService.get(userId);
    success(res, settings);
  } catch (err) {
    next(err);
  }
});

// PUT /settings
router.put(
  '/',
  validate(updateSettingsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const settings = await settingsService.update(userId, req.body);
      success(res, settings);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
