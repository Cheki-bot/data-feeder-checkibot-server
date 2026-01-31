import { Db, ObjectId } from 'mongodb';
import { DEFAULT_ROLE, Role } from '../../constants/roles';
import { UserDocument } from '../../types/authInterfaces';
import { generateToken, hashPassword, verifyPassword } from '../../utils/auth';
import { createUserDocument, createUserResponse, UserResponse } from './user.model';

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

  userDoc.failed_attempts = 0;

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
export async function getUserByEmail(
  db: Db,
  email: string,
): Promise<Omit<UserDocument, 'password_hash'> | null> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.collection<UserDocument>('users').findOne(
    { email: normalizedEmail },
    {
      projection: {
        password_hash: 0,
      },
    },
  );

  return user;
}

/**
 * Change user role
 */
export async function changeUserRole(
  db: Db,
  userId: string,
  newRole: Role,
  currentAdminEmail: string,
): Promise<UserResponse> {
  const normalizedAdminEmail = currentAdminEmail.toLowerCase().trim();

  // Validate ObjectId format
  if (!ObjectId.isValid(userId)) {
    throw new Error('INVALID_USER_ID');
  }

  // Get the user to change
  const user = await db.collection<UserDocument>('users').findOne(
    { _id: new ObjectId(userId) },
    {
      projection: {
        password_hash: 0,
      },
    },
  );

  if (user === null) {
    throw new Error('USER_NOT_FOUND');
  }

  // Prevent changing own role
  if (user.email.toLowerCase().trim() === normalizedAdminEmail) {
    throw new Error('CANNOT_CHANGE_OWN_ROLE');
  }

  // Update user role
  const updatedUser = await db.collection<UserDocument>('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        role: newRole,
        updated_at: new Date(),
      },
    },
  );

  if (updatedUser.matchedCount === 0) {
    throw new Error('USER_UPDATE_FAILED');
  }

  // Return updated user without password
  return createUserResponse(user);
}
