import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class FavoritesController {
  /**
   * POST /api/favorites/exercises/:exerciseId
   * Add exercise to favorites
   */
  static async addExerciseToFavorites(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { exerciseId } = req.params;

      // Check if exercise exists
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId }
      });

      if (!exercise) {
        res.status(404).json({
          error: 'Exercise not found',
          message: 'Exercise does not exist'
        });
        return;
      }

      // Check if already favorited
      const existing = await prisma.favoriteExercise.findUnique({
        where: {
          userId_exerciseId: {
            userId: req.user.id,
            exerciseId
          }
        }
      });

      if (existing) {
        res.status(200).json({
          success: true,
          message: 'Exercise already in favorites',
          data: existing
        });
        return;
      }

      // Add to favorites
      const favorite = await prisma.favoriteExercise.create({
        data: {
          userId: req.user.id,
          exerciseId
        },
        include: {
          exercise: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Exercise added to favorites',
        data: favorite
      });
    } catch (error) {
      console.error('Error adding exercise to favorites:', error);
      res.status(500).json({
        error: 'Failed to add favorite',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/favorites/exercises/:exerciseId
   * Remove exercise from favorites
   */
  static async removeExerciseFromFavorites(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { exerciseId } = req.params;

      const deleted = await prisma.favoriteExercise.deleteMany({
        where: {
          userId: req.user.id,
          exerciseId
        }
      });

      if (deleted.count === 0) {
        res.status(404).json({
          error: 'Not found',
          message: 'Exercise not in favorites'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Exercise removed from favorites'
      });
    } catch (error) {
      console.error('Error removing exercise from favorites:', error);
      res.status(500).json({
        error: 'Failed to remove favorite',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/favorites/exercises
   * Get user's favorite exercises
   */
  static async getFavoriteExercises(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const favorites = await prisma.favoriteExercise.findMany({
        where: { userId: req.user.id },
        include: {
          exercise: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: favorites
      });
    } catch (error) {
      console.error('Error fetching favorite exercises:', error);
      res.status(500).json({
        error: 'Failed to fetch favorites',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/favorites/workouts/:workoutId
   * Add workout to favorites
   */
  static async addWorkoutToFavorites(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { workoutId } = req.params;

      // Check if workout exists
      const workout = await prisma.workout.findUnique({
        where: { id: workoutId }
      });

      if (!workout) {
        res.status(404).json({
          error: 'Workout not found',
          message: 'Workout does not exist'
        });
        return;
      }

      // Check if already favorited
      const existing = await prisma.favoriteWorkout.findUnique({
        where: {
          userId_workoutId: {
            userId: req.user.id,
            workoutId
          }
        }
      });

      if (existing) {
        res.status(200).json({
          success: true,
          message: 'Workout already in favorites',
          data: existing
        });
        return;
      }

      // Add to favorites
      const favorite = await prisma.favoriteWorkout.create({
        data: {
          userId: req.user.id,
          workoutId
        },
        include: {
          workout: {
            include: {
              circuits: {
                include: {
                  exercises: {
                    include: {
                      exercise: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Workout added to favorites',
        data: favorite
      });
    } catch (error) {
      console.error('Error adding workout to favorites:', error);
      res.status(500).json({
        error: 'Failed to add favorite',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/favorites/workouts/:workoutId
   * Remove workout from favorites
   */
  static async removeWorkoutFromFavorites(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { workoutId } = req.params;

      const deleted = await prisma.favoriteWorkout.deleteMany({
        where: {
          userId: req.user.id,
          workoutId
        }
      });

      if (deleted.count === 0) {
        res.status(404).json({
          error: 'Not found',
          message: 'Workout not in favorites'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Workout removed from favorites'
      });
    } catch (error) {
      console.error('Error removing workout from favorites:', error);
      res.status(500).json({
        error: 'Failed to remove favorite',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/favorites/workouts
   * Get user's favorite workouts
   */
  static async getFavoriteWorkouts(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const favorites = await prisma.favoriteWorkout.findMany({
        where: { userId: req.user.id },
        include: {
          workout: {
            include: {
              circuits: {
                include: {
                  exercises: {
                    include: {
                      exercise: true
                    },
                    orderBy: { exerciseOrder: 'asc' }
                  }
                },
                orderBy: { circuitOrder: 'asc' }
              },
              objectiveMappings: {
                include: {
                  objective: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: favorites
      });
    } catch (error) {
      console.error('Error fetching favorite workouts:', error);
      res.status(500).json({
        error: 'Failed to fetch favorites',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
