import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class WorkoutHistoryController {
  /**
   * POST /api/history
   * Log a completed workout
   */
  static async logWorkout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated to log workouts'
        });
        return;
      }

      const {
        workoutId,
        startedAt,
        completedAt,
        durationSeconds,
        estimatedCaloriesBurned,
        notes,
        workoutSnapshot
      } = req.body;

      // Validate required fields
      if (!workoutId || !startedAt || !workoutSnapshot) {
        res.status(400).json({
          error: 'Missing required field',
          message: 'workoutId, startedAt, and workoutSnapshot are required'
        });
        return;
      }

      // Create workout history entry
      const history = await prisma.workoutHistory.create({
        data: {
          userId: req.user.id,
          workoutId,
          startedAt: new Date(startedAt),
          completedAt: completedAt ? new Date(completedAt) : new Date(),
          durationSeconds: durationSeconds || null,
          estimatedCaloriesBurned: estimatedCaloriesBurned || null,
          notes,
          workoutSnapshot
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

      // Update workout times completed counter
      await prisma.workout.update({
        where: { id: workoutId },
        data: {
          timesCompleted: {
            increment: 1
          }
        }
      });

      res.status(201).json({
        success: true,
        data: history,
        message: 'Workout logged successfully!'
      });
    } catch (error) {
      console.error('Error logging workout:', error);
      res.status(500).json({
        error: 'Failed to log workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/history
   * Get user's workout history
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const {
        limit = '50',
        offset = '0',
        startDate,
        endDate
      } = req.query;

      const where: any = {
        userId: req.user.id
      };

      // Filter by date range if provided
      if (startDate || endDate) {
        where.completedAt = {};
        if (startDate) {
          where.completedAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.completedAt.lte = new Date(endDate as string);
        }
      }

      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;

      const [history, total] = await Promise.all([
        prisma.workoutHistory.findMany({
          where,
          take: limitNum,
          skip: offsetNum,
          include: {
            workout: true
          },
          orderBy: { completedAt: 'desc' }
        }),
        prisma.workoutHistory.count({ where })
      ]);

      res.json({
        success: true,
        data: history,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        }
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({
        error: 'Failed to fetch history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/history/stats
   * Get user's workout statistics
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { period = '30' } = req.query; // days
      const periodDays = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Get workout history for period
      const history = await prisma.workoutHistory.findMany({
        where: {
          userId: req.user.id,
          completedAt: {
            gte: startDate
          }
        },
        include: {
          workout: true
        }
      });

      // Calculate statistics
      const totalWorkouts = history.length;
      const totalSeconds = history.reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
      const totalMinutes = Math.round(totalSeconds / 60);
      const totalCalories = history.reduce((sum, h) => sum + (Number(h.estimatedCaloriesBurned) || 0), 0);

      // Calculate streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const sortedDates = history
        .filter(h => h.completedAt !== null)
        .map(h => h.completedAt!.toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const today = new Date().toDateString();
      if (sortedDates.length > 0 && sortedDates[0] === today) {
        currentStreak = 1;
        tempStreak = 1;
      }

      for (let i = 0; i < sortedDates.length - 1; i++) {
        const current = new Date(sortedDates[i]);
        const next = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (i === 0 || sortedDates[0] === today) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      res.json({
        success: true,
        data: {
          period: `${periodDays} days`,
          totalWorkouts,
          totalMinutes,
          totalCalories: Math.round(totalCalories),
          averageMinutesPerWorkout: totalWorkouts > 0 ?
            Math.round(totalMinutes / totalWorkouts) : 0,
          currentStreak,
          longestStreak
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/history/:id
   * Get single workout history entry
   */
  static async getHistoryEntry(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { id } = req.params;

      const history = await prisma.workoutHistory.findUnique({
        where: { id },
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

      if (!history) {
        res.status(404).json({
          error: 'Not found',
          message: 'Workout history entry not found'
        });
        return;
      }

      // Verify ownership
      if (history.userId !== req.user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have access to this workout history'
        });
        return;
      }

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error fetching history entry:', error);
      res.status(500).json({
        error: 'Failed to fetch history entry',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
