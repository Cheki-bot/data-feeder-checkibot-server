import { body, param } from 'express-validator';

/**
 * Validation rules for creating news
 */
export const createNewsValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),

  body('content').optional().isString().withMessage('Content must be a string'),

  body('category').optional().isString().withMessage('Category must be a string'),

  body('tags').optional().isArray().withMessage('Tags must be an array'),

  body('tags.*').optional().isString().withMessage('Each tag must be a string'),

  body('political_tendency')
    .optional()
    .isString()
    .withMessage('Political tendency must be a string'),

  body('featured_image').optional().isString().withMessage('Featured image must be a string'),

  body('sources').optional().isArray().withMessage('Sources must be an array'),

  body('sources.*').optional().isString().withMessage('Each source must be a string'),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
];

/**
 * Validation rules for updating news
 */
export const updateNewsValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),

  body('content').optional().isString().withMessage('Content must be a string'),

  body('category').optional().isString().withMessage('Category must be a string'),

  body('tags').optional().isArray().withMessage('Tags must be an array'),

  body('tags.*').optional().isString().withMessage('Each tag must be a string'),

  body('political_tendency')
    .optional()
    .isString()
    .withMessage('Political tendency must be a string'),

  body('featured_image').optional().isString().withMessage('Featured image must be a string'),

  body('sources').optional().isArray().withMessage('Sources must be an array'),

  body('sources.*').optional().isString().withMessage('Each source must be a string'),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
];

/**
 * Validation rules for news ID parameter
 */
export const newsIdParamValidation = [param('id').notEmpty().withMessage('News ID is required')];
