import { validationResult } from 'express-validator';
import * as NewsService from './news.service.js';
import { ROLES } from '../../constants/roles.js';

/**
 * POST /api/news
 * Create a new news article (User and Admin)
 */
export async function createNews(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = req.app.locals.db;
    const newsData = req.body;
    const userEmail = req.currentUser.email;

    const news = await NewsService.createNews(db, newsData, userEmail);

    res.status(201).json({
      message: 'News created successfully',
      news,
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * GET /api/news
 * Get all news articles
 * - Users can only see their own news
 * - Admins can see all news
 */
export async function getAllNews(req, res) {
  try {
    const db = req.app.locals.db;
    const { status, category } = req.query;

    const filters = {};

    // Users can only see their own news, admins see all
    if (req.currentUser.role !== ROLES.ADMIN) {
      filters.created_by = req.currentUser.email;
    }

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters.category = category;
    }

    const news = await NewsService.getAllNews(db, filters);

    res.json({
      news,
      count: news.length,
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * GET /api/news/:id
 * Get a single news article by ID
 * - Users can only access their own news
 * - Admins can access any news
 */
export async function getNewsById(req, res) {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const news = await NewsService.getNewsById(db, id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Check permissions: users can only access their own news
    if (req.currentUser.role !== ROLES.ADMIN && news.created_by !== req.currentUser.email) {
      return res.status(403).json({ message: 'You can only access your own news' });
    }

    res.json(news);
  } catch (error) {
    console.error('Get news by ID error:', error);

    if (error.message === 'INVALID_NEWS_ID') {
      return res.status(400).json({ message: 'Invalid news ID format' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * PATCH /api/news/:id
 * Update a news article
 * - Users can only update their own news
 * - Admins can update any news
 */
export async function updateNews(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if news exists
    const existingNews = await NewsService.getNewsById(db, id);

    if (!existingNews) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Check permissions: users can only update their own news
    if (req.currentUser.role !== ROLES.ADMIN && existingNews.created_by !== req.currentUser.email) {
      return res.status(403).json({ message: 'You can only update your own news' });
    }

    const updateData = req.body;
    const updatedNews = await NewsService.updateNews(db, id, updateData);

    res.json({
      message: 'News updated successfully',
      news: updatedNews,
    });
  } catch (error) {
    console.error('Update news error:', error);

    if (error.message === 'INVALID_NEWS_ID') {
      return res.status(400).json({ message: 'Invalid news ID format' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * DELETE /api/news/:id
 * Delete a news article (Admin only)
 */
export async function deleteNews(req, res) {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if news exists
    const existingNews = await NewsService.getNewsById(db, id);

    if (!existingNews) {
      return res.status(404).json({ message: 'News not found' });
    }

    const deleted = await NewsService.deleteNews(db, id);

    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete news' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);

    if (error.message === 'INVALID_NEWS_ID') {
      return res.status(400).json({ message: 'Invalid news ID format' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
