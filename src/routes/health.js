import { Router } from 'express';
import { env } from '../config/index.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Estado del servicio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: data-feeder-server
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 env:
 *                   type: string
 *                   example: development
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'data-feeder-server',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV || 'development',
  });
});

export default router;
