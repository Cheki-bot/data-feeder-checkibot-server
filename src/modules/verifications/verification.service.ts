import { Db, ObjectId } from 'mongodb';
import {
  createVerificationDocument,
  createVerificationResponse,
  CreateVerificationData,
  VerificationDocument,
  VerificationResponse,
  VerificationStatus,
} from './verification.model';

export interface VerificationFilters {
  status?: VerificationStatus;
  created_by?: string;
  category?: string;
}

/**
 * Create a new verification
 */
export async function createVerification(
  db: Db,
  verificationData: CreateVerificationData,
  userEmail: string,
): Promise<VerificationResponse> {
  const verificationDoc = createVerificationDocument(verificationData, userEmail);

  const result = await db
    .collection<VerificationDocument>('verifications')
    .insertOne(verificationDoc);
  const createdVerification = await db
    .collection<VerificationDocument>('verifications')
    .findOne({ _id: result.insertedId });

  if (createdVerification === null) {
    throw new Error('Failed to create verification');
  }

  return createVerificationResponse(createdVerification);
}

/**
 * Get all verifications with optional filters
 */
export async function getAllVerifications(
  db: Db,
  filters: VerificationFilters = {},
): Promise<VerificationResponse[]> {
  const query: Partial<VerificationDocument> = {};

  if (filters.status !== undefined) {
    query.status = filters.status;
  }

  if (filters.created_by !== undefined) {
    query.created_by = filters.created_by;
  }

  if (filters.category !== undefined) {
    query.category = filters.category;
  }

  const verifications = await db
    .collection<VerificationDocument>('verifications')
    .find(query)
    .sort({ created_at: -1 })
    .toArray();

  return verifications.map(createVerificationResponse);
}

/**
 * Get a single verification by ID
 */
export async function getVerificationById(
  db: Db,
  verificationId: string,
): Promise<VerificationResponse | null> {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const verification = await db
    .collection<VerificationDocument>('verifications')
    .findOne({ _id: new ObjectId(verificationId) });

  if (verification === null) {
    return null;
  }

  return createVerificationResponse(verification);
}

/**
 * Update a verification
 */
export async function updateVerification(
  db: Db,
  verificationId: string,
  updateData: Partial<CreateVerificationData>,
): Promise<VerificationResponse | null> {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const now = new Date();
  const updates: Partial<VerificationDocument> = {
    ...(updateData as Partial<VerificationDocument>),
    updated_at: now,
  };

  // If changing status to published and not already published, set published_at
  if (updateData.status === 'published') {
    const existingVerification = await db
      .collection<VerificationDocument>('verifications')
      .findOne({ _id: new ObjectId(verificationId) });
    if (existingVerification !== null && existingVerification.published_at === null) {
      updates.published_at = now;
    }
  }

  const result = await db
    .collection<VerificationDocument>('verifications')
    .findOneAndUpdate(
      { _id: new ObjectId(verificationId) },
      { $set: updates },
      { returnDocument: 'after' },
    );

  if (result === null) {
    return null;
  }

  return createVerificationResponse(result);
}

/**
 * Delete a verification
 */
export async function deleteVerification(db: Db, verificationId: string): Promise<boolean> {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const result = await db
    .collection<VerificationDocument>('verifications')
    .deleteOne({ _id: new ObjectId(verificationId) });

  return result.deletedCount > 0;
}
