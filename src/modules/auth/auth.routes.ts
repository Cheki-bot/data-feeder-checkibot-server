import { Router } from 'express';
import { registerValidation, loginValidation, emailParamValidation } from '../../validators/auth';
import { authenticateToken, getCurrentUser, requireAdmin } from '../../middleware/auth';
import * as AuthController from './auth.controller';

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
  emailParamValidation,
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.deactivateUser,
);
router.patch(
  '/users/:email/activate',
  emailParamValidation,
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.activateUser,
);
router.delete(
  '/users/:email',
  emailParamValidation,
  authenticateToken,
  getCurrentUser,
  requireAdmin,
  AuthController.deleteUser,
);

export default router;
