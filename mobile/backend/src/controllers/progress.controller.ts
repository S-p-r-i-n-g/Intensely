import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ProgressController {
  /**
   * POST /api/progress/exercises/:exerciseId
   * Log exercise progress (PR, volume, etc.)
   */
  static async logExerciseProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { exerciseId } = req.params;
      const {
        maxReps,
        maxDurationSeconds,
        maxWeight,
        notes,
        achievedAt
      } = req.body;

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

      // Get or create progress record
      const existing = await prisma.userExerciseProgress.findUnique({
        where: {
          userId_exerciseId: {
            userId: req.user.id,
            exerciseId
          }
        }
      });

      let progress;
      let isNewPR = false;

      if (existing) {
        // Check if new values are personal records
        const updates: any = {};

        if (maxReps !== undefined && (!existing.maxReps || maxReps > existing.maxReps)) {
          updates.maxReps = maxReps;
          isNewPR = true;
        }

        if (maxDurationSeconds !== undefined &&
            (!existing.maxDurationSeconds || maxDurationSeconds > existing.maxDurationSeconds)) {
          updates.maxDurationSeconds = maxDurationSeconds;
          isNewPR = true;
        }

        if (maxWeight !== undefined && (!existing.maxWeightKg || maxWeight > Number(existing.maxWeightKg))) {
          updates.maxWeightKg = maxWeight;
          isNewPR = true;
        }

        if (notes) {
          updates.notes = notes;
        }

        updates.timesPerformed = existing.timesPerformed + 1;

        progress = await prisma.userExerciseProgress.update({
          where: {
            userId_exerciseId: {
              userId: req.user.id,
              exerciseId
            }
          },
          data: updates,
          include: {
            exercise: true
          }
        });
      } else {
        // Create new progress record
        progress = await prisma.userExerciseProgress.create({
          data: {
            userId: req.user.id,
            exerciseId,
            maxReps: maxReps || null,
            maxDurationSeconds: maxDurationSeconds || null,
            maxWeightKg: maxWeight || null,
            notes,
            timesPerformed: 1
          },
          include: {
            exercise: true
          }
        });
        isNewPR = true;
      }

      res.status(isNewPR ? 201 : 200).json({
        success: true,
        isNewPR,
        message: isNewPR ? '🎉 New personal record!' : 'Progress logged',
        data: progress
      });
    } catch (error) {
      console.error('Error logging exercise progress:', error);
      res.status(500).json({
        error: 'Failed to log progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/progress/exercises/:exerciseId
   * Get user's progress for specific exercise
   */
  static async getExerciseProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { exerciseId } = req.params;

      const progress = await prisma.userExerciseProgress.findUnique({
        where: {
          userId_exerciseId: {
            userId: req.user.id,
            exerciseId
          }
        },
        include: {
          exercise: true
        }
      });

      if (!progress) {
        res.status(404).json({
          error: 'No progress found',
          message: 'No progress recorded for this exercise'
        });
        return;
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      res.status(500).json({
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/progress/exercises
   * Get all exercise progress for user
   */
  static async getAllProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { sortBy = 'updatedAt', order = 'desc' } = req.query;

      const progress = await prisma.userExerciseProgress.findMany({
        where: { userId: req.user.id },
        include: {
          exercise: true
        },
        orderBy: {
          [sortBy as string]: order
        }
      });

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Error fetching all progress:', error);
      res.status(500).json({
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/progress/summary
   * Get summary of user's progress
   */
  static async getProgressSummary(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const progress = await prisma.userExerciseProgress.findMany({
        where: { userId: req.user.id },
        include: {
          exercise: true
        }
      });

      // Calculate summary statistics
      const totalExercisesTracked = progress.length;
      const totalPerformances = progress.reduce((sum, p) => sum + p.timesPerformed, 0);

      // Recent improvements (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentImprovements = progress.filter(p =>
        p.updatedAt && p.updatedAt >= thirtyDaysAgo
      ).length;

      // Top exercises by performance count
      const topExercises = progress
        .sort((a, b) => b.timesPerformed - a.timesPerformed)
        .slice(0, 5)
        .map(p => ({
          exerciseName: p.exercise.name,
          timesPerformed: p.timesPerformed,
          maxReps: p.maxReps,
          maxDurationSeconds: p.maxDurationSeconds
        }));

      res.json({
        success: true,
        data: {
          totalExercisesTracked,
          totalPerformances,
          recentImprovements,
          topExercises
        }
      });
    } catch (error) {
      console.error('Error fetching progress summary:', error);
      res.status(500).json({
        error: 'Failed to fetch summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/progress/exercises/:exerciseId
   * Delete exercise progress record
   */
  static async deleteExerciseProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { exerciseId } = req.params;

      const deleted = await prisma.userExerciseProgress.deleteMany({
        where: {
          userId: req.user.id,
          exerciseId
        }
      });

      if (deleted.count === 0) {
        res.status(404).json({
          error: 'Not found',
          message: 'No progress record found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Progress record deleted'
      });
    } catch (error) {
      console.error('Error deleting progress:', error);
      res.status(500).json({
        error: 'Failed to delete progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
