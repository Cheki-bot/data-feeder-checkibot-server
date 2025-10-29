/**
 * Verification Model
 * Represents a verification article in the system
 */

/**
 * @typedef {Object} Verification
 * @property {string} title - Verification title
 * @property {string} content - Verification content (HTML/text)
 * @property {string} category - Verification category (e.g., 'Verdadero', 'Falso', 'Engañoso')
 * @property {string[]} tags - Tags associated with the verification (e.g., ['#YPFB', '#Asfi'])
 * @property {string} political_tendency - Political tendency (e.g., 'Indeterminada')
 * @property {string} featured_image - URL or path to featured image
 * @property {string[]} sources - Array of source URLs or references
 * @property {string} status - Publication status ('draft' | 'published')
 * @property {string} created_by - Email of the user who created the verification
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 * @property {Date} published_at - Publication timestamp (null if draft)
 */

/**
 * @typedef {Object} VerificationResponse
 * @property {string} _id
 * @property {string} title
 * @property {string} content
 * @property {string} category
 * @property {string[]} tags
 * @property {string} political_tendency
 * @property {string} featured_image
 * @property {string[]} sources
 * @property {string} status
 * @property {string} created_by
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date} published_at
 */

/**
 * Create a new verification document
 * @param {Object} verificationData - Verification data
 * @param {string} userEmail - Email of the user creating the verification
 * @returns {Verification} New verification document
 */
export function createVerificationDocument(verificationData, userEmail) {
  const now = new Date();

  return {
    title: verificationData.title,
    content: verificationData.content || '',
    category: verificationData.category || '',
    tags: verificationData.tags || [],
    political_tendency: verificationData.political_tendency || 'Indeterminada',
    featured_image: verificationData.featured_image || '',
    sources: verificationData.sources || [],
    status: verificationData.status || 'draft',
    created_by: userEmail,
    created_at: now,
    updated_at: now,
    published_at: verificationData.status === 'published' ? now : null,
  };
}

/**
 * Create verification response (safe to send to client)
 * @param {Verification} verification - Verification document from database
 * @returns {VerificationResponse} Verification data for response
 */
export function createVerificationResponse(verification) {
  return {
    _id: verification._id,
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
