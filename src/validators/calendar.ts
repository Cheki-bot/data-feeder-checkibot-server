import { body, param, ValidationChain } from 'express-validator';

export const createCalendarValidation: ValidationChain[] = [
  body('pdf_url')
    .trim()
    .notEmpty()
    .withMessage('PDF URL is required')
    .isURL()
    .withMessage('PDF URL must be a valid URL'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('resolution')
    .trim()
    .notEmpty()
    .withMessage('Resolution is required')
    .isString()
    .withMessage('Resolution must be a string'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),

  body('introduction').optional().trim().isString().withMessage('Introduction must be a string'),

  body('signatures')
    .isArray()
    .withMessage('Signatures must be an array')
    .notEmpty()
    .withMessage('Signatures array must not be empty'),
  body('signatures.*.full_name')
    .notEmpty()
    .withMessage('Signature full name is required')
    .isString()
    .withMessage('Signature full name must be a string'),
  body('signatures.*.position')
    .notEmpty()
    .withMessage('Signature position is required')
    .isString()
    .withMessage('Signature position must be a string'),

  body('events').isArray().withMessage('Events must be an array'),
  body('events.*.scenery').optional().isString().withMessage('Event scenery must be a string'),
  body('events.*.no').optional().isInt().withMessage('Event number must be an integer'),
  body('events.*.activity').optional().isString().withMessage('Event activity must be a string'),
  body('events.*.days').optional().isInt().withMessage('Event days must be an integer'),
  body('events.*.from_date')
    .optional()
    .isISO8601()
    .withMessage('Event from_date must be a valid date'),
  body('events.*.to_date').optional().isISO8601().withMessage('Event to_date must be a valid date'),
  body('events.*.duration').optional().isInt().withMessage('Event duration must be an integer'),
  body('events.*.reference').optional().isString().withMessage('Event reference must be a string'),
  body('events.*.place').optional().isString().withMessage('Event place must be a string'),
  body('events.*.calendar_id')
    .optional()
    .isString()
    .withMessage('Event calendar_id must be a string'),

  body('election_id')
    .trim()
    .notEmpty()
    .withMessage('Election ID is required')
    .isString()
    .withMessage('Election ID must be a string'),
];

export const updateCalendarValidation: ValidationChain[] = [
  body('pdf_url').optional().trim().isURL().withMessage('PDF URL must be a valid URL'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('resolution').optional().trim().isString().withMessage('Resolution must be a string'),

  body('date').optional().isISO8601().withMessage('Date must be a valid date'),

  body('introduction').optional().trim().isString().withMessage('Introduction must be a string'),

  body('signatures').optional().isArray().withMessage('Signatures must be an array'),
  body('signatures.*.full_name')
    .optional()
    .isString()
    .withMessage('Signature full name must be a string'),
  body('signatures.*.position')
    .optional()
    .isString()
    .withMessage('Signature position must be a string'),

  body('events').optional().isArray().withMessage('Events must be an array'),
  body('events.*.scenery').optional().isString().withMessage('Event scenery must be a string'),
  body('events.*.no').optional().isInt().withMessage('Event number must be an integer'),
  body('events.*.activity').optional().isString().withMessage('Event activity must be a string'),
  body('events.*.days').optional().isInt().withMessage('Event days must be an integer'),
  body('events.*.from_date')
    .optional()
    .isISO8601()
    .withMessage('Event from_date must be a valid date'),
  body('events.*.to_date').optional().isISO8601().withMessage('Event to_date must be a valid date'),
  body('events.*.duration').optional().isInt().withMessage('Event duration must be an integer'),
  body('events.*.reference').optional().isString().withMessage('Event reference must be a string'),
  body('events.*.place').optional().isString().withMessage('Event place must be a string'),
  body('events.*.calendar_id')
    .optional()
    .isString()
    .withMessage('Event calendar_id must be a string'),

  body('election_id').optional().trim().isString().withMessage('Election ID must be a string'),
];

export const calendarIdParamValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('Calendar ID is required')
    .isMongoId()
    .withMessage('Invalid calendar ID format'),
];
