import { Router } from 'express';
import listRoutes from './list.routes';
import taskRoutes from './task.routes';
import pomodoroRoutes from './pomodoro.routes';
import calendarRoutes from './calendar.routes';
import statsRoutes from './stats.routes';
import settingsRoutes from './settings.routes';
import sectionRoutes from './section.routes';

const router = Router();

router.use('/lists', listRoutes);
router.use('/tasks', taskRoutes);
router.use('/pomodoros', pomodoroRoutes);
router.use('/calendar', calendarRoutes);
router.use('/stats', statsRoutes);
router.use('/settings', settingsRoutes);
router.use('/', sectionRoutes);

export default router;
