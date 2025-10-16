import { Router } from 'express';
import { registerValidation, loginValidation } from '../../validators/auth.js';
import { authenticateToken, getCurrentUser } from '../../middleware/auth.js';
import AuthController from './auth.controller.js';

const router = Router();

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser, AuthController.getProfile);

export default router;

