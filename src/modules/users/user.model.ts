import { DEFAULT_ROLE, Role } from '../../constants/roles';
import { ObjectId } from 'mongodb';
import { UserDocument } from '../../types/authInterfaces';

/**
 * User Model
 * Represents a user in the system with basic authentication and role-based access
 */
export type User = UserDocument;

export interface UserResponse {
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  promoted_by?: ObjectId;
}

/**
 * Create a user response object (without sensitive data)
 */
export function createUserResponse(user: User): UserResponse {
  return {
    username: user.username,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
    promoted_by: user.promoted_by,
  };
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
