/**
 * API Type Definitions
 * Matches backend schema and API responses
 */

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  fitnessLevel: string;
  createdAt: string;
  preferences?: UserPreference | null;
}

export interface UserPreference {
  id: string;
  userId: string;
  defaultCircuits: number;
  defaultSets: number;
  defaultIntervalSeconds: number;
  defaultRestSeconds: number;
  defaultWarmUpSeconds: number;
  defaultCoolDownSeconds: number;
}

// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  slug: string;
  familyId?: string;
  primaryCategory: string;
  difficulty: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  hictSuitable: boolean;
  smallSpace: boolean;
  quiet: boolean;
  cardioIntensive: boolean;
  strengthFocus: boolean;
  beginnerFriendly: boolean;
  description?: string;
  instructions: string[];
  tips: string[];
  thumbnailUrl?: string;
  gifUrl?: string;
  videoUrl?: string;
  defaultReps?: number;
  defaultDurationSeconds?: number;
  caloriesPerMinute?: number;
}

// Workout Types
export interface Workout {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  isPublic: boolean;
  isTemplate: boolean;
  totalCircuits: number;
  exercisesPerCircuit: number;
  intervalSeconds: number;
  restSeconds: number;
  setsPerCircuit: number;
  estimatedDurationMinutes?: number;
  estimatedCalories?: number;
  difficultyLevel?: string;
  equipmentRequired: string[];
  averageRating?: number;
  timesCompleted: number;
  circuits?: Circuit[];
}

export interface Circuit {
  id: string;
  workoutId: string;
  circuitOrder: number;
  intervalSeconds?: number;
  restSeconds?: number;
  sets?: number;
  exercises: CircuitExercise[];
}

export interface CircuitExercise {
  id: string;
  circuitId: string;
  exerciseId: string;
  exerciseOrder: number;
  reps?: number;
  durationSeconds?: number;
  exercise: Exercise;
}

// Workout Objective Types
export interface WorkoutObjective {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline?: string;
  preferredCategories: string[];
  intensityPercentage?: number;
  recommendedCircuits: number;
  recommendedExercisesPerCircuit: number;
  recommendedIntervalSeconds: number;
  recommendedRestSeconds: number;
  recommendedSets: number;
  recommendedDurationMinutes: number;
  iconUrl?: string;
  colorHex?: string;
  displayOrder: number;
  isActive: boolean;
}

// Progress Types
export interface ExerciseProgress {
  id: string;
  userId: string;
  exerciseId: string;
  maxReps?: number;
  maxDurationSeconds?: number;
  maxWeightKg?: number;
  timesPerformed: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  exercise: Exercise;
}

export interface ProgressSummary {
  totalExercisesTracked: number;
  totalPerformances: number;
  recentImprovements: number;
  topExercises: {
    exerciseName: string;
    timesPerformed: number;
    maxReps?: number;
    maxDurationSeconds?: number;
  }[];
}

// Favorites Types
export interface FavoriteExercise {
  id: string;
  userId: string;
  exerciseId: string;
  createdAt: string;
  exercise: Exercise;
}

export interface FavoriteWorkout {
  id: string;
  userId: string;
  workoutId: string;
  createdAt: string;
  workout: Workout;
}

// Session Types
export interface WorkoutSession {
  sessionId: string;
  workoutId: string;
  workout: {
    id: string;
    name: string;
    totalCircuits: number;
    setsPerCircuit: number;
    intervalSeconds: number;
    restSeconds: number;
    totalExercises: number;
  };
  circuits: {
    id: string;
    order: number;
    exercises: {
      id: string;
      exerciseId: string;
      order: number;
      name: string;
      reps?: number;
      durationSeconds?: number;
      instructions: string[];
    }[];
  }[];
  startedAt: string;
}

export interface ActiveSession {
  sessionId: string;
  workoutId?: string;
  workoutName?: string;
  startedAt: string;
  elapsedSeconds: number;
  completionPercentage?: number;
}

// Workout History Types
export interface WorkoutHistory {
  id: string;
  userId: string;
  workoutId?: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  circuitsCompleted?: number;
  totalExercisesCompleted?: number;
  completionPercentage?: number;
  estimatedCaloriesBurned?: number;
  userRating?: number;
  perceivedDifficulty?: number;
  notes?: string;
  workout?: Workout;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
}

// Workout Flow Types
export interface WorkoutConstraints {
  difficulty?: string;
  smallSpace?: boolean;
  quiet?: boolean;
  durationMinutes?: number;
  circuits?: number;
  exercisesPerCircuit?: number;
  intervalSeconds?: number;
  restSeconds?: number;
  sets?: number;
  targetCalories?: number;
}
