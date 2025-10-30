import { Db } from 'mongodb';
import { hashPassword, verifyPassword, generateToken } from '../../utils/auth.js';
import { createUserDocument, createUserResponse, User, UserResponse } from './user.model.js';
import { DEFAULT_ROLE, Role } from '../../constants/roles.js';
import { UserDocument } from '../../types/authInterfaces.js';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    username: string;
    email: string;
    role: Role;
  };
}

/**
 * Register a new user
 */
export async function registerUser(
  db: Db,
  username: string,
  email: string,
  password: string,
  role: Role = DEFAULT_ROLE,
): Promise<UserResponse> {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUsername = await db.collection<UserDocument>('users').findOne({ username });
  if (existingUsername !== null) {
    throw new Error('USERNAME_ALREADY_EXISTS');
  }

  const existingEmail = await db
    .collection<UserDocument>('users')
    .findOne({ email: normalizedEmail });
  if (existingEmail !== null) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const userDoc = createUserDocument(username, normalizedEmail, passwordHash, role);

  (userDoc as User & { failed_attempts: number }).failed_attempts = 0;

  await db.collection<UserDocument>('users').insertOne(userDoc);

  return createUserResponse(userDoc);
}

/**
 * Authenticate user and generate token
 */
export async function loginUser(db: Db, email: string, password: string): Promise<LoginResponse> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.collection<UserDocument>('users').findOne({ email: normalizedEmail });

  if (user === null) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Check if user account is active
  if (user.is_active === false) {
    throw new Error('ACCOUNT_DEACTIVATED');
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (isValidPassword === false) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = generateToken(
    {
      sub: user.email,
      username: user.username,
      role: user.role,
    },
    '24h',
  );

  return {
    access_token: token,
    token_type: 'bearer',
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(db: Db, email: string): Promise<User | null> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.collection<UserDocument>('users').findOne(
    { email: normalizedEmail },
    {
      projection: {
        password_hash: 0,
      },
    },
  );

  return user as User | null;
}
