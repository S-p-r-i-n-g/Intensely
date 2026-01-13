import { Router } from 'express';
import { WorkoutSessionController } from '../controllers/workout-session.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All session routes require authentication
router.use(authenticateUser);

// Start a new workout session
router.post('/start', WorkoutSessionController.startSession);

// Get active sessions
router.get('/active', WorkoutSessionController.getActiveSessions);

// Get specific session
router.get('/:sessionId', WorkoutSessionController.getSession);

// Update session progress
router.patch('/:sessionId/progress', WorkoutSessionController.updateProgress);

// Complete session
router.post('/:sessionId/complete', WorkoutSessionController.completeSession);

// Cancel session
router.delete('/:sessionId', WorkoutSessionController.cancelSession);

export default router;
