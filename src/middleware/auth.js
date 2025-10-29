import { decodeToken } from '../utils/auth.js';
import { ROLES } from '../constants/roles.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const payload = decodeToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Invalid or malformed token' });
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const db = req.app.locals.db;
    const normalizedEmail = req.user.sub.toLowerCase().trim();
    const user = await db
      .collection('users')
      .findOne({ email: normalizedEmail }, { projection: { password_hash: 0 } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
}

/**
 * Middleware to check if user has required role(s)
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: roles,
        current: req.currentUser.role,
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 * @returns {Function} Express middleware
 */
export function requireAdmin(req, res, next) {
  return requireRole(ROLES.ADMIN)(req, res, next);
}

/**
 * Middleware to check if user is the owner of the resource or an admin
 * @param {Function} getResourceEmail - Function to extract email from request
 * @returns {Function} Express middleware
 */
export function isOwnerOrAdmin(getResourceEmail) {
  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resourceEmail = getResourceEmail(req);

    if (req.currentUser.role === ROLES.ADMIN || req.currentUser.email === resourceEmail) {
      return next();
    }

    return res.status(403).json({
      message: 'You can only access your own resources',
    });
  };
}
