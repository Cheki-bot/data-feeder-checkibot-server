import { body, param, ValidationChain } from 'express-validator';

export const createCalendarEventValidation: ValidationChain[] = [
  body('scenery').trim().notEmpty().withMessage('scenery is required'),
  body('no')
    .notEmpty()
    .withMessage('no is required')
    .isInt({ min: 1 })
    .withMessage('no must be a positive integer'),
  body('id').not().exists().withMessage('id cannot be provided'),
  body('_id').not().exists().withMessage('_id cannot be provided'),
  body('created_by').not().exists().withMessage('created_by cannot be provided'),
  body('created_at').not().exists().withMessage('created_at cannot be provided'),
  body('updated_at').not().exists().withMessage('updated_at cannot be provided'),
  body('activity').trim().notEmpty().withMessage('activity is required'),
  body('days')
    .notEmpty()
    .withMessage('days is required')
    .isInt({ min: 1 })
    .withMessage('days must be a positive integer'),
  body('from_date')
    .notEmpty()
    .withMessage('from_date is required')
    .isISO8601()
    .withMessage('from_date must be a valid date'),
  body('to_date')
    .notEmpty()
    .withMessage('to_date is required')
    .isISO8601()
    .withMessage('to_date must be a valid date'),
  body('duration')
    .notEmpty()
    .withMessage('duration is required')
    .isInt({ min: 1 })
    .withMessage('duration must be a positive integer'),
  body('reference').trim().notEmpty().withMessage('reference is required'),
  body('place').trim().notEmpty().withMessage('place is required'),
  body('calendar_id').trim().notEmpty().withMessage('calendar_id is required'),
];

export const updateCalendarEventValidation: ValidationChain[] = [
  body('scenery').optional().trim().notEmpty().withMessage('scenery must be a non-empty string'),
  body('no').optional().isInt({ min: 1 }).withMessage('no must be a positive integer'),
  body('id').not().exists().withMessage('id cannot be provided'),
  body('_id').not().exists().withMessage('_id cannot be provided'),
  body('created_by').not().exists().withMessage('created_by cannot be provided'),
  body('created_at').not().exists().withMessage('created_at cannot be provided'),
  body('updated_at').not().exists().withMessage('updated_at cannot be provided'),
  body('activity').optional().trim().notEmpty().withMessage('activity must be a non-empty string'),
  body('days').optional().isInt({ min: 1 }).withMessage('days must be a positive integer'),
  body('from_date').optional().isISO8601().withMessage('from_date must be a valid date'),
  body('to_date').optional().isISO8601().withMessage('to_date must be a valid date'),
  body('duration').optional().isInt({ min: 1 }).withMessage('duration must be a positive integer'),
  body('reference')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('reference must be a non-empty string'),
  body('place').optional().trim().notEmpty().withMessage('place must be a non-empty string'),
  body('calendar_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('calendar_id must be a non-empty string'),
];

export const calendarEventIdParamValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid event ID format'),
];
