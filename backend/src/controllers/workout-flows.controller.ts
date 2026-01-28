import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { WorkoutGeneratorService } from '../services/workout-generator.service';
import { WorkoutConstraints } from '../types/workout.types';
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
   * @deprecated This endpoint is no longer used by the mobile app.
   * Kept for backward compatibility with potential external integrations.
   *
   * POST /api/flows/jump-right-in
   * "Jump Right In" flow - instant workout generation with smart defaults
   *
   * Uses user preferences if authenticated, otherwise uses sensible defaults
   * Minimal input required - just start working out!
   */
  static async jumpRightIn(req: Request, res: Response): Promise<void> {
    try {
      // Get user preferences if authenticated
      let preferences = null;
      if (req.user) {
        preferences = await prisma.userPreference.findUnique({
          where: { userId: req.user.id }
        });
      }

      // Determine default objective (Fat Burn as default)
      const objectiveSlug = 'fat-burn-weight-loss';

      // Fetch objective
      const objective = await prisma.workoutObjective.findUnique({
        where: { slug: objectiveSlug }
      });

      if (!objective) {
        res.status(404).json({
          error: 'Objective not found',
          message: 'Default workout objective not available'
        });
        return;
      }

      // Build constraints from preferences or defaults
      const constraints: WorkoutConstraints = {
        difficulty: 'intermediate',
        availableEquipment: ['bodyweight'],
        smallSpace: true,
        quiet: true,
        durationMinutes: 20,
        circuits: preferences?.defaultCircuits,
        intervalSeconds: preferences?.defaultIntervalSeconds,
        restSeconds: preferences?.defaultRestSeconds,
        sets: preferences?.defaultSets,
      };

      // Generate workout
      const result = await WorkoutGeneratorService.generateWorkout({
        objectiveId: objective.id,
        constraints,
        userId: req.user?.id
      });

      // Save workout to database
      const savedWorkout = await WorkoutFlowsController.saveGeneratedWorkout(
        result,
        objective.id,
        req.user?.id
      );

      res.json({
        success: true,
        flow: 'jump-right-in',
        data: savedWorkout,
        message: 'Your instant workout is ready! Let\'s get started.'
      });
    } catch (error) {
      console.error('Error in Jump Right In flow:', error);

      if (isUniqueConstraintError(error)) {
        res.status(409).json({
          error: 'Duplicate workout name',
          message: 'You already have a workout with this name. Please use a different name.'
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to generate workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * @deprecated This endpoint is no longer used by the mobile app.
   * Kept for backward compatibility with potential external integrations.
   *
   * POST /api/flows/let-us-curate
   * "Let Us Curate" flow - objective-based workout generation
   *
   * User selects workout objective and optionally customizes preferences
   * We curate the perfect workout for their goal
   */
  static async letUsCurate(req: Request, res: Response): Promise<void> {
    try {
      const { objectiveId, objectiveSlug, customConstraints } = req.body;

      // Fetch objective by ID or slug
      let objective;
      if (objectiveId) {
        objective = await prisma.workoutObjective.findUnique({
          where: { id: objectiveId }
        });
      } else if (objectiveSlug) {
        objective = await prisma.workoutObjective.findUnique({
          where: { slug: objectiveSlug }
        });
      } else {
        res.status(400).json({
          error: 'Missing required field',
          message: 'Either objectiveId or objectiveSlug is required'
        });
        return;
      }

      if (!objective) {
        res.status(404).json({
          error: 'Objective not found',
          message: 'Workout objective not found'
        });
        return;
      }

      // Get user preferences if authenticated
      let preferences = null;
      if (req.user) {
        preferences = await prisma.userPreference.findUnique({
          where: { userId: req.user.id }
        });
      }

      // Build constraints: custom > preferences > defaults
      const constraints: WorkoutConstraints = {
        difficulty: customConstraints?.difficulty || 'intermediate',
        availableEquipment: customConstraints?.availableEquipment || ['bodyweight'],
        smallSpace: customConstraints?.smallSpace ?? true,
        quiet: customConstraints?.quiet ?? true,
        durationMinutes: customConstraints?.durationMinutes ||
                        objective.recommendedDurationMinutes,
        circuits: customConstraints?.circuits ?? preferences?.defaultCircuits,
        exercisesPerCircuit: customConstraints?.exercisesPerCircuit,
        intervalSeconds: customConstraints?.intervalSeconds ?? preferences?.defaultIntervalSeconds,
        restSeconds: customConstraints?.restSeconds ?? preferences?.defaultRestSeconds,
        sets: customConstraints?.sets ?? preferences?.defaultSets,
      };

      // Generate curated workout
      const result = await WorkoutGeneratorService.generateWorkout({
        objectiveId: objective.id,
        constraints,
        userId: req.user?.id
      });

      // Save workout to database
      const savedWorkout = await WorkoutFlowsController.saveGeneratedWorkout(
        result,
        objective.id,
        req.user?.id
      );

      res.json({
        success: true,
        flow: 'let-us-curate',
        data: savedWorkout,
        message: `We've curated the perfect ${objective.name.toLowerCase()} workout for you!`
      });
    } catch (error) {
      console.error('Error in Let Us Curate flow:', error);

      if (isUniqueConstraintError(error)) {
        res.status(409).json({
          error: 'Duplicate workout name',
          message: 'You already have a workout with this name. Please use a different name.'
        });
        return;
      }

      res.status(500).json({
        error: 'Failed to curate workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

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
        description,
        objectiveId,
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
          description,
          difficultyLevel: inferredDifficulty,
          estimatedDurationMinutes: durationMinutes,
          totalCircuits,
          exercisesPerCircuit,
          intervalSeconds,
          restSeconds,
          setsPerCircuit,
          isPublic: false,
          createdBy: req.user?.id || null,
          primaryObjectiveId: objectiveId || null
        }
      });

      // Create objective mapping if provided
      if (objectiveId) {
        await prisma.workoutObjectiveMapping.create({
          data: {
            workoutId: workout.id,
            objectiveId
          }
        });
      }

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

  /**
   * Helper: Save generated workout to database
   */
  private static async saveGeneratedWorkout(
    result: any,
    objectiveId: string,
    userId?: string
  ) {
    const { workout, metadata } = result;

    // Ensure user exists in database if userId provided
    if (userId) {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: '', // Will be filled by user sync
          authProvider: 'supabase',
          firstName: null,
          lastName: null
        }
      });
    }

    // Calculate equipment required from circuits
    const equipmentSet = new Set<string>();
    workout.circuits.forEach((circuit: any) => {
      circuit.exercises.forEach((ex: any) => {
        // Equipment will be fetched from exercise relation
      });
    });

    // Create workout with user association
    const savedWorkout = await prisma.workout.create({
      data: {
        name: workout.name,
        description: workout.description,
        difficultyLevel: workout.difficulty,
        estimatedDurationMinutes: workout.totalDurationMinutes,
        estimatedCalories: workout.estimatedCalories,
        totalCircuits: workout.circuits.length,
        exercisesPerCircuit: workout.circuits[0]?.exercises?.length || 0,
        intervalSeconds: workout.circuits[0]?.exercises?.[0]?.durationSeconds || 30,
        restSeconds: workout.circuits[0]?.exercises?.[0]?.restAfterSeconds || 30,
        setsPerCircuit: workout.circuits[0]?.sets || 3,
        isPublic: false,
        primaryObjectiveId: objectiveId,
        createdBy: userId || null
      }
    });

    // Create workout-objective mapping
    await prisma.workoutObjectiveMapping.create({
      data: {
        workoutId: savedWorkout.id,
        objectiveId
      }
    });

    // Create circuits
    for (const circuitData of workout.circuits) {
      const circuit = await prisma.circuit.create({
        data: {
          workoutId: savedWorkout.id,
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
      where: { id: savedWorkout.id },
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

    return completeWorkout;
  }
}
