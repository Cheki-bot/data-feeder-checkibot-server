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

  const { email, password } = req.body;

  try {
    const db = req.app.locals.db;
    const user = await AuthService.registerUser(db, email, password);

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

export default {
  register,
  login,
  getProfile,
};

