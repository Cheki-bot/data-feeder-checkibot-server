import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as VerificationService from './verification.service';
import { ROLES } from '../../constants/roles';
import { AuthRequest, getDb } from '../../types/authInterfaces';
import { CreateVerificationData } from './verification.model';

interface VerificationQuery {
  status?: string;
  category?: string;
}

/**
 * POST /api/verifications
 * Create a new verification (User and Admin)
 */
export async function createVerification(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const db = getDb(req);
    const verificationData = req.body as CreateVerificationData;
    const userEmail = req.currentUser?.email;

    if (userEmail === undefined) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

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
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
}

/**
 * GET /api/verifications
 * Get all verifications
 * - Users can only see their own verifications
 * - Admins can see all verifications
 */
export async function getAllVerifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { status, category } = req.query as VerificationQuery;

    const filters: VerificationService.VerificationFilters = {};

    // Users can only see their own verifications, admins see all
    if (req.currentUser?.role !== ROLES.ADMIN) {
      filters.created_by = req.currentUser?.email;
    }

    if (status !== undefined) {
      filters.status = status as 'draft' | 'published';
    }

    if (category !== undefined) {
      filters.category = category;
    }

    const verifications = await VerificationService.getAllVerifications(db, filters);

    res.json({
      verifications,
      count: verifications.length,
    });
  } catch (error) {
    console.error('Get all verifications error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
}

/**
 * GET /api/verifications/:id
 * Get a single verification by ID
 * - Users can only access their own verifications
 * - Admins can access any verification
 */
export async function getVerificationById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const verification = await VerificationService.getVerificationById(db, id);

    if (verification === null) {
      res.status(404).json({ message: 'Verification not found' });
      return;
    }

    // Check permissions: users can only access their own verifications
    if (
      req.currentUser?.role !== ROLES.ADMIN &&
      verification.created_by !== req.currentUser?.email
    ) {
      res.status(403).json({ message: 'You can only access your own verifications' });
      return;
    }

    res.json(verification);
  } catch (error) {
    console.error('Get verification by ID error:', error);

    if (error instanceof Error && error.message === 'INVALID_VERIFICATION_ID') {
      res.status(400).json({ message: 'Invalid verification ID format' });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
}

/**
 * PATCH /api/verifications/:id
 * Update a verification
 * - Users can only update their own verifications
 * - Admins can update any verification
 */
export async function updateVerification(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const db = getDb(req);
    const { id } = req.params;

    // Check if verification exists
    const existingVerification = await VerificationService.getVerificationById(db, id);

    if (existingVerification === null) {
      res.status(404).json({ message: 'Verification not found' });
      return;
    }

    // Check permissions: users can only update their own verifications
    if (
      req.currentUser?.role !== ROLES.ADMIN &&
      existingVerification.created_by !== req.currentUser?.email
    ) {
      res.status(403).json({ message: 'You can only update your own verifications' });
      return;
    }

    const updateData = req.body as Partial<CreateVerificationData>;
    const updatedVerification = await VerificationService.updateVerification(db, id, updateData);

    res.json({
      message: 'Verification updated successfully',
      verification: updatedVerification,
    });
  } catch (error) {
    console.error('Update verification error:', error);

    if (error instanceof Error && error.message === 'INVALID_VERIFICATION_ID') {
      res.status(400).json({ message: 'Invalid verification ID format' });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
}

/**
 * DELETE /api/verifications/:id
 * Delete a verification (Admin only)
 */
export async function deleteVerification(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    // Check if verification exists
    const existingVerification = await VerificationService.getVerificationById(db, id);

    if (existingVerification === null) {
      res.status(404).json({ message: 'Verification not found' });
      return;
    }

    const deleted = await VerificationService.deleteVerification(db, id);

    if (!deleted) {
      res.status(500).json({ message: 'Failed to delete verification' });
      return;
    }

    res.json({ message: 'Verification deleted successfully' });
  } catch (error) {
    console.error('Delete verification error:', error);

    if (error instanceof Error && error.message === 'INVALID_VERIFICATION_ID') {
      res.status(400).json({ message: 'Invalid verification ID format' });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: message });
  }
}
