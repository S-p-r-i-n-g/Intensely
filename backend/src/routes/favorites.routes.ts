import { Router } from 'express';
import { FavoritesController } from '../controllers/favorites.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// All favorites routes require authentication
router.use(authenticateUser);

// Exercise favorites
router.post('/exercises/:exerciseId', FavoritesController.addExerciseToFavorites);
router.delete('/exercises/:exerciseId', FavoritesController.removeExerciseFromFavorites);
router.get('/exercises', FavoritesController.getFavoriteExercises);

// Workout favorites
router.post('/workouts/:workoutId', FavoritesController.addWorkoutToFavorites);
router.delete('/workouts/:workoutId', FavoritesController.removeWorkoutFromFavorites);
router.get('/workouts', FavoritesController.getFavoriteWorkouts);

export default router;
