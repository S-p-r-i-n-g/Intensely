import { Router } from 'express';
import { RatingsController } from '../controllers/ratings.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// Public routes - get ratings for any workout
router.get('/workouts/:workoutId', RatingsController.getWorkoutRatings);

// Protected routes - require authentication
router.use(authenticateUser);

// Rate/review workouts
router.post('/workouts/:workoutId', RatingsController.rateWorkout);

// User's own ratings
router.get('/me', RatingsController.getMyRatings);

// Delete rating
router.delete('/:historyId', RatingsController.deleteRating);

export default router;
