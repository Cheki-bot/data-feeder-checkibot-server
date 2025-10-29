/**
 * News Model
 * Represents a news article in the system
 */

//ESTO ESTA CON IA PORQUE NO ESTOY SEGURO DE COMO ERA EL FORMATO DE ENTRADA DE LAS NOTICIAS XD

/**
 * @typedef {Object} News
 * @property {string} title - News title
 * @property {string} content - News content (HTML/text)
 * @property {string} category - Verification category (e.g., 'Verdadero', 'Falso', 'Engañoso')
 * @property {string[]} tags - Tags associated with the news (e.g., ['#YPFB', '#Asfi'])
 * @property {string} political_tendency - Political tendency (e.g., 'Indeterminada')
 * @property {string} featured_image - URL or path to featured image
 * @property {string[]} sources - Array of source URLs or references
 * @property {string} status - Publication status ('draft' | 'published')
 * @property {string} created_by - Email of the user who created the news
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 * @property {Date} published_at - Publication timestamp (null if draft)
 */

/**
 * @typedef {Object} NewsResponse
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
 * Create a new news document
 * @param {Object} newsData - News data
 * @param {string} userEmail - Email of the user creating the news
 * @returns {News} New news document
 */
export function createNewsDocument(newsData, userEmail) {
  const now = new Date();

  return {
    title: newsData.title,
    content: newsData.content || '',
    category: newsData.category || '',
    tags: newsData.tags || [],
    political_tendency: newsData.political_tendency || 'Indeterminada',
    featured_image: newsData.featured_image || '',
    sources: newsData.sources || [],
    status: newsData.status || 'draft',
    created_by: userEmail,
    created_at: now,
    updated_at: now,
    published_at: newsData.status === 'published' ? now : null,
  };
}

/**
 * Create news response (safe to send to client)
 * @param {News} news - News document from database
 * @returns {NewsResponse} News data for response
 */
export function createNewsResponse(news) {
  return {
    _id: news._id,
    title: news.title,
    content: news.content,
    category: news.category,
    tags: news.tags,
    political_tendency: news.political_tendency,
    featured_image: news.featured_image,
    sources: news.sources,
    status: news.status,
    created_by: news.created_by,
    created_at: news.created_at,
    updated_at: news.updated_at,
    published_at: news.published_at,
  };
}
