import { Response } from 'express';
import { validationResult } from 'express-validator';
import {
  AuthRequest,
  LoginBody,
  RegisterBody,
  UserDocument,
  getDb,
} from '../../types/authInterfaces';
import { generateToken } from '../../utils/auth';
import * as AuthService from './auth.service';

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

    // Generate token for the new user
    const token = generateToken(
      {
        sub: user.email,
        username: user.username,
        role: user.role,
      },
      '24h',
    );

    res.status(201).json({
      message: 'User registered successfully',
      ok: true,
      status: 201,
      data: {
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        access_token: token,
        token_type: 'bearer',
      },
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
