import { validationResult } from 'express-validator';
import * as AuthService from './auth.service.js';

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

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid email or password' });
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
