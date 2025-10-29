import { Router } from 'express';
import {
  createVerificationValidation,
  updateVerificationValidation,
  verificationIdParamValidation,
} from '../../validators/verification.js';
import { authenticateToken, getCurrentUser, requireAdmin } from '../../middleware/auth.js';
import * as VerificationController from './verification.controller.js';

const router = Router();

// All verification routes require authentication
router.use(authenticateToken, getCurrentUser);

// Create verification (User and Admin)
router.post('/', createVerificationValidation, VerificationController.createVerification);

// Get all verifications (Users see only their own, Admins see all)
router.get('/', VerificationController.getAllVerifications);

// Get verification by ID (Users can only access their own, Admins can access any)
router.get('/:id', verificationIdParamValidation, VerificationController.getVerificationById);

// Update verification (Users can only update their own, Admins can update any)
router.patch(
  '/:id',
  verificationIdParamValidation,
  updateVerificationValidation,
  VerificationController.updateVerification,
);

// Delete verification (Admin only)
router.delete(
  '/:id',
  verificationIdParamValidation,
  requireAdmin,
  VerificationController.deleteVerification,
);

export default router;
