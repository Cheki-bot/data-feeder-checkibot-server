import { MongoClient, Db } from 'mongodb';
import { env } from './index';
import { hashPassword } from '../utils/auth';
import { ROLES } from '../constants/roles';
import { UserDocument } from '../types/authInterfaces';

let dbConnection: Db | null = null;

/**
 * Initialize MongoDB connection and setup
 * - Creates connection to MongoDB
 * - Creates unique indexes on email and username fields
 */
export async function initializeDatabase(): Promise<Db> {
  try {
    if (typeof env.MONGO_URI !== 'string' || env.MONGO_URI.length === 0) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    if (typeof env.MONGO_DB_NAME !== 'string' || env.MONGO_DB_NAME.length === 0) {
      throw new Error('MONGO_DB_NAME is not defined in environment variables');
    }

    const client = new MongoClient(env.MONGO_URI);
    await client.connect();

    const db = client.db(env.MONGO_DB_NAME);
    dbConnection = db;

    // Create unique indexes
    await db.collection<UserDocument>('users').createIndex({ email: 1 }, { unique: true });
    await db.collection<UserDocument>('users').createIndex({ username: 1 }, { unique: true });
    await createDefaultAdmin(db);

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the current database connection
 */
export function getDatabase(): Db {
  if (dbConnection === null) {
    throw new Error('Database not initialized. Call initializeDatabase() first');
  }
  return dbConnection;
}

export async function closeDatabase(): Promise<void> {
  if (dbConnection !== null) {
    await dbConnection.client.close();
    dbConnection = null;
  }
}

/**
 * Create default admin user if it doesn't exist
 */
async function createDefaultAdmin(db: Db): Promise<void> {
  try {
    const adminEmail = env.ADMIN_EMAIL ?? 'admin@checkibot.com';
    const adminPassword = env.ADMIN_PASSWORD ?? 'Admin123!';
    const existingAdmin = await db.collection<UserDocument>('users').findOne({
      $or: [{ email: adminEmail }, { username: 'admin' }],
    });

    if (existingAdmin !== null) return;

    const passwordHash = await hashPassword(adminPassword);
    const now = new Date();

    const adminUser: Omit<UserDocument, '_id'> = {
      username: 'admin',
      email: adminEmail,
      password_hash: passwordHash,
      role: ROLES.ADMIN,
      is_active: true,
      created_at: now,
      updated_at: now,
      failed_attempts: 0,
    };

    await db.collection<UserDocument>('users').insertOne(adminUser);
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}
