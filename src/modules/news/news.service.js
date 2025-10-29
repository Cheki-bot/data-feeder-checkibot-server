import { ObjectId } from 'mongodb';
import { createNewsDocument, createNewsResponse } from './news.model.js';

//LO MISMO QUE EL MODEL, TODO ESTO ESTA SUJETO A CAMBIOS xdxdd

/**
 * Create a new news article
 * @param {Db} db - MongoDB database instance
 * @param {Object} newsData - News data
 * @param {string} userEmail - Email of the user creating the news
 * @returns {Promise<Object>} Created news
 */
export async function createNews(db, newsData, userEmail) {
  const newsDoc = createNewsDocument(newsData, userEmail);

  const result = await db.collection('news').insertOne(newsDoc);
  const createdNews = await db.collection('news').findOne({ _id: result.insertedId });

  return createNewsResponse(createdNews);
}

/**
 * Get all news articles with optional filters
 * @param {Db} db - MongoDB database instance
 * @param {Object} filters - Filters (status, created_by, etc.)
 * @returns {Promise<Object[]>} Array of news articles
 */
export async function getAllNews(db, filters = {}) {
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

  const news = await db.collection('news').find(query).sort({ created_at: -1 }).toArray();

  return news.map(createNewsResponse);
}

/**
 * Get a single news article by ID
 * @param {Db} db - MongoDB database instance
 * @param {string} newsId - News ID
 * @returns {Promise<Object|null>} News article or null
 */
export async function getNewsById(db, newsId) {
  if (!ObjectId.isValid(newsId)) {
    throw new Error('INVALID_NEWS_ID');
  }

  const news = await db.collection('news').findOne({ _id: new ObjectId(newsId) });

  if (!news) {
    return null;
  }

  return createNewsResponse(news);
}

/**
 * Update a news article
 * @param {Db} db - MongoDB database instance
 * @param {string} newsId - News ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated news or null
 */
export async function updateNews(db, newsId, updateData) {
  if (!ObjectId.isValid(newsId)) {
    throw new Error('INVALID_NEWS_ID');
  }

  const now = new Date();
  const updates = {
    ...updateData,
    updated_at: now,
  };

  // If changing status to published and not already published, set published_at
  if (updateData.status === 'published') {
    const existingNews = await db.collection('news').findOne({ _id: new ObjectId(newsId) });
    if (existingNews && !existingNews.published_at) {
      updates.published_at = now;
    }
  }

  const result = await db
    .collection('news')
    .findOneAndUpdate(
      { _id: new ObjectId(newsId) },
      { $set: updates },
      { returnDocument: 'after' },
    );

  if (!result) {
    return null;
  }

  return createNewsResponse(result);
}

/**
 * Delete a news article
 * @param {Db} db - MongoDB database instance
 * @param {string} newsId - News ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteNews(db, newsId) {
  if (!ObjectId.isValid(newsId)) {
    throw new Error('INVALID_NEWS_ID');
  }

  const result = await db.collection('news').deleteOne({ _id: new ObjectId(newsId) });

  return result.deletedCount > 0;
}
