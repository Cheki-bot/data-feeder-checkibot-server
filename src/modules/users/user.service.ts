import { Db, ObjectId } from 'mongodb';
import { DEFAULT_ROLE, Role } from '../../constants/roles';
import { UserDocument } from '../../types/authInterfaces';
import { generateToken, hashPassword, verifyPassword } from '../../utils/auth';
import { createUserResponse } from './user.model';

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
): Promise<UserDocument> {
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

  return userDoc;
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
 * Get user by ID
 */
export async function getUserById(
  db: Db,
  id: string,
): Promise<Omit<UserDocument, 'password_hash'> | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_USER_ID');
  }
  const user = await db.collection<UserDocument>('users').findOne(
    { _id: new ObjectId(id) },
    {
      projection: {
        password_hash: 0,
      },
    },
  );

  return user;
}

/**
 * Get all users
 */
export async function getAllUsers(db: Db): Promise<Omit<UserDocument, 'password_hash'>[]> {
  const users = await db
    .collection<UserDocument>('users')
    .find({}, { projection: { password_hash: 0, failed_attempts: 0, lockout_until: 0 } })
    .toArray();

  return users;
}

/**
 * Update user
 */
export async function updateUser(
  db: Db,
  id: string,
  updateData: Partial<UserDocument>,
): Promise<Omit<UserDocument, 'password_hash'> | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_USER_ID');
  }
  const updatedUser = await db
    .collection<UserDocument>('users')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password_hash: 0 } },
    );

  return updatedUser ? createUserResponse(updatedUser) : null;
}

/**
 * Delete user
 */
export async function deleteUser(db: Db, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_USER_ID');
  }
  const result = await db.collection<UserDocument>('users').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/**
 * Deactivate user
 */
export async function deactivateUser(db: Db, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_USER_ID');
  }
  const result = await db.collection<UserDocument>('users').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        is_active: false,
        updated_at: new Date(),
      },
    },
  );

  return result.modifiedCount > 0;
}

/**
 * Activate user
 */
export async function activateUser(db: Db, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_USER_ID');
  }
  const result = await db.collection<UserDocument>('users').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        is_active: true,
        updated_at: new Date(),
      },
    },
  );

  return result.modifiedCount > 0;
}

/**
 * Create a new user document
 */
export function createUserDocument(
  username: string,
  email: string,
  passwordHash: string,
  role: Role = DEFAULT_ROLE,
): UserDocument {
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
