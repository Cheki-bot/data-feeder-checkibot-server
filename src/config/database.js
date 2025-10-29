import { MongoClient } from 'mongodb';
import { env } from './index.js';
import { hashPassword } from '../utils/auth.js';
import { ROLES } from '../constants/roles.js';

let dbConnection = null;

/**
 * Initialize MongoDB connection and setup
 * - Creates connection to MongoDB
 * - Creates unique indexes on email and username fields
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function initializeDatabase() {
  try {
    const client = new MongoClient(env.MONGO_URI);
    await client.connect();

    const db = client.db(env.MONGO_DB_NAME);
    dbConnection = db;

    // Create unique indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await createDefaultAdmin(db);

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the current database connection
 * @returns {Db} MongoDB database instance
 */

export function getDatabase() {
  if (!dbConnection) {
    throw new Error('Database not initialized. Call initializeDatabase() first');
  }
  return dbConnection;
}

export async function closeDatabase() {
  if (dbConnection) {
    await dbConnection.client.close();
    dbConnection = null;
  }
}

/**
 * Create default admin user if it doesn't exist
 * @param {Db} db - MongoDB database instance
 */

async function createDefaultAdmin(db) {
  try {
    const adminEmail = env.ADMIN_EMAIL || 'admin@checkibot.com';
    const adminPassword = env.ADMIN_PASSWORD || 'Admin123!';
    const existingAdmin = await db.collection('users').findOne({ email: adminEmail });

    if (existingAdmin) return;

    const passwordHash = await hashPassword(adminPassword);
    const now = new Date();

    const adminUser = {
      username: 'admin',
      email: adminEmail,
      password_hash: passwordHash,
      role: ROLES.ADMIN,
      is_active: true,
      created_at: now,
      updated_at: now,
      failed_attempts: 0,
    };

    await db.collection('users').insertOne(adminUser);
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}
