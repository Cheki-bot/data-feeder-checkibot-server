import { Router } from 'express';
import { registerValidation, loginValidation } from '../../validators/auth.js';
import { authenticateToken, getCurrentUser, requireAdmin } from '../../middleware/auth.js';
import AuthController from './auth.controller.js';

const router = Router();

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser, AuthController.getProfile);

// Admin-only routes
router.get('/users', authenticateToken, getCurrentUser, requireAdmin, AuthController.listUsers);
router.patch(
  '/users/:email/deactivate',
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.deactivateUser,
);
router.patch(
  '/users/:email/activate',
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.activateUser,
);
router.delete(
  '/users/:email',
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.deleteUser,
);

export default router;
