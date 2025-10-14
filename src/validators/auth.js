import { body } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .notEmpty()
    .withMessage('Password is required'),

  body('role')
    .optional()
    .isIn(['Admin', 'User'])
    .withMessage('Role must be either Admin or User')
    .default('User'),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];
