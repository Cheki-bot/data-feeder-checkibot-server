import { ObjectId } from 'mongodb';
import { createVerificationDocument, createVerificationResponse } from './verification.model.js';

/**
 * Create a new verification
 * @param {Db} db - MongoDB database instance
 * @param {Object} verificationData - Verification data
 * @param {string} userEmail - Email of the user creating the verification
 * @returns {Promise<Object>} Created verification
 */
export async function createVerification(db, verificationData, userEmail) {
  const verificationDoc = createVerificationDocument(verificationData, userEmail);

  const result = await db.collection('verifications').insertOne(verificationDoc);
  const createdVerification = await db
    .collection('verifications')
    .findOne({ _id: result.insertedId });

  return createVerificationResponse(createdVerification);
}

/**
 * Get all verifications with optional filters
 * @param {Db} db - MongoDB database instance
 * @param {Object} filters - Filters (status, created_by, etc.)
 * @returns {Promise<Object[]>} Array of verifications
 */
export async function getAllVerifications(db, filters = {}) {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.created_by) {
    query.created_by = filters.created_by;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  const verifications = await db
    .collection('verifications')
    .find(query)
    .sort({ created_at: -1 })
    .toArray();

  return verifications.map(createVerificationResponse);
}

/**
 * Get a single verification by ID
 * @param {Db} db - MongoDB database instance
 * @param {string} verificationId - Verification ID
 * @returns {Promise<Object|null>} Verification or null
 */
export async function getVerificationById(db, verificationId) {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const verification = await db
    .collection('verifications')
    .findOne({ _id: new ObjectId(verificationId) });

  if (!verification) {
    return null;
  }

  return createVerificationResponse(verification);
}

/**
 * Update a verification
 * @param {Db} db - MongoDB database instance
 * @param {string} verificationId - Verification ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated verification or null
 */
export async function updateVerification(db, verificationId, updateData) {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const now = new Date();
  const updates = {
    ...updateData,
    updated_at: now,
  };

  // If changing status to published and not already published, set published_at
  if (updateData.status === 'published') {
    const existingVerification = await db
      .collection('verifications')
      .findOne({ _id: new ObjectId(verificationId) });
    if (existingVerification && !existingVerification.published_at) {
      updates.published_at = now;
    }
  }

  const result = await db
    .collection('verifications')
    .findOneAndUpdate(
      { _id: new ObjectId(verificationId) },
      { $set: updates },
      { returnDocument: 'after' },
    );

  if (!result) {
    return null;
  }

  return createVerificationResponse(result);
}

/**
 * Delete a verification
 * @param {Db} db - MongoDB database instance
 * @param {string} verificationId - Verification ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteVerification(db, verificationId) {
  if (!ObjectId.isValid(verificationId)) {
    throw new Error('INVALID_VERIFICATION_ID');
  }

  const result = await db
    .collection('verifications')
    .deleteOne({ _id: new ObjectId(verificationId) });

  return result.deletedCount > 0;
}
