/**
 * Navigation Type Definitions
 * Type-safe navigation for React Navigation
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Drawer Navigator (replaces tabs)
export type DrawerParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Workouts: NavigatorScreenParams<WorkoutsStackParamList>;
  Exercises: NavigatorScreenParams<ExercisesStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Main Tab Navigator (deprecated - keeping for reference)
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Workouts: undefined;
  Exercises: NavigatorScreenParams<ExercisesStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack (nested in Home tab)
export type HomeStackParamList = {
  HomeMain: undefined;
  NewWorkout: {
    workoutId?: string; // If provided, we're editing an existing workout
    selectedExerciseIds?: string[];
    circuitIndex?: number;
    workoutName?: string;
    circuits?: number;
    setsPerCircuit?: number;
    workInterval?: number;
    restInterval?: number;
    isSynced?: boolean;
    exercisesJson?: string; // JSON-encoded Record<number, string[]> for all circuits
  };
  // Legacy routes (kept for backward compatibility)
  WorkoutFlowSelection: undefined;
  JumpRightIn: undefined;
  TakeTheWheel: {
    workoutId?: string;
    selectedExerciseIds?: string[];
    workoutName?: string;
    circuits?: number;
    setsPerCircuit?: number;
    workInterval?: number;
    restInterval?: number;
  };
  ExerciseSelection: {
    selectedIds?: string[];
    circuitIndex?: number;
    workoutName?: string;
    circuits?: number;
    setsPerCircuit?: number;
    workInterval?: number;
    restInterval?: number;
    isSynced?: boolean;
    exercisesJson?: string; // JSON-encoded Record<number, string[]> for all circuits
  };
  WorkoutPreview: { workoutId: string };
  WorkoutExecution: { workoutId: string };
  WorkoutComplete: { sessionId: string; durationSeconds: number; caloriesBurned?: number };
};

// Workouts Stack
export type WorkoutsStackParamList = {
  WorkoutsList: undefined;
  WorkoutPreview: { workoutId: string };
  WorkoutExecution: { workoutId: string };
  WorkoutComplete: { sessionId: string; durationSeconds: number; caloriesBurned?: number };
};

// Exercises Stack
export type ExercisesStackParamList = {
  ExercisesList: undefined;
  ExerciseDetail: { exerciseId: string };
  Favorites: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Preferences: undefined;
  EditProfile: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<DrawerParamList>;
};

// Helper types for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
