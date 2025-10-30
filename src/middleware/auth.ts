import { Response, NextFunction } from 'express';
import { decodeToken } from '../utils/auth';
import { ROLES } from '../constants/roles';
import { AuthRequest, UserDocument, getDb } from '../types/authInterfaces';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token === undefined) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const payload = decodeToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token has expired' });
      return;
    }
    res.status(401).json({ message: 'Invalid or malformed token' });
  }
}

export async function getCurrentUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const db = getDb(req);
    if (req.user?.sub === undefined || req.user.sub === null || req.user.sub === '') {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }
    const normalizedEmail = req.user.sub.toLowerCase().trim();
    const user = await db
      .collection<UserDocument>('users')
      .findOne({ email: normalizedEmail }, { projection: { password_hash: 0 } });

    if (user === null) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.currentUser = user;
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Database error', error: errorMessage });
  }
}

/**
 * Middleware to check if user has required role(s)
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.currentUser === undefined) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.currentUser.role)) {
      res.status(403).json({
        message: 'Insufficient permissions',
        required: roles,
        current: req.currentUser.role,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  return requireRole(ROLES.ADMIN)(req, res, next);
}

/**
 * Middleware to check if user is the owner of the resource or an admin
 */
export function isOwnerOrAdmin(getResourceEmail: (req: AuthRequest) => string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.currentUser === undefined) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const resourceEmail = getResourceEmail(req);

    if (req.currentUser.role === ROLES.ADMIN || req.currentUser.email === resourceEmail) {
      next();
      return;
    }

    res.status(403).json({
      message: 'You can only access your own resources',
    });
  };
}
