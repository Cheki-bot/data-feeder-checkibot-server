import { DEFAULT_ROLE, Role } from '../../constants/roles.js';

/**
 * User Model
 * Represents a user in the system with basic authentication and role-based access
 */

export interface User {
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

export interface UserResponse {
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a user response object (without sensitive data)
 */
export function createUserResponse(user: User): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, failed_attempts, lockout_until, ...userResponse } = user;
  return userResponse;
}

/**
 * Create a new user document
 */
export function createUserDocument(
  username: string,
  email: string,
  passwordHash: string,
  role: Role = DEFAULT_ROLE,
): User {
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
