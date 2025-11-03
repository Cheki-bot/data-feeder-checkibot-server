import { Router } from 'express';
import healthRouter from './health';
import authRouter from '../modules/auth/auth.routes.js';
import categoriesRouter from '../modules/categories/categories.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/categories', categoriesRouter);

export default router;
