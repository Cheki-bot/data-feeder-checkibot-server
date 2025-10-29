import { Router } from 'express';
import healthRouter from './health';
import authRouter from '../modules/auth/auth.routes.js';
import verificationsRouter from '../modules/verifications/verification.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/verifications', verificationsRouter);

export default router;
