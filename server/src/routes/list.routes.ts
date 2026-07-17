import { Router, Request, Response, NextFunction } from 'express';
import { listService, getOrCreateUser } from '../services/list.service';
import { validate } from '../middleware/validate';
import {
  createListSchema,
  updateListSchema,
  reorderListsSchema,
} from '../validators/list.validator';
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

// GET /lists
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const lists = await listService.getAll(userId);
    success(res, lists);
  } catch (err) {
    next(err);
  }
});

// POST /lists
router.post(
  '/',
  validate(createListSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const list = await listService.create(userId, req.body);
      success(res, list);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /lists/:id
router.put(
  '/:id',
  validate(updateListSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      const list = await listService.update(req.params.id as string, userId, req.body);
      success(res, list);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /lists/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    await listService.delete(req.params.id as string, userId);
    success(res, null);
  } catch (err) {
    next(err);
  }
});

// PATCH /lists/reorder
router.patch(
  '/reorder',
  validate(reorderListsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as Request & { userId: string }).userId;
      await listService.reorder(userId, req.body.orderedIds);
      success(res, null);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
