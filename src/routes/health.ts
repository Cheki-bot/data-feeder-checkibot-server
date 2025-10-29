import { Router, Request, Response } from 'express';
import { env } from '../config';

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
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'data-feeder-server',
    timestamp: new Date().toISOString(),
    env:
      typeof env.NODE_ENV === 'string' && env.NODE_ENV.trim() !== '' ? env.NODE_ENV : 'development',
  });
});

export default router;
