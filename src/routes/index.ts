import { Router } from 'express';
import healthRouter from './health';
import authRouter from '../modules/auth/auth.routes';
import verificationsRouter from '../modules/verifications/verification.routes';
import categoriesRouter from '../modules/categories/categories.routes';
import calendarEventsRouter from '../modules/calendar-events/calendar-event.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/verifications', verificationsRouter);
router.use('/categories', categoriesRouter);
router.use('/calendar-events', calendarEventsRouter);

export default router;
