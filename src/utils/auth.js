import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/index';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt with automatic salt generation
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain password against a hashed password
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a JWT token with payload using HS256 algorithm
 * @param {Object} payload - Data to encode in token (e.g., { sub: email, role: 'User' })
 * @param {string} expiresIn - Token expiration time (default: '24h')
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = '24h') {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Decode and validate a JWT token using HS256 algorithm
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export function decodeToken(token) {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
  });
}
