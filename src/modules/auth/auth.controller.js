import { validationResult } from 'express-validator';
import * as AuthService from './auth.service.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 60;

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
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.lockout_until) {
      const now = new Date();
      const lockoutUntil = new Date(user.lockout_until);

      if (now < lockoutUntil) {
        const timeRemainingMs = lockoutUntil - now;
        const minutesRemaining = Math.ceil(timeRemainingMs / 1000 / 60);

        return res.status(403).json({
          message: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`,
          lockout_until: lockoutUntil.toISOString(),
        });
      } else {
        await db.collection('users').updateOne(
          { email: normalizedEmail },
          {
            $set: { failed_attempts: 0 },
            $unset: { lockout_until: '' },
          },
        );
      }
    }

    const result = await AuthService.loginUser(db, email, password);

    await db.collection('users').updateOne(
      { email: normalizedEmail },
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

    if (error.message === 'ACCOUNT_DEACTIVATED') {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    if (error.message === 'INVALID_CREDENTIALS') {
      const db = req.app.locals.db;
      const normalizedEmail = req.body.email.toLowerCase().trim();
      const user = await db.collection('users').findOne({ email: normalizedEmail });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const failedAttempts = (user.failed_attempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);

        await db.collection('users').updateOne(
          { email: normalizedEmail },
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
        .updateOne({ email: normalizedEmail }, { $set: { failed_attempts: failedAttempts } });

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

/**
 * GET /api/auth/users
 * List all users (Admin only)
 */
export async function listUsers(req, res) {
  try {
    const db = req.app.locals.db;
    const users = await db
      .collection('users')
      .find({}, { projection: { password_hash: 0, failed_attempts: 0, lockout_until: 0 } })
      .toArray();

    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * PATCH /api/auth/users/:email/deactivate
 * Deactivate a user account (Admin only)
 */

export async function deactivateUser(req, res) {
  try {
    const db = req.app.locals.db;
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(400).json({ message: 'User is already deactivated' });
    }

    await db.collection('users').updateOne(
      { email: normalizedEmail },
      {
        $set: {
          is_active: false,
          updated_at: new Date(),
        },
      },
    );

    res.json({ message: `User ${email} has been deactivated` });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * PATCH /api/auth/users/:email/activate
 * Activate a user account (Admin only)
 */

export async function activateUser(req, res) {
  try {
    const db = req.app.locals.db;
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_active) {
      return res.status(400).json({ message: 'User is already active' });
    }

    await db.collection('users').updateOne(
      { email: normalizedEmail },
      {
        $set: {
          is_active: true,
          updated_at: new Date(),
        },
      },
    );

    res.json({ message: `User ${email} has been activated` });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * DELETE /api/auth/users/:email
 * Delete a user account permanently (Admin only)
 */

export async function deleteUser(req, res) {
  try {
    const db = req.app.locals.db;
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await db.collection('users').deleteOne({ email: normalizedEmail });

    if (result.deletedCount === 0) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }

    res.json({ message: `User ${email} has been deleted permanently` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
