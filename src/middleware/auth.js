import { decodeToken } from '../utils/auth.js';

/**
 * Middleware to authenticate JWT token from Authorization header
 * Extracts token from "Bearer TOKEN" format and validates it
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

/**
 * Middleware to verify that the authenticated user is an Admin
 * Must be used after authenticateToken middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required. Insufficient permissions.' });
  }
  next();
}

/**
 * Middleware to fetch the complete user document from database
 * Must be used after authenticateToken middleware
 * Attaches full user object to req.currentUser
 */
export async function getCurrentUser(req, res, next) {
  try {
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({
      email: req.user.sub,
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
    }

    delete user.password_hash;
    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
}
