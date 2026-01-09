import { Router } from 'express';
import { WorkoutHistoryController } from '../controllers/workout-history.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All history routes require authentication
router.use(authenticateUser);

// POST /api/history - Log completed workout
router.post('/', WorkoutHistoryController.logWorkout);

// GET /api/history - Get workout history
router.get('/', WorkoutHistoryController.getHistory);

// GET /api/history/stats - Get workout statistics
router.get('/stats', WorkoutHistoryController.getStats);

// GET /api/history/:id - Get single history entry
router.get('/:id', WorkoutHistoryController.getHistoryEntry);

export default router;
