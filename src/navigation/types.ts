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

// Main Tab Navigator
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Workouts: undefined;
  Exercises: NavigatorScreenParams<ExercisesStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack (nested in Home tab)
export type HomeStackParamList = {
  HomeMain: undefined;
  WorkoutFlowSelection: undefined;
  JumpRightIn: undefined;
  LetUsCurate: { objectiveSlug?: string };
  TakeTheWheel: {
    workoutId?: string; // If provided, we're editing an existing workout
    selectedExerciseIds?: string[];
    workoutName?: string;
    circuits?: number;
    setsPerCircuit?: number;
    workInterval?: number;
    restInterval?: number;
  };
  ExerciseSelection: {
    selectedIds?: string[];
    workoutName?: string;
    circuits?: number;
    setsPerCircuit?: number;
    workInterval?: number;
    restInterval?: number;
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
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Helper types for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
