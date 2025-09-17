import { Router } from 'express';
import { env } from '../config/index.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'data-feeder-server',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV || 'development'
  });
});

export default router;
