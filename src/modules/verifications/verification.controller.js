import { validationResult } from 'express-validator';
import * as VerificationService from './verification.service.js';
import { ROLES } from '../../constants/roles.js';

/**
 * POST /api/verifications
 * Create a new verification (User and Admin)
 */
export async function createVerification(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = req.app.locals.db;
    const verificationData = req.body;
    const userEmail = req.currentUser.email;

    const verification = await VerificationService.createVerification(
      db,
      verificationData,
      userEmail,
    );

    res.status(201).json({
      message: 'Verification created successfully',
      verification,
    });
  } catch (error) {
    console.error('Create verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * GET /api/verifications
 * Get all verifications
 * - Users can only see their own verifications
 * - Admins can see all verifications
 */
export async function getAllVerifications(req, res) {
  try {
    const db = req.app.locals.db;
    const { status, category } = req.query;

    const filters = {};

    // Users can only see their own verifications, admins see all
    if (req.currentUser.role !== ROLES.ADMIN) {
      filters.created_by = req.currentUser.email;
    }

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters.category = category;
    }

    const verifications = await VerificationService.getAllVerifications(db, filters);

    res.json({
      verifications,
      count: verifications.length,
    });
  } catch (error) {
    console.error('Get all verifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * GET /api/verifications/:id
 * Get a single verification by ID
 * - Users can only access their own verifications
 * - Admins can access any verification
 */
export async function getVerificationById(req, res) {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const verification = await VerificationService.getVerificationById(db, id);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Check permissions: users can only access their own verifications
    if (req.currentUser.role !== ROLES.ADMIN && verification.created_by !== req.currentUser.email) {
      return res.status(403).json({ message: 'You can only access your own verifications' });
    }

    res.json(verification);
  } catch (error) {
    console.error('Get verification by ID error:', error);

    if (error.message === 'INVALID_VERIFICATION_ID') {
      return res.status(400).json({ message: 'Invalid verification ID format' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * PATCH /api/verifications/:id
 * Update a verification
 * - Users can only update their own verifications
 * - Admins can update any verification
 */
export async function updateVerification(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if verification exists
    const existingVerification = await VerificationService.getVerificationById(db, id);

    if (!existingVerification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Check permissions: users can only update their own verifications
    if (
      req.currentUser.role !== ROLES.ADMIN &&
      existingVerification.created_by !== req.currentUser.email
    ) {
      return res.status(403).json({ message: 'You can only update your own verifications' });
    }

    const updateData = req.body;
    const updatedVerification = await VerificationService.updateVerification(db, id, updateData);

    res.json({
      message: 'Verification updated successfully',
      verification: updatedVerification,
    });
  } catch (error) {
    console.error('Update verification error:', error);

    if (error.message === 'INVALID_VERIFICATION_ID') {
      return res.status(400).json({ message: 'Invalid verification ID format' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

/**
 * DELETE /api/verifications/:id
 * Delete a verification (Admin only)
 */
export async function deleteVerification(req, res) {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if verification exists
    const existingVerification = await VerificationService.getVerificationById(db, id);

    if (!existingVerification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    const deleted = await VerificationService.deleteVerification(db, id);

    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete verification' });
    }

    res.json({ message: 'Verification deleted successfully' });
  } catch (error) {
    console.error('Delete verification error:', error);

    if (error.message === 'INVALID_VERIFICATION_ID') {
      return res.status(400).json({ message: 'Invalid verification ID format' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
