import { body, param, ValidationChain } from 'express-validator';
import { ROLE_VALUES } from '../constants/roles';

/**
 * Validation rules for user update
 */
export const updateUserValidation: ValidationChain[] = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),

  body('email').optional().isEmail().withMessage('Must be a valid email address').normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(ROLE_VALUES)
    .withMessage(`Role must be one of: ${ROLE_VALUES.join(', ')}`),

  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean value'),
];

/**
 * Validation rules for user creation
 */
export const createUserValidation: ValidationChain[] = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(ROLE_VALUES)
    .withMessage(`Role must be one of: ${ROLE_VALUES.join(', ')}`),

  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean value'),
];

/**
 * Validation rules for user ID parameter
 */
export const userIdParamValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];
