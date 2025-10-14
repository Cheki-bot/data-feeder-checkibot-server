import { hashPassword, verifyPassword, generateToken } from '../../utils/auth.js';
import { createUserDocument, createUserResponse } from './user.model.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 60;
const BOLIVIA_TIMEZONE_OFFSET = -4; // UTC-4

/**
 * Register a new user
 * @param {Db} db - MongoDB database instance
 * @param {string} email - User email
 * @param {string} password - User password (plain text)
 * @param {string} role - User role (default: 'User')
 * @returns {Promise<Object>} User response without password
 */
export async function registerUser(db, email, password, role = 'User') {
  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const userDoc = createUserDocument(email, passwordHash, role);

  await db.collection('users').insertOne(userDoc);

  return createUserResponse(userDoc);
}

/**
 * Authenticate user and generate token
 * @param {Db} db - MongoDB database instance
 * @param {string} email - User email
 * @param {string} password - User password (plain text)
 * @returns {Promise<Object>} Access token and token type
 */
export async function loginUser(db, email, password) {
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Check if account is locked
  if (user.lockout_until) {
    const now = new Date();
    const lockoutUntil = new Date(user.lockout_until);

    if (now < lockoutUntil) {
      const timeRemainingMs = lockoutUntil - now;
      const minutesRemaining = Math.ceil(timeRemainingMs / 1000 / 60);

      const lockoutBoliviaTime = new Date(
        lockoutUntil.getTime() + BOLIVIA_TIMEZONE_OFFSET * 60 * 60 * 1000,
      );

      const error = new Error('ACCOUNT_LOCKED');
      error.minutesRemaining = minutesRemaining;
      error.unlockTime = lockoutBoliviaTime.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      throw error;
    } else {
      // Lockout period expired, reset
      await db.collection('users').updateOne(
        { email },
        {
          $set: { failed_attempts: 0 },
          $unset: { lockout_until: '' },
        },
      );
      user.failed_attempts = 0;
      delete user.lockout_until;
    }
  }

  // Check if account is active
  if (!user.is_active) {
    throw new Error('ACCOUNT_DEACTIVATED');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    const failedAttempts = (user.failed_attempts || 0) + 1;

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);

      await db.collection('users').updateOne(
        { email },
        {
          $set: {
            failed_attempts: failedAttempts,
            lockout_until: lockoutUntil,
          },
        },
      );

      const error = new Error('ACCOUNT_LOCKED_MAX_ATTEMPTS');
      error.lockoutMinutes = LOCKOUT_MINUTES;
      throw error;
    } else {
      await db.collection('users').updateOne({ email }, { $set: { failed_attempts: failedAttempts } });

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - failedAttempts;
      const error = new Error('INVALID_CREDENTIALS_WITH_ATTEMPTS');
      error.attemptsLeft = attemptsLeft;
      throw error;
    }
  }

  // Reset failed attempts on successful login
  await db.collection('users').updateOne(
    { email },
    {
      $set: { failed_attempts: 0 },
      $unset: { lockout_until: '' },
    },
  );

  // Generate token
  const token = generateToken(
    {
      sub: user.email,
      role: user.role,
    },
    '24h',
  );

  return {
    access_token: token,
    token_type: 'bearer',
  };
}

/**
 * Get user by email
 * @param {Db} db - MongoDB database instance
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User without password
 */
export async function getUserByEmail(db, email) {
  const user = await db.collection('users').findOne(
    { email },
    {
      projection: {
        password_hash: 0,
      },
    },
  );

  return user;
}

/**
 * Get all users (without passwords)
 * @param {Db} db - MongoDB database instance
 * @returns {Promise<Array>} List of users
 */
export async function getAllUsers(db) {
  const users = await db
    .collection('users')
    .find(
      {},
      {
        projection: {
          password_hash: 0,
        },
      },
    )
    .toArray();

  return users;
}

/**
 * Deactivate user account
 * @param {Db} db - MongoDB database instance
 * @param {string} email - User email
 * @returns {Promise<boolean>} Success status
 */
export async function deactivateUser(db, email) {
  const result = await db.collection('users').updateOne({ email }, { $set: { is_active: false } });

  return result.matchedCount > 0;
}

/**
 * Activate user account
 * @param {Db} db - MongoDB database instance
 * @param {string} email - User email
 * @returns {Promise<boolean>} Success status
 */
export async function activateUser(db, email) {
  const result = await db.collection('users').updateOne({ email }, { $set: { is_active: true } });

  return result.matchedCount > 0;
}

/**
 * Delete user account
 * @param {Db} db - MongoDB database instance
 * @param {string} email - User email
 * @returns {Promise<boolean>} Success status
 */
export async function deleteUser(db, email) {
  const result = await db.collection('users').deleteOne({ email });

  return result.deletedCount > 0;
}
