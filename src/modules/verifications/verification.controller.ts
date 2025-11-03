import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as VerificationService from './verification.service';
import { ROLES } from '../../constants/roles';
import { AuthRequest, getDb } from '../../types/authInterfaces';
import { CreateNewsVerificationData } from './verification.model';

interface NewsVerificationQuery {
  classified_as?: string;
}

/**
 * POST /api/verifications
 * Create a new news verification (User and Admin)
 */
export async function createVerification(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      ok: false,
      status: 400,
      errors: errors.array(),
    });
    return;
  }

  try {
    const db = getDb(req);
    const verificationData = req.body as CreateNewsVerificationData;
    const userEmail = req.currentUser?.email;

    if (userEmail === undefined) {
      res.status(401).json({
        message: 'User not authenticated',
        ok: false,
        status: 401,
      });
      return;
    }

    const verification = await VerificationService.createNewsVerification(
      db,
      verificationData,
      userEmail,
    );

    res.status(201).json({
      message: 'News verification created successfully',
      ok: true,
      status: 201,
      data: verification,
    });
  } catch (error) {
    console.error('Create news verification error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * GET /api/verifications
 * Get all news verifications
 * - Users can only see their own news verifications
 * - Admins can see all news verifications
 */
export async function getAllVerifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { classified_as } = req.query as NewsVerificationQuery;

    const filters: VerificationService.NewsVerificationFilters = {};

    // Users can only see their own news verifications, admins see all
    if (req.currentUser !== undefined && req.currentUser.role !== ROLES.ADMIN) {
      filters.created_by = req.currentUser.email;
    }

    if (classified_as !== undefined) {
      filters.classified_as = classified_as;
    }

    const verifications = await VerificationService.getAllNewsVerifications(db, filters);

    res.json({
      message: 'News verifications retrieved successfully',
      ok: true,
      status: 200,
      data: verifications,
    });
  } catch (error) {
    console.error('Get all news verifications error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * GET /api/verifications/:id
 * Get a single news verification by ID
 * - Users can only access their own news verifications
 * - Admins can access any news verification
 */
export async function getVerificationById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const verification = await VerificationService.getNewsVerificationById(db, id);

    if (verification === null) {
      res.status(404).json({
        message: 'News verification not found',
        ok: false,
        status: 404,
      });
      return;
    }

    // Check permissions: users can only access their own news verifications
    if (
      req.currentUser !== undefined &&
      req.currentUser.role !== ROLES.ADMIN &&
      verification.created_by !== req.currentUser.email
    ) {
      res.status(403).json({
        message: 'You can only access your own news verifications',
        ok: false,
        status: 403,
      });
      return;
    }

    res.json({
      message: 'News verification retrieved successfully',
      ok: true,
      status: 200,
      data: verification,
    });
  } catch (error) {
    console.error('Get news verification by ID error:', error);

    if (error instanceof Error && error.message === 'INVALID_VERIFICATION_ID') {
      res.status(400).json({
        message: 'Invalid news verification ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * PATCH /api/verifications/:id
 * Update a news verification
 * - Users can only update their own news verifications
 * - Admins can update any news verification
 */
export async function updateVerification(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      ok: false,
      status: 400,
      errors: errors.array(),
    });
    return;
  }

  try {
    const db = getDb(req);
    const { id } = req.params;

    // Check if news verification exists
    const existingVerification = await VerificationService.getNewsVerificationById(db, id);

    if (existingVerification === null) {
      res.status(404).json({
        message: 'News verification not found',
        ok: false,
        status: 404,
      });
      return;
    }

    // Check permissions: users can only update their own news verifications
    if (
      req.currentUser !== undefined &&
      req.currentUser.role !== ROLES.ADMIN &&
      existingVerification.created_by !== req.currentUser.email
    ) {
      res.status(403).json({
        message: 'You can only update your own news verifications',
        ok: false,
        status: 403,
      });
      return;
    }

    const updateData = req.body as Partial<CreateNewsVerificationData>;
    const updatedVerification = await VerificationService.updateNewsVerification(
      db,
      id,
      updateData,
    );

    res.json({
      message: 'News verification updated successfully',
      ok: true,
      status: 200,
      data: updatedVerification,
    });
  } catch (error) {
    console.error('Update news verification error:', error);

    if (error instanceof Error && error.message === 'INVALID_VERIFICATION_ID') {
      res.status(400).json({
        message: 'Invalid news verification ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * DELETE /api/verifications/:id
 * Delete a news verification (Admin only)
 */
export async function deleteVerification(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    // Check if news verification exists
    const existingVerification = await VerificationService.getNewsVerificationById(db, id);

    if (existingVerification === null) {
      res.status(404).json({
        message: 'News verification not found',
        ok: false,
        status: 404,
      });
      return;
    }

    const deleted = await VerificationService.deleteNewsVerification(db, id);

    if (!deleted) {
      res.status(500).json({
        message: 'Failed to delete news verification',
        ok: false,
        status: 500,
      });
      return;
    }

    res.json({
      message: 'News verification deleted successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Delete news verification error:', error);

    if (error instanceof Error && error.message === 'INVALID_VERIFICATION_ID') {
      res.status(400).json({
        message: 'Invalid news verification ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}
