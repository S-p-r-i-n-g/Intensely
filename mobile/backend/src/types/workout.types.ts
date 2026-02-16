/**
 * Workout Generation Types
 *
 * Types for the workout generation engine
 */

export interface WorkoutConstraints {
  // Equipment constraints
  availableEquipment?: string[];

  // Space and environment
  smallSpace?: boolean;
  quiet?: boolean;

  // Difficulty
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  // Duration
  durationMinutes?: number;

  // Structure preferences
  circuits?: number;
  exercisesPerCircuit?: number;
  intervalSeconds?: number;
  restSeconds?: number;
  sets?: number;

  // Exercise preferences
  excludedExercises?: string[]; // Exercise IDs to exclude
  includedExercises?: string[]; // Exercise IDs to include

  // Category preferences (override objective defaults)
  preferredCategories?: string[];
  avoidCategories?: string[];
}

export interface WorkoutGenerationRequest {
  objectiveId: string;
  constraints?: WorkoutConstraints;
  userId?: string; // Optional for logged-in users
}

export interface WorkoutGenerationResult {
  workout: {
    name: string;
    description: string;
    objectiveId: string;
    circuits: CircuitDefinition[];
    totalDurationMinutes: number;
    estimatedCalories: number;
    difficulty: string;
  };
  metadata: {
    exercisesUsed: number;
    categoriesUsed: string[];
    muscleGroupsCovered: string[];
  };
}

export interface CircuitDefinition {
  circuitNumber: number;
  exercises: ExerciseSelection[];
  sets: number;
  restBetweenSetsSeconds: number;
}

export interface ExerciseSelection {
  exerciseId: string;
  exerciseName: string;
  category: string;
  difficulty: string;
  durationSeconds?: number;
  reps?: number;
  restAfterSeconds: number;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export interface MuscleGroupBalance {
  upperBodyPush: number;
  upperBodyPull: number;
  lowerBody: number;
  core: number;
  cardio: number;
  plyometric: number;
  fullBody: number;
}

export interface ExercisePool {
  high: any[];      // High priority exercises from objective
  medium: any[];    // Medium priority exercises
  low: any[];       // Low priority exercises
  all: any[];       // All available exercises
}
