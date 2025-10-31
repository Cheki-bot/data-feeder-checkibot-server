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
 *                 verification:
 *                   $ref: '#/components/schemas/NewsVerification'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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
 *                 verifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewsVerification'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
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
 *               $ref: '#/components/schemas/NewsVerification'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only access own verifications
 *       404:
 *         description: News verification not found
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
 *                 verification:
 *                   $ref: '#/components/schemas/NewsVerification'
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only update own verifications
 *       404:
 *         description: News verification not found
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
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: News verification not found
 */
// Delete verification (Admin only)
router.delete(
  '/:id',
  requireAdmin,
  verificationIdParamValidation,
  VerificationController.deleteVerification,
);

export default router;
