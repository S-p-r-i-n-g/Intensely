import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticateUser);

// GET /api/users/me - Get current user profile
router.get('/me', UsersController.getCurrentUser);

// POST /api/users/sync - Sync user from Supabase Auth
router.post('/sync', UsersController.syncUser);

// GET /api/users/preferences - Get user preferences
router.get('/preferences', UsersController.getPreferences);

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', UsersController.updatePreferences);

export default router;
