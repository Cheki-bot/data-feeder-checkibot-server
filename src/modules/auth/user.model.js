/**
 * User Model
 * Represents a user in the system with authentication and authorization data
 */

/**
 * @typedef {Object} User
 * @property {string} email - User's email address (unique)
 * @property {string} password_hash - Hashed password
 * @property {string} role - User role ('User' or 'Admin')
 * @property {boolean} is_active - Account status
 * @property {Date} created_at - Account creation timestamp
 * @property {number} failed_attempts - Number of failed login attempts
 * @property {Date} [lockout_until] - Account lockout timestamp
 */

/**
 * @typedef {Object} UserResponse
 * @property {string} email
 * @property {string} role
 * @property {boolean} is_active
 * @property {Date} created_at
 * @property {number} failed_attempts
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
 * @param {string} email - User email
 * @param {string} passwordHash - Hashed password
 * @param {string} role - User role (default: 'User')
 * @returns {User} New user document
 */
export function createUserDocument(email, passwordHash, role = 'User') {
  return {
    email,
    password_hash: passwordHash,
    role,
    is_active: true,
    created_at: new Date(),
    failed_attempts: 0,
  };
}

export const UserRoles = {
  USER: 'User',
  ADMIN: 'Admin',
};
