import { Request } from 'express';
import { Db } from 'mongodb';
import { Role } from '../constants/roles.js';
import { TokenPayload } from '../utils/auth.js';

/**
 * User document in MongoDB
 */
export interface UserDocument {
  username: string;
  email: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  failed_attempts?: number;
  lockout_until?: Date;
}

/**
 * Extended Request interface with user and currentUser properties
 */
export interface AuthRequest extends Request {
  user?: TokenPayload;
  currentUser?: Omit<UserDocument, 'password_hash'>;
}

/**
 * Helper to get typed db from request
 */
export function getDb(req: Request): Db {
  const db = (req.app.locals as { db?: Db }).db;
  if (!db) {
    throw new Error('Database not initialized in app.locals');
  }
  return db;
}

/**
 * Request body for registration
 */
export interface RegisterBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: Role;
}

/**
 * Request body for login
 */
export interface LoginBody {
  email: string;
  password: string;
}
