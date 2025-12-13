import { Db, ObjectId } from 'mongodb';
import { UpdateUserBody, UserDocument } from '../../types/authInterfaces';
import { hashPassword } from '../../utils/auth';
import { createUserResponse } from './user.model';

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
  updateData: UpdateUserBody,
): Promise<Omit<UserDocument, 'password_hash'> | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_USER_ID');
  }
  const newData = {} as UserDocument;

  if (updateData.email !== null) {
    newData.email = updateData.email;
  }

  if (updateData.username !== null) {
    newData.username = updateData.username;
  }

  if (updateData.is_active !== null) {
    newData.is_active = updateData.is_active;
  }

  if (updateData.password !== null) {
    const passwordHash = await hashPassword(updateData.password);
    newData.password_hash = passwordHash;
  }

  const updatedUser = await db
    .collection<UserDocument>('users')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: newData },
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
