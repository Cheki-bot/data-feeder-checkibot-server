import { ObjectId } from 'mongodb';

/**
 * Verification Model
 * Represents a verification article in the system
 */

export type VerificationStatus = 'draft' | 'published';

export interface VerificationDocument {
  _id?: ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  political_tendency: string;
  featured_image: string;
  sources: string[];
  status: VerificationStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export interface VerificationResponse {
  _id: string | ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  political_tendency: string;
  featured_image: string;
  sources: string[];
  status: VerificationStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export interface CreateVerificationData {
  title: string;
  content?: string;
  category?: string;
  tags?: string[];
  political_tendency?: string;
  featured_image?: string;
  sources?: string[];
  status?: VerificationStatus;
}

/**
 * Create a new verification document
 */
export function createVerificationDocument(
  verificationData: CreateVerificationData,
  userEmail: string,
): Omit<VerificationDocument, '_id'> {
  const now = new Date();

  return {
    title: verificationData.title,
    content: verificationData.content ?? '',
    category: verificationData.category ?? '',
    tags: verificationData.tags ?? [],
    political_tendency: verificationData.political_tendency ?? 'Indeterminada',
    featured_image: verificationData.featured_image ?? '',
    sources: verificationData.sources ?? [],
    status: verificationData.status ?? 'draft',
    created_by: userEmail,
    created_at: now,
    updated_at: now,
    published_at: verificationData.status === 'published' ? now : null,
  };
}

/**
 * Create verification response (safe to send to client)
 */
export function createVerificationResponse(
  verification: VerificationDocument,
): VerificationResponse {
  return {
    _id: verification._id ?? '',
    title: verification.title,
    content: verification.content,
    category: verification.category,
    tags: verification.tags,
    political_tendency: verification.political_tendency,
    featured_image: verification.featured_image,
    sources: verification.sources,
    status: verification.status,
    created_by: verification.created_by,
    created_at: verification.created_at,
    updated_at: verification.updated_at,
    published_at: verification.published_at,
  };
}
