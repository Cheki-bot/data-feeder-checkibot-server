import { Router } from 'express';
import {
  changeUserRoleValidation,
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from '../../validators/auth';
import { authenticateToken, getCurrentUser, requireAdmin } from '../../middleware/auth';
import * as AuthController from './auth.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - role
 *         - is_active
 *         - created_at
 *         - updated_at
 *         - promoted_by
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         role:
 *           type: string
 *           enum: [employee, admin]
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         promoted_by:
 *           type: string
 *           format: ObjectId
 *           nullable: true
 *           description: ObjectId of the admin who promoted this user to ADMIN role (null for ORIGINAL admins or EMPLOYE users)
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with username, email and password. Default role is 'employee'.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 description: Username (letters, numbers and underscores only)
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: SecurePass123
 *                 description: Password must be at least 8 characters
 *               confirmPassword:
 *                 type: string
 *                 description: Must match password exactly
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       msg:
 *                         type: string
 *                         example: Username must be between 3 and 30 characters
 *                   example:
 *                     - type: field
 *                       msg: Username is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: Server error
 */
// Public routes - Register
router.post('/register', registerValidation, AuthController.register);
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Account locked or deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Public routes - Login
router.post('/login', loginValidation, AuthController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile retrieved successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Protected routes - Get profile
router.get('/me', authenticateToken, getCurrentUser, AuthController.getProfile);

/**
 * @openapi
 * /auth/users:
 *   get:
 *     summary: List all users
 *     description: Get a list of all users in the system (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Admin-only routes - List users
router.get('/users', authenticateToken, getCurrentUser, requireAdmin, AuthController.listUsers);

/**
 * @openapi
 * /auth/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     description: Deactivate a user account (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deactivated successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Admin-only routes - Deactivate user
router.patch(
  '/users/:id/deactivate',
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.deactivateUser,
);

/**
 * @openapi
 * /auth/users/{id}/activate:
 *   patch:
 *     summary: Activate a user
 *     description: Activate a previously deactivated user account (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User activated successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Admin-only routes - Activate user
router.patch(
  '/users/:id/activate',
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.activateUser,
);

/**
 * @openapi
 * /auth/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Permanently delete a user account (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Admin-only routes - Delete user
router.delete(
  '/users/:id',
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.deleteUser,
);

/**
 * @openapi
 * /auth/users/{id}/role:
 *   put:
 *     summary: Change user role
 *     description: Change the role of a user (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, employee]
 *                 description: User role (admin or employee)
 *                 example: employee
 *     responses:
 *       200:
 *         description: User role changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User role changed successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or cannot change own role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - admin only or insufficient privileges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Admin-only routes - Change user role
router.put(
  '/users/:id/role',
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  changeUserRoleValidation,
  AuthController.changeUserRole,
);

/**
 * @openapi
 * /auth/me/change-password:
 *   patch:
 *     summary: Change user password
 *     description: Change the password of the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Current password for verification
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *                 description: New password (must be different from current)
 *                 example: NewPassword456
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *                 description: Confirmation of new password (must match newPassword)
 *                 example: NewPassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation errors
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *                 errors:
 *                   type: array
 *       401:
 *         description: Unauthorized or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current password is incorrect
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
router.patch(
  '/me/change-password',
  authenticateToken,
  changePasswordValidation,
  AuthController.changePassword,
);

export default router;
