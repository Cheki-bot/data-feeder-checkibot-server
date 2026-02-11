import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuthRequest, RegisterBody, UpdateUserBody, getDb } from '../../types/authInterfaces';
import * as AuthService from '../auth/auth.service';
import * as UserService from './user.service';

export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const users = await UserService.getAllUsers(db);

    res.json({
      message: 'Users retrieved successfully',
      ok: true,
      status: 200,
      data: users,
    });
  } catch (error) {
    console.error('List users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * GET /api/users/:id
 * Get user by ID
 */
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const user = await UserService.getUserById(db, userId);

    if (!user) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User retrieved successfully',
      ok: true,
      status: 200,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * PUT /api/users/:id
 * Update user (Admin only)
 */
export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;
    const { username, email, password, is_active } = req.body as UpdateUserBody;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const updatedUser = await UserService.updateUser(db, userId, {
      username,
      email,
      password,
      is_active,
    });

    if (!updatedUser) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User updated successfully',
      ok: true,
      status: 200,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * PUT /api/users/:id/deactivate
 * Deactivate a user (Admin only)
 */
export async function deactivateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const result = await UserService.deactivateUser(db, userId);

    if (!result) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User deactivated successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * PUT /api/users/:id/activate
 * Activate a user (Admin only)
 */
export async function activateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const result = await UserService.activateUser(db, userId);

    if (!result) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User activated successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Activate user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * DELETE /api/users/:id
 * Delete a user (Admin only)
 */
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({
        message: 'Invalid user ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const db = getDb(req);
    const result = await UserService.deleteUser(db, userId);

    if (!result) {
      res.status(404).json({
        message: 'User not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'User deleted successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}

/**
 * POST /api/users
 * Create a new user (Admin only)
 */
export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body as RegisterBody;

    const db = getDb(req);
    const newUser = await AuthService.registerUser(db, username, email, password, 'user');

    res.status(201).json({
      message: 'User created successfully',
      ok: true,
      status: 201,
      data: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: errorMessage,
    });
  }
}
