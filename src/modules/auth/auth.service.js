import { hashPassword, verifyPassword, generateToken } from '../../utils/auth.js';
import { createUserDocument, createUserResponse } from './user.model.js';

/**
 * Register a new user
 * @param {Db} db - MongoDB database instance
 * @param {string} username - User username
 * @param {string} email - User email
 * @param {string} password - User password (plain text)
 * @returns {Promise<Object>} User response without password
 */
export async function registerUser(db, username, email, password) {
  // Check if username already exists
  const existingUsername = await db.collection('users').findOne({ username });
  if (existingUsername) {
    throw new Error('USERNAME_ALREADY_EXISTS');
  }

  // Check if email already exists
  const existingEmail = await db.collection('users').findOne({ email });
  if (existingEmail) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const userDoc = createUserDocument(username, email, passwordHash);

  await db.collection('users').insertOne(userDoc);

  return createUserResponse(userDoc);
}

/**
 * Authenticate user and generate token
 * @param {Db} db - MongoDB database instance
 * @param {string} email - User email
 * @param {string} password - User password (plain text)
 * @returns {Promise<Object>} Access token and user info
 */
export async function loginUser(db, email, password) {
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Generate token
  const token = generateToken(
    {
      sub: user.email,
      username: user.username,
    },
    '24h',
  );

  return {
    access_token: token,
    token_type: 'bearer',
    user: {
      username: user.username,
      email: user.email,
    },
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
