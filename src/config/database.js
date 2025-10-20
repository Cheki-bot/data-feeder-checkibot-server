import { MongoClient } from 'mongodb';
import { env } from './index.js';

let dbConnection = null;

/**
 * Initialize MongoDB connection and setup
 * - Creates connection to MongoDB
 * - Creates unique indexes on email and username fields
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');

    const client = new MongoClient(env.MONGO_URI);
    await client.connect();

    const db = client.db(env.MONGO_DB_NAME);
    dbConnection = db;

    console.log(`✓ Connected to MongoDB database: ${env.MONGO_DB_NAME}`);

    // Create unique indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    console.log('✓ Created unique indexes on users collection');

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
    console.log('✓ Database connection closed');
  }
}
