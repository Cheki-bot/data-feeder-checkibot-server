import { MongoClient } from 'mongodb';
import { env } from './index.js';
import { hashPassword } from '../utils/auth.js';

let dbConnection = null;

/**
 * Initialize MongoDB connection and setup
 * - Creates connection to MongoDB
 * - Creates unique index on email field
 * - Creates initial admin user if it doesn't exist
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');

    const client = new MongoClient(env.MONGO_URI);
    await client.connect();

    const db = client.db(env.MONGO_DB_NAME);
    dbConnection = db;

    console.log(
      `✓ Connected to MongoDB database: ${env.MONGO_DB_NAME}`
    );

    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✓ Created unique index on users.email');

    await createInitialAdmin(db);

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Create initial admin user if not exists
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from environment variables
 * @param {Db} db - MongoDB database instance
 */
async function createInitialAdmin(db) {
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      '⚠ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables'
    );
    console.warn('⚠ Skipping admin user creation');
    return;
  }

  try {
    const existingAdmin = await db
      .collection('users')
      .findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminUser = {
        email: adminEmail,
        password_hash: await hashPassword(adminPassword),
        role: 'Admin',
        is_active: true,
        created_at: new Date(),
        failed_attempts: 0,
      };

      await db.collection('users').insertOne(adminUser);
      console.log(`✓ Admin user created: ${adminEmail}`);
    } else {
      console.log(`✓ Admin user already exists`);
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log(`✓ Admin user already exists`);
    } else {
      throw error;
    }
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
    console.log('✓ Database connection closed');
  }
}
