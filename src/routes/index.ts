import { Router } from 'express';
import healthRouter from './health';
import authRouter from '../modules/auth/auth.routes';
import verificationsRouter from '../modules/verifications/verification.routes';
import categoriesRouter from '../modules/categories/categories.routes';
import calendarsRouter from '../modules/calendars/calendar.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/verifications', verificationsRouter);
router.use('/categories', categoriesRouter);
router.use('/calendars', calendarsRouter);

export default router;
