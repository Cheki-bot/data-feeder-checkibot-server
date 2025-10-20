import { decodeToken } from '../utils/auth.js';

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
    const user = await db
      .collection('users')
      .findOne({ email: req.user.sub }, { projection: { password_hash: 0 } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
}
