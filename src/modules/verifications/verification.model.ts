import { ObjectId } from 'mongodb';

/**
 * News Verification Model
 * Represents a news verification in the system
 */

export interface NewsTag {
  name: string;
  url: string;
}

export interface NewsVerificationDocument {
  _id?: ObjectId;
  title: string;
  classified_as: string;
  section_url: string;
  summary: string;
  body: string;
  url: string;
  publication_date: Date;
  tags: NewsTag[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface NewsVerificationResponse {
  _id: ObjectId;
  title: string;
  classified_as: string;
  section_url: string;
  summary: string;
  body: string;
  url: string;
  publication_date: Date;
  tags: NewsTag[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNewsVerificationData {
  title: string;
  classified_as: string;
  section_url: string;
  summary: string;
  body: string;
  url: string;
  publication_date: Date;
  tags: NewsTag[];
}

/**
 * Create a new news verification document
 */
export function createNewsVerificationDocument(
  verificationData: CreateNewsVerificationData,
  userEmail: string,
): Omit<NewsVerificationDocument, '_id'> {
  const now = new Date();

  return {
    title: verificationData.title,
    classified_as: verificationData.classified_as,
    section_url: verificationData.section_url,
    summary: verificationData.summary,
    body: verificationData.body,
    url: verificationData.url,
    publication_date: verificationData.publication_date,
    tags: verificationData.tags,
    created_by: userEmail,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Create news verification response (safe to send to client)
 */
export function createNewsVerificationResponse(
  verification: NewsVerificationDocument,
): NewsVerificationResponse {
  if (verification._id === undefined) {
    throw new Error('Cannot create response for news verification without _id');
  }

  return {
    _id: verification._id,
    title: verification.title,
    classified_as: verification.classified_as,
    section_url: verification.section_url,
    summary: verification.summary,
    body: verification.body,
    url: verification.url,
    publication_date: verification.publication_date,
    tags: verification.tags,
    created_by: verification.created_by,
    created_at: verification.created_at,
    updated_at: verification.updated_at,
  };
}
