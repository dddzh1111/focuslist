import { Router, Request, Response, NextFunction } from 'express';
import { sectionService } from '../services/section.service';
import { getOrCreateUser } from '../services/list.service';
import { validate } from '../middleware/validate';
import {
  createSectionSchema,
  updateSectionSchema,
} from '../validators/section.validator';
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

// GET /lists/:listId/sections
router.get('/lists/:listId/sections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const sections = await sectionService.getByListId(req.params.listId as string, userId);
    success(res, sections);
  } catch (err) {
    next(err);
  }
});

// POST /lists/:listId/sections
router.post(
  '/lists/:listId/sections',
  validate(createSectionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const section = await sectionService.create(req.params.listId as string, userId, req.body);
      success(res, section);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /sections/:id
router.put(
  '/sections/:id',
  validate(updateSectionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const section = await sectionService.update(req.params.id as string, userId, req.body);
      success(res, section);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /sections/:id
router.delete('/sections/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    await sectionService.delete(req.params.id as string, userId);
    success(res, null);
  } catch (err) {
    next(err);
  }
});

export default router;
