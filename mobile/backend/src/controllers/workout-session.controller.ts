import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class WorkoutSessionController {
  /**
   * POST /api/sessions/start
   * Start a new workout session
   */
  static async startSession(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { workoutId } = req.body;

      // Get workout with full structure
      const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
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
          }
        }
      });

      if (!workout) {
        res.status(404).json({
          error: 'Workout not found',
          message: 'Workout does not exist'
        });
        return;
      }

      // Ensure user exists in database (create if not exists)
      await prisma.user.upsert({
        where: { id: req.user.id },
        update: {},
        create: {
          id: req.user.id,
          email: req.user.email || '',
          authProvider: 'supabase',
          firstName: null,
          lastName: null
        }
      });

      // Create workout history entry
      const session = await prisma.workoutHistory.create({
        data: {
          userId: req.user.id,
          workoutId,
          workoutSnapshot: JSON.parse(JSON.stringify(workout)), // Deep clone
          startedAt: new Date(),
          circuitsCompleted: 0,
          totalExercisesCompleted: 0,
          completionPercentage: 0
        }
      });

      // Calculate total exercises for progress tracking
      const totalExercises = workout.circuits.reduce(
        (sum, circuit) => sum + circuit.exercises.length * (circuit.sets || workout.setsPerCircuit),
        0
      );

      res.status(201).json({
        success: true,
        message: 'Workout session started',
        data: {
          sessionId: session.id,
          workout: {
            id: workout.id,
            name: workout.name,
            totalCircuits: workout.totalCircuits,
            setsPerCircuit: workout.setsPerCircuit,
            intervalSeconds: workout.intervalSeconds,
            restSeconds: workout.restSeconds,
            totalExercises
          },
          circuits: workout.circuits.map(circuit => ({
            id: circuit.id,
            order: circuit.circuitOrder,
            exercises: circuit.exercises.map(ex => ({
              id: ex.id,
              exerciseId: ex.exerciseId,
              order: ex.exerciseOrder,
              name: ex.exercise.name,
              reps: ex.reps || ex.exercise.defaultReps,
              durationSeconds: ex.durationSeconds || ex.exercise.defaultDurationSeconds,
              instructions: ex.exercise.instructions
            }))
          })),
          startedAt: session.startedAt
        }
      });
    } catch (error) {
      console.error('Error starting workout session:', error);
      res.status(500).json({
        error: 'Failed to start session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/sessions/:sessionId
   * Get current session state
   */
  static async getSession(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { sessionId } = req.params;

      const session = await prisma.workoutHistory.findFirst({
        where: {
          id: sessionId,
          userId: req.user.id
        }
      });

      if (!session) {
        res.status(404).json({
          error: 'Session not found',
          message: 'Workout session not found'
        });
        return;
      }

      // Calculate elapsed time
      const elapsedSeconds = session.completedAt
        ? session.durationSeconds
        : Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          workoutId: session.workoutId,
          workoutSnapshot: session.workoutSnapshot,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          elapsedSeconds,
          circuitsCompleted: session.circuitsCompleted,
          totalExercisesCompleted: session.totalExercisesCompleted,
          completionPercentage: session.completionPercentage,
          isActive: !session.completedAt
        }
      });
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({
        error: 'Failed to fetch session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PATCH /api/sessions/:sessionId/progress
   * Update session progress
   */
  static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { sessionId } = req.params;
      const {
        circuitsCompleted,
        totalExercisesCompleted,
        completionPercentage
      } = req.body;

      const session = await prisma.workoutHistory.findFirst({
        where: {
          id: sessionId,
          userId: req.user.id
        }
      });

      if (!session) {
        res.status(404).json({
          error: 'Session not found',
          message: 'Workout session not found'
        });
        return;
      }

      if (session.completedAt) {
        res.status(400).json({
          error: 'Session already completed',
          message: 'Cannot update a completed session'
        });
        return;
      }

      const updated = await prisma.workoutHistory.update({
        where: { id: sessionId },
        data: {
          circuitsCompleted,
          totalExercisesCompleted,
          completionPercentage
        }
      });

      res.json({
        success: true,
        message: 'Progress updated',
        data: updated
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({
        error: 'Failed to update progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/sessions/:sessionId/complete
   * Complete a workout session
   */
  static async completeSession(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { sessionId } = req.params;
      const {
        circuitsCompleted,
        totalExercisesCompleted,
        completionPercentage,
        estimatedCaloriesBurned,
        perceivedDifficulty,
        notes
      } = req.body;

      const session = await prisma.workoutHistory.findFirst({
        where: {
          id: sessionId,
          userId: req.user.id
        }
      });

      if (!session) {
        res.status(404).json({
          error: 'Session not found',
          message: 'Workout session not found'
        });
        return;
      }

      if (session.completedAt) {
        res.status(400).json({
          error: 'Session already completed',
          message: 'This session has already been completed'
        });
        return;
      }

      const completedAt = new Date();
      const durationSeconds = Math.floor((completedAt.getTime() - session.startedAt.getTime()) / 1000);

      const updated = await prisma.workoutHistory.update({
        where: { id: sessionId },
        data: {
          completedAt,
          durationSeconds,
          circuitsCompleted,
          totalExercisesCompleted,
          completionPercentage,
          estimatedCaloriesBurned,
          perceivedDifficulty,
          notes
        }
      });

      // Increment workout completion count
      if (session.workoutId) {
        await prisma.workout.update({
          where: { id: session.workoutId },
          data: {
            timesCompleted: { increment: 1 }
          }
        });
      }

      res.json({
        success: true,
        message: 'Workout completed! Great job!',
        data: {
          sessionId: updated.id,
          durationSeconds,
          completionPercentage: updated.completionPercentage,
          estimatedCaloriesBurned: updated.estimatedCaloriesBurned
        }
      });
    } catch (error) {
      console.error('Error completing session:', error);
      res.status(500).json({
        error: 'Failed to complete session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/sessions/:sessionId
   * Cancel/delete a workout session
   */
  static async cancelSession(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const { sessionId } = req.params;

      const session = await prisma.workoutHistory.findFirst({
        where: {
          id: sessionId,
          userId: req.user.id
        }
      });

      if (!session) {
        res.status(404).json({
          error: 'Session not found',
          message: 'Workout session not found'
        });
        return;
      }

      await prisma.workoutHistory.delete({
        where: { id: sessionId }
      });

      res.json({
        success: true,
        message: 'Session cancelled'
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      res.status(500).json({
        error: 'Failed to cancel session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/sessions/active
   * Get user's active (uncompleted) sessions
   */
  static async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
        return;
      }

      const sessions = await prisma.workoutHistory.findMany({
        where: {
          userId: req.user.id,
          completedAt: null
        },
        include: {
          workout: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { startedAt: 'desc' }
      });

      res.json({
        success: true,
        data: sessions.map(s => ({
          sessionId: s.id,
          workoutId: s.workoutId,
          workoutName: s.workout?.name,
          startedAt: s.startedAt,
          elapsedSeconds: Math.floor((Date.now() - s.startedAt.getTime()) / 1000),
          completionPercentage: s.completionPercentage
        }))
      });
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      res.status(500).json({
        error: 'Failed to fetch active sessions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
