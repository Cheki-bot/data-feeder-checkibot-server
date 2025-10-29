import { Router } from 'express';
import healthRouter from './health';
import authRouter from '../modules/auth/auth.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);

export default router;
