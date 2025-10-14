import express from 'express';
import { validationResult } from 'express-validator';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';
import { registerValidation, loginValidation } from '../validators/auth.js';
import {
  authenticateToken,
  requireAdmin,
  getCurrentUser,
} from '../middleware/auth.js';

const router = express.Router();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 60;
const BOLIVIA_TIMEZONE_OFFSET = -4; // UTC-4

/**
 * POST /api/auth/register
 * Register a new user with email and password
 * Default role is 'User', can be set to 'Admin' (only by existing Admin)
 */
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role = 'User' } = req.body;

  try {
    const db = req.app.locals.db;

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);

    const userDoc = {
      email,
      password_hash: passwordHash,
      role,
      is_active: true,
      created_at: new Date(),
      failed_attempts: 0,
    };

    await db.collection('users').insertOne(userDoc);

    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...userResponse } = userDoc;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Implements account lockout after MAX_LOGIN_ATTEMPTS failed attempts
 */
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.lockout_until) {
      const now = new Date();
      const lockoutUntil = new Date(user.lockout_until);

      if (now < lockoutUntil) {
        const timeRemainingMs = lockoutUntil - now;
        const minutesRemaining = Math.ceil(timeRemainingMs / 1000 / 60);

        const lockoutBoliviaTime = new Date(
          lockoutUntil.getTime() + BOLIVIA_TIMEZONE_OFFSET * 60 * 60 * 1000
        );

        return res.status(403).json({
          message: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes (unlocks at ${lockoutBoliviaTime.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
        });
      } else {
        await db.collection('users').updateOne(
          { email },
          {
            $set: { failed_attempts: 0 },
            $unset: { lockout_until: '' },
          }
        );
        user.failed_attempts = 0;
        delete user.lockout_until;
      }
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ message: 'Account is deactivated. Contact administrator.' });
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      const failedAttempts = (user.failed_attempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = new Date(
          Date.now() + LOCKOUT_MINUTES * 60 * 1000
        );

        await db.collection('users').updateOne(
          { email },
          {
            $set: {
              failed_attempts: failedAttempts,
              lockout_until: lockoutUntil,
            },
          }
        );

        return res.status(403).json({
          message: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
        });
      } else {
        await db
          .collection('users')
          .updateOne({ email }, { $set: { failed_attempts: failedAttempts } });

        const attemptsLeft = MAX_LOGIN_ATTEMPTS - failedAttempts;
        return res.status(401).json({
          message: `Invalid credentials. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining.`,
        });
      }
    }

    await db.collection('users').updateOne(
      { email },
      {
        $set: { failed_attempts: 0 },
        $unset: { lockout_until: '' },
      }
    );

    const token = generateToken(
      {
        sub: user.email,
        role: user.role,
      },
      '24h'
    );

    res.json({
      access_token: token,
      token_type: 'bearer',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Requires valid JWT token
 */
router.get('/me', authenticateToken, getCurrentUser, (req, res) => {
  res.json(req.currentUser);
});

/**
 * PATCH /api/auth/users/:email/deactivate
 * Deactivate a user account (Admin only)
 * User will not be able to login until reactivated
 */
router.patch(
  '/users/:email/deactivate',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { email } = req.params;

    try {
      const db = req.app.locals.db;

      const result = await db
        .collection('users')
        .updateOne({ email }, { $set: { is_active: false } });

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: `User ${email} has been deactivated` });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * PATCH /api/auth/users/:email/activate
 * Activate a previously deactivated user account (Admin only)
 */
router.patch(
  '/users/:email/activate',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { email } = req.params;

    try {
      const db = req.app.locals.db;

      const result = await db
        .collection('users')
        .updateOne({ email }, { $set: { is_active: true } });

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: `User ${email} has been activated` });
    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * DELETE /api/auth/users/:email
 * Permanently delete a user account (Admin only)
 * This action cannot be undone
 */
router.delete(
  '/users/:email',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const { email } = req.params;

    try {
      const db = req.app.locals.db;

      if (email === req.user.sub) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const result = await db.collection('users').deleteOne({ email });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: `User ${email} has been deleted permanently` });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * GET /api/auth/users
 * List all users (Admin only)
 * Returns users without password hashes
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;

    const users = await db
      .collection('users')
      .find(
        {},
        {
          projection: {
            password_hash: 0,
          },
        }
      )
      .toArray();

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
