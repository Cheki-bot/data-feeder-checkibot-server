import { Db, ObjectId } from 'mongodb';
import {
  createNewsVerificationDocument,
  createNewsVerificationResponse,
  CreateNewsVerificationData,
  NewsVerificationDocument,
  NewsVerificationResponse,
} from './verification.model';

export interface NewsVerificationFilters {
  classified_as?: string;
  created_by?: string;
}

/**
 * Create a new news verification
 */
export async function createNewsVerification(
  db: Db,
  verificationData: CreateNewsVerificationData,
  userEmail: string,
): Promise<NewsVerificationResponse> {
  const verificationDoc = createNewsVerificationDocument(verificationData, userEmail);

  const result = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .insertOne(verificationDoc);
  const createdVerification = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .findOne({ _id: result.insertedId });

  if (createdVerification === null) {
    throw new Error('Failed to retrieve newly created news verification from database');
  }

  return createNewsVerificationResponse(createdVerification);
}

/**
 * Get all news verifications with optional filters
 */
export async function getAllNewsVerifications(
  db: Db,
  filters: NewsVerificationFilters = {},
): Promise<NewsVerificationResponse[]> {
  const query: Partial<NewsVerificationDocument> = {};

  if (filters.classified_as !== undefined) {
    query.classified_as = filters.classified_as;
  }

  if (filters.created_by !== undefined) {
    query.created_by = filters.created_by;
  }

  const verifications = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .find(query)
    .sort({ created_at: -1 })
    .toArray();

  return verifications.map(createNewsVerificationResponse);
}

/**
 * Get a single news verification by ID
 */
export async function getNewsVerificationById(
  db: Db,
  verificationId: string,
): Promise<NewsVerificationResponse | null> {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const verification = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .findOne({ _id: new ObjectId(verificationId) });

  if (verification === null) {
    return null;
  }

  return createNewsVerificationResponse(verification);
}

/**
 * Update a news verification
 */
export async function updateNewsVerification(
  db: Db,
  verificationId: string,
  updateData: Partial<CreateNewsVerificationData>,
): Promise<NewsVerificationResponse | null> {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const now = new Date();
  const updates: Partial<NewsVerificationDocument> = {
    ...(updateData as Partial<NewsVerificationDocument>),
    updated_at: now,
  };

  const result = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .findOneAndUpdate(
      { _id: new ObjectId(verificationId) },
      { $set: updates },
      { returnDocument: 'after' },
    );

  if (result === null) {
    return null;
  }

  return createNewsVerificationResponse(result);
}

/**
 * Delete a news verification
 */
export async function deleteNewsVerification(db: Db, verificationId: string): Promise<boolean> {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const result = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .deleteOne({ _id: new ObjectId(verificationId) });

  return result.deletedCount > 0;
}

/**
 * Create multiple news verifications
 */
export async function createMultipleNewsVerifications(
  db: Db,
  verificationsData: CreateNewsVerificationData[],
  userEmail: string,
): Promise<NewsVerificationResponse[]> {
  const verificationDocs = verificationsData.map(data =>
    createNewsVerificationDocument(data, userEmail),
  );

  const result = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .insertMany(verificationDocs);

  const insertedIds = Object.values(result.insertedIds);

  const createdVerifications = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .find({ _id: { $in: insertedIds } })
    .toArray();

  return createdVerifications.map(createNewsVerificationResponse);
}

/**
 * Delete multiple news verifications
 */
export async function deleteMultipleNewsVerifications(
  db: Db,
  verificationIds: string[],
): Promise<number> {
  const objectIds = verificationIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));

  const result = await db
    .collection<NewsVerificationDocument>('news_verifications')
    .deleteMany({ _id: { $in: objectIds } });

  return result.deletedCount ?? 0;
}
