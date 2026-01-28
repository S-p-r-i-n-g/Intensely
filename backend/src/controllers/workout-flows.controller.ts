import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Helper function to check if error is a unique constraint violation
 */
function isUniqueConstraintError(error: any): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Map exercise difficulty string to numeric value (1-3 scale per design.md v1.3)
 */
function difficultyToNumber(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 2;
    case 'advanced':
      return 3;
    default:
      return 2; // Default to intermediate
  }
}

/**
 * Infer workout difficulty using design.md v1.3 formula:
 * Final Score = Volume Score × Intensity Multiplier × Exercise Multiplier
 *
 * - Volume Score = (Total Exercises × Circuits × Sets) / 10
 * - Intensity Multiplier = Work Interval / Rest Interval
 * - Exercise Multiplier = Average of exercise difficulty values (1-3 scale)
 *
 * Categories: Beginner < 5, Intermediate 5-12, Advanced > 12
 */
function inferDifficultyLevel(
  totalExercises: number,
  circuits: number,
  sets: number,
  work: number,
  rest: number,
  exerciseDifficulties?: string[]
): DifficultyLevel {
  // Volume Score = (Total Exercises × Circuits × Sets) / 10
  const volumeScore = (totalExercises * circuits * sets) / 10;

  // Intensity Multiplier = Work Interval / Rest Interval
  const intensityMultiplier = rest > 0 ? work / rest : 1;

  // Exercise Multiplier = average difficulty (1-3 scale)
  let exerciseMultiplier = 1.5; // Default per design.md v1.3
  if (exerciseDifficulties && exerciseDifficulties.length > 0) {
    const numericValues = exerciseDifficulties.map(d => difficultyToNumber(d));
    exerciseMultiplier = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
  }

  // Final Score = Volume × Intensity × Exercise
  const score = volumeScore * intensityMultiplier * exerciseMultiplier;

  // Categories from design.md v1.3:
  // Beginner: < 5, Intermediate: 5-12, Advanced: > 12
  if (score > 12) return 'advanced';
  if (score >= 5) return 'intermediate';
  return 'beginner';
}

export class WorkoutFlowsController {
  /**
   * POST /api/flows/take-the-wheel
   * "Take the Wheel" flow - custom workout building
   *
   * User has full control over workout structure and exercise selection
   * Validates the workout but lets user decide everything
   */
  static async takeTheWheel(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        difficulty,
        circuits
      } = req.body;

      // Validate required fields
      if (!name || !circuits || circuits.length === 0) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'name and circuits are required for custom workouts'
        });
        return;
      }

      // Validate circuits structure
      for (const circuit of circuits) {
        if (!circuit.exercises || circuit.exercises.length === 0) {
          res.status(400).json({
            error: 'Invalid circuit structure',
            message: 'Each circuit must have at least one exercise'
          });
          return;
        }
      }

      // Calculate workout metadata
      const totalCircuits = circuits.length;
      const exercisesPerCircuit = circuits[0]?.exercises?.length || 0;
      const intervalSeconds = circuits[0]?.intervalSeconds || circuits[0]?.exercises?.[0]?.durationSeconds || 30;
      const restSeconds = circuits[0]?.restSeconds || circuits[0]?.exercises?.[0]?.restAfterSeconds || 60;
      const setsPerCircuit = circuits[0]?.sets || 3;

      // Calculate duration
      let totalSeconds = 0;
      circuits.forEach((circuit: any) => {
        const exerciseTime = circuit.exercises.reduce((sum: number, ex: any) => {
          return sum + (circuit.intervalSeconds || ex.durationSeconds || 30) + (circuit.restSeconds || ex.restAfterSeconds || 60);
        }, 0);
        totalSeconds += exerciseTime * (circuit.sets || 3);
      });
      const durationMinutes = Math.ceil(totalSeconds / 60);

      // Collect all unique exercise IDs to fetch their difficulties
      const allExerciseIds = new Set<string>();
      circuits.forEach((circuit: any) => {
        circuit.exercises.forEach((exerciseId: any) => {
          const actualId = typeof exerciseId === 'string' ? exerciseId : exerciseId.exerciseId;
          allExerciseIds.add(actualId);
        });
      });
      const totalExercises = allExerciseIds.size;

      // Fetch exercises to get their difficulty levels
      const exercises = await prisma.exercise.findMany({
        where: { id: { in: Array.from(allExerciseIds) } },
        select: { id: true, difficulty: true }
      });

      const exerciseDifficulties = exercises.map(ex => ex.difficulty);

      // Infer difficulty using design.md v1.3 formula
      const inferredDifficulty = difficulty || inferDifficultyLevel(
        totalExercises,
        totalCircuits,
        setsPerCircuit,
        intervalSeconds,
        restSeconds,
        exerciseDifficulties
      );

      // Ensure user exists in database if authenticated
      if (req.user) {
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
      }

      // Create workout
      const workout = await prisma.workout.create({
        data: {
          name,
          difficultyLevel: inferredDifficulty,
          estimatedDurationMinutes: durationMinutes,
          totalCircuits,
          exercisesPerCircuit,
          intervalSeconds,
          restSeconds,
          setsPerCircuit,
          isPublic: false,
          createdBy: req.user?.id || null
        }
      });

      // Create circuits and exercises
      for (const circuitData of circuits) {
        const circuit = await prisma.circuit.create({
          data: {
            workoutId: workout.id,
            circuitOrder: circuitData.circuitNumber || circuits.indexOf(circuitData),
            sets: circuitData.sets || 3,
            intervalSeconds: circuitData.intervalSeconds || null,
            restSeconds: circuitData.restSeconds || circuitData.restBetweenSetsSeconds || 60
          }
        });

        // Create circuit exercises
        for (let i = 0; i < circuitData.exercises.length; i++) {
          const exerciseId = circuitData.exercises[i];
          // exerciseId is either a string ID or an object with exerciseId property
          const actualExerciseId = typeof exerciseId === 'string' ? exerciseId : exerciseId.exerciseId;

          await prisma.circuitExercise.create({
            data: {
              circuitId: circuit.id,
              exerciseId: actualExerciseId,
              exerciseOrder: i,
              durationSeconds: circuitData.intervalSeconds || null,
              reps: null
            }
          });
        }
      }

      // Fetch complete workout
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
          }
        }
      });

      res.status(201).json({
        success: true,
        flow: 'take-the-wheel',
        data: completeWorkout,
        message: 'Your custom workout has been created!'
      });
    } catch (error) {
      console.error('Error in Take the Wheel flow:', error);

      if (isUniqueConstraintError(error)) {
        res.status(409).json({
          error: 'Duplicate workout name',
          message: 'You already have a workout with this name. Please use a different name.'
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to create custom workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
