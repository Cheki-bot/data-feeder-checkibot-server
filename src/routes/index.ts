import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';
import calendarEventsRouter from '../modules/calendar-events/calendar-event.routes';
import calendarsRouter from '../modules/calendars/calendar.routes';
import categoriesRouter from '../modules/categories/categories.routes';
import partiesRouter from '../modules/political-parties/political-parties.routes';
import verificationsRouter from '../modules/verifications/verification.routes';
import healthRouter from './health';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/verifications', verificationsRouter);
router.use('/categories', categoriesRouter);
router.use('/calendar-events', calendarEventsRouter);
router.use('/calendars', calendarsRouter);
router.use('/political-parties', partiesRouter);

export default router;
