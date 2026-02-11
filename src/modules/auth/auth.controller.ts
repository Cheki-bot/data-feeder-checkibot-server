import { Response } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import * as AuthService from './auth.service';
import {
  AuthRequest,
  RegisterBody,
  LoginBody,
  UserDocument,
  getDb,
} from '../../types/authInterfaces';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 60;

/**
 * POST /api/auth/register
 * Register a new user with username, email and password
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation errors',
      ok: false,
      status: 400,
      errors: errors.array(),
    });
    return;
  }

  const { username, email, password, role } = req.body as RegisterBody;
  try {
    const db = getDb(req);
    const user = await AuthService.registerUser(db, username, email, password, role);

    res.status(201).json({
      message: 'User registered successfully',
      ok: true,
      status: 201,
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      res.status(400).json({
        message: 'Email already registered',
        ok: false,
        status: 400,
      });
      return;
    }

    if (error instanceof Error && error.message === 'USERNAME_ALREADY_EXISTS') {
      res.status(400).json({
        message: 'Username already taken',
        ok: false,
        status: 400,
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
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
    res.status(400).json({
      message: 'Validation errors',
      ok: false,
      status: 400,
      errors: errors.array(),
    });
    return;
  }

  const { email, password } = req.body as LoginBody;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const db = getDb(req);
    const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

    if (user === null) {
      res.status(401).json({
        message: 'Invalid credentials',
        ok: false,
        status: 401,
      });
      return;
    }

    if (user.lockout_until != null) {
      const now = new Date();
      const lockoutUntil = new Date(user.lockout_until);

      if (now < lockoutUntil) {
        const timeRemainingMs = lockoutUntil.getTime() - now.getTime();
        const minutesRemaining = Math.ceil(timeRemainingMs / 1000 / 60);

        res.status(403).json({
          message: `Account locked due to too many failed attempts. Try again in ${minutesRemaining} minutes.`,
          ok: false,
          status: 403,
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
      ok: true,
      status: 200,
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error && error.message === 'ACCOUNT_DEACTIVATED') {
      res.status(403).json({
        message: 'Your account has been deactivated. Please contact an administrator.',
        ok: false,
        status: 403,
      });
      return;
    }

    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      const db = getDb(req);
      const { email } = req.body as LoginBody;
      const normalizedEmail = email.toLowerCase().trim();
      const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

      if (user === null) {
        res.status(401).json({
          message: 'Invalid credentials',
          ok: false,
          status: 401,
        });
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
          ok: false,
          status: 403,
        });
        return;
      }

      await db
        .collection<UserDocument>('users')
        .updateOne({ email: normalizedEmail }, { $set: { failed_attempts: failedAttempts } });

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - failedAttempts;
      res.status(401).json({
        message: `Invalid credentials. ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining.`,
        ok: false,
        status: 401,
      });
      return;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
export function getProfile(req: AuthRequest, res: Response): void {
  res.json({
    message: 'Profile retrieved successfully',
    ok: true,
    status: 200,
    data: req.currentUser,
  });
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
      message: 'Users retrieved successfully',
      ok: true,
      status: 200,
      data: users,
    });
  } catch (error) {
    console.error('List users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * PUT /api/auth/users/:id/deactivate
 * Deactivate a user (Admin only)
 */
export async function deactivateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const result = await db.collection<UserDocument>('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          is_active: false,
          updated_at: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User deactivated successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * PUT /api/auth/users/:id/activate
 * Activate a user (Admin only)
 */
export async function activateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const result = await db.collection<UserDocument>('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          is_active: true,
          updated_at: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User activated successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Activate user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * DELETE /api/auth/users/:id
 * Delete a user (Admin only)
 */
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const result = await db
      .collection<UserDocument>('users')
      .deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User deleted successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * PATCH /auth/change-password
 * Change user password
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation errors',
      ok: false,
      status: 400,
      errors: errors.array(),
    });
    return;
  }

  try {
    if (!req.user) {
      res.status(401).json({ message: 'UNAUTHORIZED', ok: false, status: 401 });
      return;
    }

    interface ChangePasswordBody {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }

    const { currentPassword, newPassword } = req.body as ChangePasswordBody;

    const db = getDb(req);
    const result = await AuthService.changePassword(db, req.user.sub, currentPassword, newPassword);

    res.status(200).json({
      message: result.message,
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Change password error:', error);

    if (error instanceof Error) {
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        res.status(401).json({
          message: 'Current password is incorrect',
          ok: false,
          status: 401,
        });
        return;
      }
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({
          message: 'User not found',
          ok: false,
          status: 404,
        });
        return;
      }
    }

    res.status(500).json({
      message: 'Internal server error',
      ok: false,
      status: 500,
    });
  }
}
