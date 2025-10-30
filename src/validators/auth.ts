import { body, param, ValidationChain } from 'express-validator';
import { ROLE_VALUES } from '../constants/roles.js';

/**
 * Validation rules for user registration
 */
export const registerValidation: ValidationChain[] = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores')
    .notEmpty()
    .withMessage('Username is required'),

  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),

  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters long')
    .notEmpty()
    .withMessage('Password is required'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      const body = req.body as { password?: string };
      if (value !== body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('role')
    .optional()
    .isIn(ROLE_VALUES)
    .withMessage(`Role must be one of: ${ROLE_VALUES.join(', ')}`),
];

/**
 * Validation rules for user login
 */
export const loginValidation: ValidationChain[] = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for email parameter in routes
 */
export const emailParamValidation: ValidationChain[] = [
  param('email').isEmail().withMessage('Must be a valid email address'),
];
