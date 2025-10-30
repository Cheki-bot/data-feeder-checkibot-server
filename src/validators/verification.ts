import { body, param, ValidationChain } from 'express-validator';

/**
 * Validation rules for creating news verification
 */
export const createVerificationValidation: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Title must be between 10 and 500 characters'),

  body('classified_as')
    .trim()
    .notEmpty()
    .withMessage('Classification is required')
    .isString()
    .withMessage('Classification must be a string'),

  body('section_url')
    .trim()
    .notEmpty()
    .withMessage('Section URL is required')
    .isURL()
    .withMessage('Section URL must be a valid URL'),

  body('summary')
    .trim()
    .notEmpty()
    .withMessage('Summary is required')
    .isString()
    .withMessage('Summary must be a string'),

  body('body')
    .trim()
    .notEmpty()
    .withMessage('Body is required')
    .isString()
    .withMessage('Body must be a string'),

  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL()
    .withMessage('URL must be a valid URL'),

  body('publication_date')
    .notEmpty()
    .withMessage('Publication date is required')
    .isISO8601()
    .withMessage('Publication date must be a valid date'),

  body('tags').isArray().withMessage('Tags must be an array'),

  body('tags.*.name').isString().withMessage('Tag name must be a string'),

  body('tags.*.url').isURL().withMessage('Tag URL must be a valid URL'),
];

/**
 * Validation rules for updating news verification
 */
export const updateVerificationValidation: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Title must be between 10 and 500 characters'),

  body('classified_as').optional().trim().isString().withMessage('Classification must be a string'),

  body('section_url').optional().trim().isURL().withMessage('Section URL must be a valid URL'),

  body('summary').optional().trim().isString().withMessage('Summary must be a string'),

  body('body').optional().trim().isString().withMessage('Body must be a string'),

  body('url').optional().trim().isURL().withMessage('URL must be a valid URL'),

  body('publication_date')
    .optional()
    .isISO8601()
    .withMessage('Publication date must be a valid date'),

  body('tags').optional().isArray().withMessage('Tags must be an array'),

  body('tags.*.name').optional().isString().withMessage('Tag name must be a string'),

  body('tags.*.url').optional().isURL().withMessage('Tag URL must be a valid URL'),
];

/**
 * Validation rules for verification ID parameter
 */
export const verificationIdParamValidation: ValidationChain[] = [
  param('id').notEmpty().withMessage('Verification ID is required'),
];
