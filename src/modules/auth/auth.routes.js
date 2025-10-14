import { Router } from 'express';
import { registerValidation, loginValidation } from '../../validators/auth.js';
import { authenticateToken, requireAdmin, getCurrentUser } from '../../middleware/auth.js';
import AuthController from './auth.controller.js';

const router = Router();

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser, AuthController.getProfile);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, AuthController.listUsers);
router.patch(
  '/users/:email/deactivate',
  authenticateToken,
  requireAdmin,
  AuthController.deactivateUserAccount,
);
router.patch(
  '/users/:email/activate',
  authenticateToken,
  requireAdmin,
  AuthController.activateUserAccount,
);
router.delete('/users/:email', authenticateToken, requireAdmin, AuthController.deleteUserAccount);

export default router;
