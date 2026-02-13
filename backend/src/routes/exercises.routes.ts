import { Router } from 'express';
import { ExercisesController } from '../controllers/exercises.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// Public routes (read-only)
router.get('/', ExercisesController.listExercises);
router.get('/categories', ExercisesController.getCategories);
router.get('/by-slug/:slug', ExercisesController.getExerciseBySlug);
router.get('/:id', ExercisesController.getExercise);

// Protected routes (require authentication)
router.post('/', authenticateUser, ExercisesController.createExercise);

export default router;
