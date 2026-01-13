import { prisma } from '../lib/prisma';
import {
  WorkoutConstraints,
  WorkoutGenerationRequest,
  WorkoutGenerationResult,
  CircuitDefinition,
  ExerciseSelection,
  MuscleGroupBalance,
  ExercisePool
} from '../types/workout.types';

export class WorkoutGeneratorService {
  /**
   * Generate a workout based on objective and constraints
   */
  static async generateWorkout(
    request: WorkoutGenerationRequest
  ): Promise<WorkoutGenerationResult> {
    // 1. Fetch the workout objective
    const objective = await prisma.workoutObjective.findUnique({
      where: { id: request.objectiveId }
    });

    if (!objective) {
      throw new Error('Workout objective not found');
    }

    // 2. Build exercise pool based on constraints
    const exercisePool = await this.buildExercisePool(objective, request.constraints);

    if (exercisePool.all.length === 0) {
      throw new Error('No exercises found matching the given constraints');
    }

    // 3. Determine workout structure (use objective defaults or constraints)
    const structure = this.determineWorkoutStructure(objective, request.constraints);

    // 4. Select exercises for each circuit with balancing
    const circuits = await this.selectExercisesForCircuits(
      exercisePool,
      structure,
      objective
    );

    // 5. Calculate workout metadata
    const metadata = this.calculateMetadata(circuits);

    // 6. Calculate total duration and calories
    const totalDurationMinutes = this.calculateTotalDuration(circuits, structure);
    const estimatedCalories = this.estimateCalories(
      totalDurationMinutes,
      objective.intensityPercentage
    );

    // Generate unique name with date/time for auto-generated workouts
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const uniqueName = `${objective.name} Workout - ${dateStr} ${timeStr}`;

    return {
      workout: {
        name: uniqueName,
        description: objective.description,
        objectiveId: objective.id,
        circuits,
        totalDurationMinutes,
        estimatedCalories,
        difficulty: request.constraints?.difficulty || 'intermediate'
      },
      metadata
    };
  }

  /**
   * Build exercise pool based on objective and constraints
   */
  private static async buildExercisePool(
    objective: any,
    constraints?: WorkoutConstraints
  ): Promise<ExercisePool> {
    // Build where clause for exercise filtering
    const where: any = {
      hictSuitable: true,
      deletedAt: null
    };

    // Apply constraints
    if (constraints?.difficulty) {
      where.difficulty = constraints.difficulty;
    }

    if (constraints?.smallSpace) {
      where.smallSpace = true;
    }

    if (constraints?.quiet) {
      where.quiet = true;
    }

    // Note: Equipment filtering skipped for now
    // All exercises in database are bodyweight-friendly
    // Can be implemented with raw SQL or post-query filtering if needed

    if (constraints?.excludedExercises && constraints.excludedExercises.length > 0) {
      where.id = {
        notIn: constraints.excludedExercises
      };
    }

    // Fetch all matching exercises
    const allExercises = await prisma.exercise.findMany({
      where,
      orderBy: { popularityScore: 'desc' }
    });

    // Categorize by priority based on objective preferences
    const preferredCategories = objective.preferredCategories as any;
    const high: any[] = [];
    const medium: any[] = [];
    const low: any[] = [];

    allExercises.forEach(exercise => {
      const category = exercise.primaryCategory;

      if (preferredCategories.high && preferredCategories.high.includes(category)) {
        high.push(exercise);
      } else if (preferredCategories.medium && preferredCategories.medium.includes(category)) {
        medium.push(exercise);
      } else if (preferredCategories.low && preferredCategories.low.includes(category)) {
        low.push(exercise);
      } else {
        low.push(exercise);
      }
    });

    // If user specified included exercises, move them to high priority
    if (constraints?.includedExercises && constraints.includedExercises.length > 0) {
      const included = allExercises.filter(ex =>
        constraints.includedExercises!.includes(ex.id)
      );
      included.forEach(ex => {
        if (!high.find(e => e.id === ex.id)) {
          high.unshift(ex);
        }
      });
    }

    return {
      high,
      medium,
      low,
      all: allExercises
    };
  }

  /**
   * Determine workout structure from objective and constraints
   */
  private static determineWorkoutStructure(
    objective: any,
    constraints?: WorkoutConstraints
  ) {
    // Default structure: 3x3x20+60x3
    // (3 circuits, 3 exercises per circuit, 20s work, 60s rest between sets, 3 sets)
    return {
      circuits: constraints?.circuits || objective.recommendedCircuits || 3,
      exercisesPerCircuit: constraints?.exercisesPerCircuit ||
                          objective.recommendedExercisesPerCircuit || 3,
      intervalSeconds: constraints?.intervalSeconds ||
                      objective.recommendedIntervalSeconds || 20,
      restSeconds: constraints?.restSeconds ||
                  objective.recommendedRestSeconds || 60,
      sets: constraints?.sets || objective.recommendedSets || 3
    };
  }

  /**
   * Select exercises for circuits with muscle group balancing
   */
  private static async selectExercisesForCircuits(
    exercisePool: ExercisePool,
    structure: any,
    objective: any
  ): Promise<CircuitDefinition[]> {
    const circuits: CircuitDefinition[] = [];
    const usedExercises = new Set<string>();
    const totalExercisesNeeded = structure.circuits * structure.exercisesPerCircuit;

    // Track muscle group usage to ensure balance
    const muscleGroupUsage: MuscleGroupBalance = {
      upperBodyPush: 0,
      upperBodyPull: 0,
      lowerBody: 0,
      core: 0,
      cardio: 0,
      plyometric: 0,
      fullBody: 0
    };

    // Create circuits
    for (let circuitNum = 1; circuitNum <= structure.circuits; circuitNum++) {
      const circuitExercises: ExerciseSelection[] = [];

      for (let exNum = 0; exNum < structure.exercisesPerCircuit; exNum++) {
        // Select next exercise with balancing
        const exercise = this.selectNextExercise(
          exercisePool,
          usedExercises,
          muscleGroupUsage,
          objective
        );

        if (!exercise) {
          // Not enough unique exercises, allow reuse
          const fallbackExercise = this.selectFallbackExercise(
            exercisePool,
            muscleGroupUsage
          );
          if (!fallbackExercise) break;

          circuitExercises.push(this.convertToExerciseSelection(
            fallbackExercise,
            structure
          ));
          this.updateMuscleGroupUsage(muscleGroupUsage, fallbackExercise);
        } else {
          usedExercises.add(exercise.id);
          circuitExercises.push(this.convertToExerciseSelection(exercise, structure));
          this.updateMuscleGroupUsage(muscleGroupUsage, exercise);
        }
      }

      circuits.push({
        circuitNumber: circuitNum,
        exercises: circuitExercises,
        sets: structure.sets,
        restBetweenSetsSeconds: structure.restSeconds
      });
    }

    return circuits;
  }

  /**
   * Select next exercise with intelligent balancing
   */
  private static selectNextExercise(
    pool: ExercisePool,
    usedExercises: Set<string>,
    muscleGroupUsage: MuscleGroupBalance,
    objective: any
  ): any | null {
    // Try high priority exercises first
    let candidate = this.findBalancedExercise(pool.high, usedExercises, muscleGroupUsage);
    if (candidate) return candidate;

    // Then medium priority
    candidate = this.findBalancedExercise(pool.medium, usedExercises, muscleGroupUsage);
    if (candidate) return candidate;

    // Finally low priority
    candidate = this.findBalancedExercise(pool.low, usedExercises, muscleGroupUsage);
    return candidate;
  }

  /**
   * Find a balanced exercise from a pool
   */
  private static findBalancedExercise(
    exercises: any[],
    usedExercises: Set<string>,
    muscleGroupUsage: MuscleGroupBalance
  ): any | null {
    // Find the least-used muscle group
    const leastUsedCategory = this.getLeastUsedCategory(muscleGroupUsage);

    // Try to find an unused exercise targeting that category
    for (const exercise of exercises) {
      if (!usedExercises.has(exercise.id) &&
          this.categoryMatchesMuscleGroup(exercise.primaryCategory, leastUsedCategory)) {
        return exercise;
      }
    }

    // If no exact match, return first unused exercise
    for (const exercise of exercises) {
      if (!usedExercises.has(exercise.id)) {
        return exercise;
      }
    }

    return null;
  }

  /**
   * Select fallback exercise when unique exercises run out
   */
  private static selectFallbackExercise(
    pool: ExercisePool,
    muscleGroupUsage: MuscleGroupBalance
  ): any | null {
    const leastUsedCategory = this.getLeastUsedCategory(muscleGroupUsage);

    // Try to find exercise targeting least-used category
    for (const exercise of pool.high) {
      if (this.categoryMatchesMuscleGroup(exercise.primaryCategory, leastUsedCategory)) {
        return exercise;
      }
    }

    // Return any exercise
    return pool.high[0] || pool.medium[0] || pool.low[0] || pool.all[0] || null;
  }

  /**
   * Get the least used muscle group category
   */
  private static getLeastUsedCategory(usage: MuscleGroupBalance): keyof MuscleGroupBalance {
    let minUsage = Infinity;
    let leastUsed: keyof MuscleGroupBalance = 'fullBody';

    (Object.keys(usage) as Array<keyof MuscleGroupBalance>).forEach(key => {
      if (usage[key] < minUsage) {
        minUsage = usage[key];
        leastUsed = key;
      }
    });

    return leastUsed;
  }

  /**
   * Check if exercise category matches muscle group
   */
  private static categoryMatchesMuscleGroup(
    category: string,
    muscleGroup: keyof MuscleGroupBalance
  ): boolean {
    const mapping: Record<string, keyof MuscleGroupBalance> = {
      'upper_body_push': 'upperBodyPush',
      'upper_body_pull': 'upperBodyPull',
      'lower_body': 'lowerBody',
      'core': 'core',
      'cardio': 'cardio',
      'plyometric': 'plyometric',
      'full_body': 'fullBody'
    };

    return mapping[category] === muscleGroup;
  }

  /**
   * Update muscle group usage tracking
   */
  private static updateMuscleGroupUsage(
    usage: MuscleGroupBalance,
    exercise: any
  ): void {
    const category = exercise.primaryCategory;
    const mapping: Record<string, keyof MuscleGroupBalance> = {
      'upper_body_push': 'upperBodyPush',
      'upper_body_pull': 'upperBodyPull',
      'lower_body': 'lowerBody',
      'core': 'core',
      'cardio': 'cardio',
      'plyometric': 'plyometric',
      'full_body': 'fullBody'
    };

    const key = mapping[category];
    if (key) {
      usage[key]++;
    }
  }

  /**
   * Convert exercise to selection format
   */
  private static convertToExerciseSelection(
    exercise: any,
    structure: any
  ): ExerciseSelection {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.primaryCategory,
      difficulty: exercise.difficulty,
      durationSeconds: structure.intervalSeconds,
      reps: exercise.defaultReps || undefined,
      restAfterSeconds: structure.restSeconds,
      primaryMuscles: exercise.primaryMuscles as string[],
      secondaryMuscles: exercise.secondaryMuscles as string[]
    };
  }

  /**
   * Calculate workout metadata
   */
  private static calculateMetadata(circuits: CircuitDefinition[]) {
    const exerciseIds = new Set<string>();
    const categories = new Set<string>();
    const muscles = new Set<string>();

    circuits.forEach(circuit => {
      circuit.exercises.forEach(ex => {
        exerciseIds.add(ex.exerciseId);
        categories.add(ex.category);
        ex.primaryMuscles.forEach(m => muscles.add(m));
        ex.secondaryMuscles.forEach(m => muscles.add(m));
      });
    });

    return {
      exercisesUsed: exerciseIds.size,
      categoriesUsed: Array.from(categories),
      muscleGroupsCovered: Array.from(muscles)
    };
  }

  /**
   * Calculate total workout duration in minutes
   */
  private static calculateTotalDuration(circuits: CircuitDefinition[], structure: any): number {
    let totalSeconds = 0;

    circuits.forEach(circuit => {
      const exerciseTime = circuit.exercises.reduce((sum, ex) => {
        return sum + (ex.durationSeconds || 0) + ex.restAfterSeconds;
      }, 0);

      // Time per set
      const setTime = exerciseTime;

      // Total time for all sets
      const circuitTime = setTime * circuit.sets;

      // Add rest between sets (but not after last set)
      const restTime = (circuit.sets - 1) * circuit.restBetweenSetsSeconds;

      totalSeconds += circuitTime + restTime;
    });

    return Math.ceil(totalSeconds / 60);
  }

  /**
   * Estimate calories burned
   * Formula: duration * intensity * base_metabolic_rate
   */
  private static estimateCalories(durationMinutes: number, intensityPercentage: number): number {
    // Base: ~10 calories per minute at 100% intensity for average person
    const baseCaloriesPerMinute = 10;
    const intensityMultiplier = intensityPercentage / 100;

    return Math.round(durationMinutes * baseCaloriesPerMinute * intensityMultiplier);
  }
}
