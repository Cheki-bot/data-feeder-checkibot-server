import { env } from '../../config/index.js';

/**
 * GET /api/health
 * Health check endpoint
 */
export function getHealthStatus(req, res) {
  res.json({
    status: 'ok',
    service: 'data-feeder-server',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV || 'development',
  });
}

export default {
  getHealthStatus,
};
