import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { WorkoutGeneratorService } from '../services/workout-generator.service';
import { WorkoutGenerationRequest } from '../types/workout.types';

export class WorkoutsController {
  /**
   * POST /api/workouts/generate
   * Generate a workout based on objective and constraints
   */
  static async generateWorkout(req: Request, res: Response): Promise<void> {
    try {
      const request: WorkoutGenerationRequest = {
        objectiveId: req.body.objectiveId,
        constraints: req.body.constraints,
        userId: req.body.userId // Optional for now
      };

      // Validate required fields
      if (!request.objectiveId) {
        res.status(400).json({
          error: 'Missing required field',
          message: 'objectiveId is required'
        });
        return;
      }

      // Generate workout
      const result = await WorkoutGeneratorService.generateWorkout(request);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error generating workout:', error);
      res.status(500).json({
        error: 'Failed to generate workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/workouts
   * Save a generated workout to the database
   */
  static async createWorkout(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        description,
        objectiveId,
        difficulty,
        durationMinutes,
        circuits,
        isPublic = false,
        userId
      } = req.body;

      // Validate required fields
      if (!name || !objectiveId || !circuits || circuits.length === 0) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'name, objectiveId, and circuits are required'
        });
        return;
      }

      // Calculate workout structure metadata
      const totalCircuits = circuits.length;
      const exercisesPerCircuit = circuits[0]?.exercises?.length || 0;
      const intervalSeconds = circuits[0]?.exercises?.[0]?.durationSeconds || 30;
      const restSeconds = circuits[0]?.exercises?.[0]?.restAfterSeconds || 30;
      const setsPerCircuit = circuits[0]?.sets || 3;

      // Create workout
      const workout = await prisma.workout.create({
        data: {
          name,
          description,
          difficultyLevel: difficulty || 'intermediate',
          estimatedDurationMinutes: durationMinutes || 20,
          totalCircuits,
          exercisesPerCircuit,
          intervalSeconds,
          restSeconds,
          setsPerCircuit,
          isPublic,
          createdBy: userId || null,
          primaryObjectiveId: objectiveId
        }
      });

      // Create workout-objective mapping
      await prisma.workoutObjectiveMapping.create({
        data: {
          workoutId: workout.id,
          objectiveId
        }
      });

      // Create circuits
      for (const circuitData of circuits) {
        const circuit = await prisma.circuit.create({
          data: {
            workoutId: workout.id,
            circuitOrder: circuitData.circuitNumber,
            sets: circuitData.sets,
            intervalSeconds: circuitData.exercises?.[0]?.durationSeconds,
            restSeconds: circuitData.restBetweenSetsSeconds
          }
        });

        // Create circuit exercises
        for (let i = 0; i < circuitData.exercises.length; i++) {
          const exercise = circuitData.exercises[i];
          await prisma.circuitExercise.create({
            data: {
              circuitId: circuit.id,
              exerciseId: exercise.exerciseId,
              exerciseOrder: i,
              durationSeconds: exercise.durationSeconds || null,
              reps: exercise.reps || null
            }
          });
        }
      }

      // Fetch complete workout with relations
      const completeWorkout = await prisma.workout.findUnique({
        where: { id: workout.id },
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
      });

      res.status(201).json({
        success: true,
        data: completeWorkout
      });
    } catch (error) {
      console.error('Error creating workout:', error);
      res.status(500).json({
        error: 'Failed to create workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/workouts
   * List all workouts (with optional filtering)
   */
  static async listWorkouts(req: Request, res: Response): Promise<void> {
    try {
      const {
        difficulty,
        objectiveId,
        isPublic,
        userId,
        limit = '50',
        offset = '0'
      } = req.query;

      const where: any = {
        deletedAt: null
      };

      if (difficulty) {
        where.difficultyLevel = difficulty;
      }

      if (isPublic !== undefined) {
        where.isPublic = isPublic === 'true';
      }

      if (userId) {
        where.creatorId = userId;
      }

      // If filtering by objective, use relation
      if (objectiveId) {
        where.objectives = {
          some: {
            objectiveId: objectiveId as string
          }
        };
      }

      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;

      const [workouts, total] = await Promise.all([
        prisma.workout.findMany({
          where,
          take: limitNum,
          skip: offsetNum,
          include: {
            circuits: {
              include: {
                exercises: {
                  include: {
                    exercise: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        primaryCategory: true,
                        difficulty: true
                      }
                    }
                  },
                  orderBy: { exerciseOrder: 'asc' }
                }
              },
              orderBy: { circuitOrder: 'asc' }
            },
            objectiveMappings: {
              include: {
                objective: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    colorHex: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.workout.count({ where })
      ]);

      res.json({
        success: true,
        data: workouts,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        }
      });
    } catch (error) {
      console.error('Error listing workouts:', error);
      res.status(500).json({
        error: 'Failed to list workouts',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/workouts/:id
   * Get a single workout by ID
   */
  static async getWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const workout = await prisma.workout.findUnique({
        where: { id },
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
      });

      if (!workout) {
        res.status(404).json({
          error: 'Workout not found',
          message: `No workout found with ID: ${id}`
        });
        return;
      }

      res.json({
        success: true,
        data: workout
      });
    } catch (error) {
      console.error('Error fetching workout:', error);
      res.status(500).json({
        error: 'Failed to fetch workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/workouts/:id
   * Update a workout
   */
  static async updateWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, difficulty, durationMinutes, isPublic } = req.body;

      // Check if workout exists
      const existing = await prisma.workout.findUnique({
        where: { id }
      });

      if (!existing) {
        res.status(404).json({
          error: 'Workout not found',
          message: `No workout found with ID: ${id}`
        });
        return;
      }

      // Update workout
      const updated = await prisma.workout.update({
        where: { id },
        data: {
          name,
          description,
          difficultyLevel: difficulty,
          estimatedDurationMinutes: durationMinutes,
          isPublic
        },
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
      });

      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      res.status(500).json({
        error: 'Failed to update workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/workouts/:id
   * Delete a workout (soft delete)
   */
  static async deleteWorkout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if workout exists
      const existing = await prisma.workout.findUnique({
        where: { id }
      });

      if (!existing) {
        res.status(404).json({
          error: 'Workout not found',
          message: `No workout found with ID: ${id}`
        });
        return;
      }

      // Soft delete
      await prisma.workout.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Workout deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting workout:', error);
      res.status(500).json({
        error: 'Failed to delete workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
