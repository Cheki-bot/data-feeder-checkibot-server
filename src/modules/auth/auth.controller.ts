import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as AuthService from './auth.service.js';
import {
  AuthRequest,
  RegisterBody,
  LoginBody,
  UserDocument,
  getDb,
} from '../../types/authInterfaces.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 60;

/**
 * POST /api/auth/register
 * Register a new user with username, email and password
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { username, email, password } = req.body as RegisterBody;

  try {
    const db = getDb(req);
    const user = await AuthService.registerUser(db, username, email, password);

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    if (error instanceof Error && error.message === 'USERNAME_ALREADY_EXISTS') {
      res.status(400).json({ message: 'Username already taken' });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Implements account lockout after MAX_LOGIN_ATTEMPTS failed attempts
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body as LoginBody;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const db = getDb(req);
    const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

    if (user === null) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.lockout_until !== undefined && user.lockout_until !== null) {
      const now = new Date();
      const lockoutUntil = new Date(user.lockout_until);

      if (now < lockoutUntil) {
        const timeRemainingMs = lockoutUntil.getTime() - now.getTime();
        const minutesRemaining = Math.ceil(timeRemainingMs / 1000 / 60);

        res.status(403).json({
          message: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`,
          lockout_until: lockoutUntil.toISOString(),
        });
        return;
      } else {
        await db.collection<UserDocument>('users').updateOne(
          { email: normalizedEmail },
          {
            $set: { failed_attempts: 0 },
            $unset: { lockout_until: '' },
          },
        );
      }
    }

    const result = await AuthService.loginUser(db, email, password);

    await db.collection<UserDocument>('users').updateOne(
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

    if (error instanceof Error && error.message === 'ACCOUNT_DEACTIVATED') {
      res.status(403).json({
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
      return;
    }

    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      const db = getDb(req);
      const { email } = req.body as LoginBody;
      const normalizedEmail = email.toLowerCase().trim();
      const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

      if (user === null) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const failedAttempts = (user.failed_attempts ?? 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);

        await db.collection<UserDocument>('users').updateOne(
          { email: normalizedEmail },
          {
            $set: {
              failed_attempts: failedAttempts,
              lockout_until: lockoutUntil,
            },
          },
        );

        res.status(403).json({
          message: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
        });
        return;
      }

      await db
        .collection<UserDocument>('users')
        .updateOne({ email: normalizedEmail }, { $set: { failed_attempts: failedAttempts } });

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - failedAttempts;
      res.status(401).json({
        message: `Invalid credentials. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining.`,
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
export function getProfile(req: AuthRequest, res: Response): void {
  res.json(req.currentUser);
}

/**
 * GET /api/auth/users
 * List all users (Admin only)
 */
export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const users = await db
      .collection<UserDocument>('users')
      .find({}, { projection: { password_hash: 0, failed_attempts: 0, lockout_until: 0 } })
      .toArray();

    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('List users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}

/**
 * PATCH /api/auth/users/:email/deactivate
 * Deactivate a user account (Admin only)
 */
export async function deactivateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

    if (user === null) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.is_active === false) {
      res.status(400).json({ message: 'User is already deactivated' });
      return;
    }

    await db.collection<UserDocument>('users').updateOne(
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}

/**
 * PATCH /api/auth/users/:email/activate
 * Activate a user account (Admin only)
 */
export async function activateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

    if (user === null) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.is_active === true) {
      res.status(400).json({ message: 'User is already active' });
      return;
    }

    await db.collection<UserDocument>('users').updateOne(
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}

/**
 * DELETE /api/auth/users/:email
 * Delete a user account permanently (Admin only)
 */
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

    if (user === null) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const result = await db.collection<UserDocument>('users').deleteOne({ email: normalizedEmail });

    if (result.deletedCount === 0) {
      res.status(500).json({ message: 'Failed to delete user' });
      return;
    }

    res.json({ message: `User ${email} has been deleted permanently` });
  } catch (error) {
    console.error('Delete user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}
