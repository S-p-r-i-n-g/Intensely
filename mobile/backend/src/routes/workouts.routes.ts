import { Router } from 'express';
import { WorkoutsController } from '../controllers/workouts.controller';

const router = Router();

// POST /api/workouts - Create/save a workout
router.post('/', WorkoutsController.createWorkout);

// GET /api/workouts - List all workouts
router.get('/', WorkoutsController.listWorkouts);

// GET /api/workouts/:id - Get single workout by ID
router.get('/:id', WorkoutsController.getWorkout);

// PUT /api/workouts/:id - Update a workout
router.put('/:id', WorkoutsController.updateWorkout);

// DELETE /api/workouts/:id - Delete a workout
router.delete('/:id', WorkoutsController.deleteWorkout);

export default router;
