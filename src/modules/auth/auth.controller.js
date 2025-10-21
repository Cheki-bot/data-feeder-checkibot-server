import { validationResult } from 'express-validator';
import * as AuthService from './auth.service.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 60;
const BOLIVIA_TIMEZONE_OFFSET = -4;

/**
 * POST /api/auth/register
 * Register a new user with username, email and password
 */
export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const db = req.app.locals.db;
    const user = await AuthService.registerUser(db, username, email, password);

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (error.message === 'USERNAME_ALREADY_EXISTS') {
      return res.status(400).json({ message: 'Username already taken' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Implements account lockout after MAX_LOGIN_ATTEMPTS failed attempts
 */
export async function login(req, res) {
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
          lockoutUntil.getTime() + BOLIVIA_TIMEZONE_OFFSET * 60 * 60 * 1000,
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
          },
        );
      }
    }

    const result = await AuthService.loginUser(db, email, password);

    await db.collection('users').updateOne(
      { email },
      {
        $set: { failed_attempts: 0 },
        $unset: { lockout_until: '' },
      },
    );

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'INVALID_CREDENTIALS') {
      const db = req.app.locals.db;
      const user = await db.collection('users').findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const failedAttempts = (user.failed_attempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);

        await db.collection('users').updateOne(
          { email: req.body.email },
          {
            $set: {
              failed_attempts: failedAttempts,
              lockout_until: lockoutUntil,
            },
          },
        );

        return res.status(403).json({
          message: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
        });
      }

      await db
        .collection('users')
        .updateOne({ email: req.body.email }, { $set: { failed_attempts: failedAttempts } });

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - failedAttempts;
      return res.status(401).json({
        message: `Invalid credentials. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining.`,
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
export function getProfile(req, res) {
  res.json(req.currentUser);
}

export default {
  register,
  login,
  getProfile,
};
