/**
 * User Model
 * Represents a user in the system with basic authentication
 */

/**
 * @typedef {Object} User
 * @property {string} username - User's username (unique)
 * @property {string} email - User's email address (unique)
 * @property {string} password_hash - Hashed password
 * @property {Date} created_at - Account creation timestamp
 */

/**
 * @typedef {Object} UserResponse
 * @property {string} username
 * @property {string} email
 * @property {Date} created_at
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
 * @returns {User} New user document
 */
export function createUserDocument(username, email, passwordHash) {
  return {
    username,
    email,
    password_hash: passwordHash,
    created_at: new Date(),
  };
}
