import { Router } from 'express';
import {
  createVerificationValidation,
  updateVerificationValidation,
  verificationIdParamValidation,
} from '../../validators/verification';
import { authenticateToken, getCurrentUser, requireAdmin } from '../../middleware/auth';
import * as VerificationController from './verification.controller';

const router = Router();

// All verification routes require authentication
router.use(authenticateToken, getCurrentUser);

/**
 * @openapi
 * components:
 *   schemas:
 *     NewsTag:
 *       type: object
 *       required:
 *         - name
 *         - url
 *       properties:
 *         name:
 *           type: string
 *           description: Tag name
 *         url:
 *           type: string
 *           format: uri
 *           description: Tag URL
 *     NewsVerification:
 *       type: object
 *       required:
 *         - title
 *         - classified_as
 *         - section_url
 *         - summary
 *         - body
 *         - url
 *         - publication_date
 *         - tags
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier
 *         title:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: News verification title
 *         classified_as:
 *           type: string
 *           description: Classification of the news (e.g., verdadero, falso, cuestionable)
 *         section_url:
 *           type: string
 *           format: uri
 *           description: Section URL
 *         summary:
 *           type: string
 *           description: Summary of the verification
 *         body:
 *           type: string
 *           description: Full body of the verification
 *         url:
 *           type: string
 *           format: uri
 *           description: Original news URL
 *         publication_date:
 *           type: string
 *           format: date-time
 *           description: Publication date
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NewsTag'
 *         created_by:
 *           type: string
 *           description: Email of the creator
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /verifications:
 *   post:
 *     summary: Create a new news verification
 *     tags: [News Verifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - classified_as
 *               - section_url
 *               - summary
 *               - body
 *               - url
 *               - publication_date
 *               - tags
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               classified_as:
 *                 type: string
 *               section_url:
 *                 type: string
 *                 format: uri
 *               summary:
 *                 type: string
 *               body:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               publication_date:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/NewsTag'
 *     responses:
 *       201:
 *         description: News verification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: News verification created successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/NewsVerification'
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
// Create verification (User and Admin)
router.post('/', createVerificationValidation, VerificationController.createVerification);

/**
 * @openapi
 * /verifications:
 *   get:
 *     summary: Get all news verifications
 *     description: Users can only see their own verifications. Admins see all.
 *     tags: [News Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classified_as
 *         schema:
 *           type: string
 *         description: Filter by classification
 *     responses:
 *       200:
 *         description: List of news verifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: News verifications retrieved successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewsVerification'
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
// Get all verifications (User gets own, Admin gets all)
router.get('/', VerificationController.getAllVerifications);

/**
 * @openapi
 * /verifications/{id}:
 *   get:
 *     summary: Get a news verification by ID
 *     description: Users can only access their own verifications. Admins can access any.
 *     tags: [News Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News verification ID
 *     responses:
 *       200:
 *         description: News verification found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: News verification retrieved successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/NewsVerification'
 *       400:
 *         description: Invalid ID format
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
 *         description: Forbidden - can only access own verifications
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
 *         description: News verification not found
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
// Get single verification by ID (User gets own, Admin gets any)
router.get('/:id', verificationIdParamValidation, VerificationController.getVerificationById);

/**
 * @openapi
 * /verifications/{id}:
 *   patch:
 *     summary: Update a news verification
 *     description: Users can only update their own verifications. Admins can update any.
 *     tags: [News Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News verification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               classified_as:
 *                 type: string
 *               section_url:
 *                 type: string
 *                 format: uri
 *               summary:
 *                 type: string
 *               body:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               publication_date:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/NewsTag'
 *     responses:
 *       200:
 *         description: News verification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: News verification updated successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/NewsVerification'
 *       400:
 *         description: Validation error or invalid ID
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
 *         description: Forbidden - can only update own verifications
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
 *         description: News verification not found
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
// Update verification (User updates own, Admin updates any)
router.patch(
  '/:id',
  verificationIdParamValidation,
  updateVerificationValidation,
  VerificationController.updateVerification,
);

/**
 * @openapi
 * /verifications/{id}:
 *   delete:
 *     summary: Delete a news verification
 *     description: Admin only
 *     tags: [News Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News verification ID
 *     responses:
 *       200:
 *         description: News verification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: News verification deleted successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Invalid ID format
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
 *         description: News verification not found
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
// Delete verification (Admin only)
router.delete(
  '/:id',
  requireAdmin,
  verificationIdParamValidation,
  VerificationController.deleteVerification,
);

/**
 * @openapi
 * /verifications/submit-multiple:
 *   post:
 *     summary: Create multiple news verifications
 *     description: Admin only
 *     tags: [News Verifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - classified_as
 *                     - section_url
 *                     - summary
 *                     - body
 *                     - url
 *                     - publication_date
 *                     - tags
 *                   properties:
 *                     title:
 *                       type: string
 *                       minLength: 10
 *                       maxLength: 500
 *                     classified_as:
 *                       type: string
 *                     section_url:
 *                       type: string
 *                       format: uri
 *                     summary:
 *                       type: string
 *                     body:
 *                       type: string
 *                     url:
 *                       type: string
 *                       format: uri
 *                     publication_date:
 *                       type: string
 *                       format: date-time
 *                     tags:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NewsTag'
 *     responses:
 *       201:
 *         description: Multiple news verifications created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Multiple news verifications created successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewsVerification'
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
router.post(
  '/submit-multiple',
  requireAdmin,
  VerificationController.createMultipleNewsVerificationsController,
);

export default router;
