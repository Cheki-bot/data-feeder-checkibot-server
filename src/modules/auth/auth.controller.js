import { validationResult } from 'express-validator';
import * as AuthService from './auth.service.js';

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role = 'User' } = req.body;

  try {
    const db = req.app.locals.db;
    const user = await AuthService.registerUser(db, email, password, role);

    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(400).json({ message: 'Email already registered' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const db = req.app.locals.db;
    const result = await AuthService.loginUser(db, email, password);

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (error.message === 'ACCOUNT_LOCKED') {
      return res.status(403).json({
        message: `Account locked due to too many failed attempts. Try again in ${error.minutesRemaining} minutes (unlocks at ${error.unlockTime})`,
      });
    }

    if (error.message === 'ACCOUNT_LOCKED_MAX_ATTEMPTS') {
      return res.status(403).json({
        message: `Account locked due to too many failed attempts. Try again in ${error.lockoutMinutes} minutes.`,
      });
    }

    if (error.message === 'INVALID_CREDENTIALS_WITH_ATTEMPTS') {
      return res.status(401).json({
        message: `Invalid credentials. ${error.attemptsLeft} ${error.attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining.`,
      });
    }

    if (error.message === 'ACCOUNT_DEACTIVATED') {
      return res.status(403).json({ message: 'Account is deactivated. Contact administrator.' });
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
    const users = await AuthService.getAllUsers(db);

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * PATCH /api/auth/users/:email/deactivate
 * Deactivate a user account (Admin only)
 */
export async function deactivateUserAccount(req, res) {
  const { email } = req.params;

  try {
    const db = req.app.locals.db;
    const success = await AuthService.deactivateUser(db, email);

    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${email} has been deactivated` });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * PATCH /api/auth/users/:email/activate
 * Activate a previously deactivated user account (Admin only)
 */
export async function activateUserAccount(req, res) {
  const { email } = req.params;

  try {
    const db = req.app.locals.db;
    const success = await AuthService.activateUser(db, email);

    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${email} has been activated` });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * DELETE /api/auth/users/:email
 * Permanently delete a user account (Admin only)
 */
export async function deleteUserAccount(req, res) {
  const { email } = req.params;

  try {
    const db = req.app.locals.db;

    if (email === req.user.sub) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const success = await AuthService.deleteUser(db, email);

    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${email} has been deleted permanently` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default {
  register,
  login,
  getProfile,
  listUsers,
  deactivateUserAccount,
  activateUserAccount,
  deleteUserAccount,
};
