import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/index';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt with automatic salt generation
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain password against a hashed password
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * JWT token payload interface
 */
export interface TokenPayload {
  sub: string;
  username?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Generate a JWT token with payload using HS256 algorithm
 */
export function generateToken(payload: TokenPayload, expiresIn = '24h'): string {
  if (typeof env.JWT_SECRET !== 'string' || env.JWT_SECRET.length === 0) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}

/**
 * Decode and validate a JWT token using HS256 algorithm
 */
export function decodeToken(token: string): TokenPayload {
  if (typeof env.JWT_SECRET !== 'string' || env.JWT_SECRET.length === 0) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
  }) as TokenPayload;
}
