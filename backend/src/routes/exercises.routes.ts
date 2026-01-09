import { Router } from 'express';
import { ExercisesController } from '../controllers/exercises.controller';

const router = Router();

// GET /api/exercises - List all exercises with filtering
router.get('/', ExercisesController.listExercises);

// GET /api/exercises/categories - Get categories with counts
router.get('/categories', ExercisesController.getCategories);

// GET /api/exercises/by-slug/:slug - Get exercise by slug
router.get('/by-slug/:slug', ExercisesController.getExerciseBySlug);

// GET /api/exercises/:id - Get single exercise by ID
router.get('/:id', ExercisesController.getExercise);

export default router;
