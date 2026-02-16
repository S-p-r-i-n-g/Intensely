import { Router } from 'express';
import { WorkoutFlowsController } from '../controllers/workout-flows.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// All flow routes use optional auth (work with or without authentication)
router.use(optionalAuth);

// POST /api/flows/take-the-wheel - Custom workout building
router.post('/take-the-wheel', WorkoutFlowsController.takeTheWheel);

export default router;
