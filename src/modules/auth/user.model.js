import { DEFAULT_ROLE } from '../../constants/roles.js';

/**
 * User Model
 * Represents a user in the system with basic authentication and role-based access
 */

/**
 * @typedef {Object} User
 * @property {string} username - User's username (unique)
 * @property {string} email - User's email address (unique)
 * @property {string} password_hash - Hashed password
 * @property {string} role - User role ('admin' | 'user')
 * @property {boolean} is_active - Account active status
 * @property {Date} created_at - Account creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} UserResponse
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {boolean} is_active
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * Create a user response object (without sensitive data)
 * @param {User} user - User document from database
 * @returns {UserResponse} User data without password_hash
 */
export function createUserResponse(user) {
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...userResponse } = user;
  return userResponse;
}

/**
 * Create a new user document
 * @param {string} username - User username
 * @param {string} email - User email
 * @param {string} passwordHash - Hashed password
 * @param {string} role - User role (default: 'user')
 * @returns {User} New user document
 */
export function createUserDocument(username, email, passwordHash, role = DEFAULT_ROLE) {
  const now = new Date();
  return {
    username,
    email,
    password_hash: passwordHash,
    role,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
}
