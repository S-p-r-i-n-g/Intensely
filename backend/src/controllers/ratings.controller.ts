import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class RatingsController {
  /**
   * POST /api/ratings/workouts/:workoutId
   * Add or update a rating for a completed workout
   */
  static async rateWorkout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { workoutId } = req.params;
      const { historyId, rating, difficulty, review } = req.body;

      // Validate rating
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        res.status(400).json({
          error: 'Invalid rating',
          message: 'Rating must be between 1 and 5'
        });
        return;
      }

      // Validate difficulty
      if (difficulty !== undefined && (difficulty < 1 || difficulty > 5)) {
        res.status(400).json({
          error: 'Invalid difficulty',
          message: 'Difficulty must be between 1 and 5'
        });
        return;
      }

      // If historyId provided, update that specific history entry
      if (historyId) {
        const history = await prisma.workoutHistory.findFirst({
          where: {
            id: historyId,
            userId: req.user.id,
            workoutId
          }
        });

        if (!history) {
          res.status(404).json({
            error: 'History not found',
            message: 'Workout history entry not found'
          });
          return;
        }

        const updated = await prisma.workoutHistory.update({
          where: { id: historyId },
          data: {
            userRating: rating,
            perceivedDifficulty: difficulty,
            notes: review
          }
        });

        // Recalculate average rating for workout
        await RatingsController.updateWorkoutAverageRating(workoutId);

        res.json({
          success: true,
          message: 'Rating updated',
          data: updated
        });
        return;
      }

      // Otherwise, find the most recent completed workout
      const recentHistory = await prisma.workoutHistory.findFirst({
        where: {
          userId: req.user.id,
          workoutId,
          completedAt: { not: null }
        },
        orderBy: { completedAt: 'desc' }
      });

      if (!recentHistory) {
        res.status(404).json({
          error: 'No completed workout found',
          message: 'You must complete this workout before rating it'
        });
        return;
      }

      const updated = await prisma.workoutHistory.update({
        where: { id: recentHistory.id },
        data: {
          userRating: rating,
          perceivedDifficulty: difficulty,
          notes: review
        }
      });

      // Recalculate average rating for workout
      await RatingsController.updateWorkoutAverageRating(workoutId);

      res.json({
        success: true,
        message: 'Rating saved',
        data: updated
      });
    } catch (error) {
      console.error('Error rating workout:', error);
      res.status(500).json({
        error: 'Failed to rate workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/ratings/workouts/:workoutId
   * Get all ratings and reviews for a workout
   */
  static async getWorkoutRatings(req: Request, res: Response): Promise<void> {
    try {
      const { workoutId } = req.params;
      const { includeReviews = 'true' } = req.query;

      // Check if workout exists
      const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
        select: {
          id: true,
          name: true,
          averageRating: true,
          timesCompleted: true
        }
      });

      if (!workout) {
        res.status(404).json({
          error: 'Workout not found',
          message: 'Workout does not exist'
        });
        return;
      }

      // Get rating statistics
      const ratings = await prisma.workoutHistory.findMany({
        where: {
          workoutId,
          completedAt: { not: null },
          userRating: { not: null }
        },
        select: {
          userRating: true,
          perceivedDifficulty: true,
          notes: includeReviews === 'true' ? true : false,
          completedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { completedAt: 'desc' }
      });

      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalDifficulty = 0;
      let difficultyCount = 0;

      ratings.forEach(r => {
        if (r.userRating) {
          distribution[r.userRating as keyof typeof distribution]++;
        }
        if (r.perceivedDifficulty) {
          totalDifficulty += r.perceivedDifficulty;
          difficultyCount++;
        }
      });

      const averageDifficulty = difficultyCount > 0
        ? (totalDifficulty / difficultyCount).toFixed(1)
        : null;

      res.json({
        success: true,
        data: {
          workout: {
            id: workout.id,
            name: workout.name,
            averageRating: workout.averageRating,
            totalRatings: ratings.length,
            timesCompleted: workout.timesCompleted
          },
          statistics: {
            averageDifficulty,
            ratingDistribution: distribution
          },
          reviews: includeReviews === 'true' ? ratings.map(r => ({
            rating: r.userRating,
            difficulty: r.perceivedDifficulty,
            review: r.notes,
            completedAt: r.completedAt,
            user: {
              id: r.user.id,
              name: r.user.firstName || 'Anonymous',
              avatarUrl: r.user.avatarUrl
            }
          })) : undefined
        }
      });
    } catch (error) {
      console.error('Error fetching workout ratings:', error);
      res.status(500).json({
        error: 'Failed to fetch ratings',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/ratings/me
   * Get user's own ratings and reviews
   */
  static async getMyRatings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const ratings = await prisma.workoutHistory.findMany({
        where: {
          userId: req.user.id,
          completedAt: { not: null },
          userRating: { not: null }
        },
        include: {
          workout: {
            select: {
              id: true,
              name: true,
              averageRating: true
            }
          }
        },
        orderBy: { completedAt: 'desc' }
      });

      res.json({
        success: true,
        data: ratings.map(r => ({
          historyId: r.id,
          workoutId: r.workoutId,
          workoutName: r.workout?.name,
          rating: r.userRating,
          difficulty: r.perceivedDifficulty,
          review: r.notes,
          completedAt: r.completedAt
        }))
      });
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      res.status(500).json({
        error: 'Failed to fetch ratings',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/ratings/:historyId
   * Delete a rating/review
   */
  static async deleteRating(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { historyId } = req.params;

      const history = await prisma.workoutHistory.findFirst({
        where: {
          id: historyId,
          userId: req.user.id
        }
      });

      if (!history) {
        res.status(404).json({
          error: 'Not found',
          message: 'Rating not found'
        });
        return;
      }

      // Clear rating fields but keep history entry
      const updated = await prisma.workoutHistory.update({
        where: { id: historyId },
        data: {
          userRating: null,
          perceivedDifficulty: null,
          notes: null
        }
      });

      // Recalculate average rating
      if (history.workoutId) {
        await RatingsController.updateWorkoutAverageRating(history.workoutId);
      }

      res.json({
        success: true,
        message: 'Rating deleted'
      });
    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({
        error: 'Failed to delete rating',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper: Update average rating for a workout
   */
  private static async updateWorkoutAverageRating(workoutId: string): Promise<void> {
    const ratings = await prisma.workoutHistory.findMany({
      where: {
        workoutId,
        userRating: { not: null }
      },
      select: {
        userRating: true
      }
    });

    if (ratings.length === 0) {
      await prisma.workout.update({
        where: { id: workoutId },
        data: { averageRating: null }
      });
      return;
    }

    const sum = ratings.reduce((acc, r) => acc + (r.userRating || 0), 0);
    const average = sum / ratings.length;

    await prisma.workout.update({
      where: { id: workoutId },
      data: { averageRating: average }
    });
  }
}
