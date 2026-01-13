import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All progress routes require authentication
router.use(authenticateUser);

// Exercise progress
router.post('/exercises/:exerciseId', ProgressController.logExerciseProgress);
router.get('/exercises/:exerciseId', ProgressController.getExerciseProgress);
router.get('/exercises', ProgressController.getAllProgress);
router.delete('/exercises/:exerciseId', ProgressController.deleteExerciseProgress);

// Progress summary
router.get('/summary', ProgressController.getProgressSummary);

export default router;
