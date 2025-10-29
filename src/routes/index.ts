import { Router } from 'express';
import healthRouter from './health';
import authRouter from '../modules/auth/auth.routes.js';
import newsRouter from '../modules/news/news.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/news', newsRouter);

export default router;
