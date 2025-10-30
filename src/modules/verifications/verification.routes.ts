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

// Create verification (User and Admin)
router.post('/', createVerificationValidation, VerificationController.createVerification);

// Get all verifications (User gets own, Admin gets all)
router.get('/', VerificationController.getAllVerifications);

// Get single verification by ID (User gets own, Admin gets any)
router.get('/:id', verificationIdParamValidation, VerificationController.getVerificationById);

// Update verification (User updates own, Admin updates any)
router.patch(
  '/:id',
  verificationIdParamValidation,
  updateVerificationValidation,
  VerificationController.updateVerification,
);

// Delete verification (Admin only)
router.delete(
  '/:id',
  requireAdmin,
  verificationIdParamValidation,
  VerificationController.deleteVerification,
);

export default router;
