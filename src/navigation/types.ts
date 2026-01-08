/**
 * Navigation Type Definitions
 * Type-safe navigation for React Navigation
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Workouts: undefined;
  Exercises: NavigatorScreenParams<ExercisesStackParamList>;
  Progress: NavigatorScreenParams<ProgressStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack (nested in Home tab)
export type HomeStackParamList = {
  HomeMain: undefined;
  WorkoutFlowSelection: undefined;
  JumpRightIn: undefined;
  LetUsCurate: { objectiveSlug?: string };
  TakeTheWheel: { selectedExerciseIds?: string[] };
  ExerciseSelection: { selectedIds?: string[] };
  WorkoutPreview: { workoutId: string };
  WorkoutExecution: { workoutId: string };
  WorkoutComplete: { sessionId: string; durationSeconds: number; caloriesBurned?: number };
};

// Workouts Stack
export type WorkoutsStackParamList = {
  WorkoutsList: undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutExecution: { sessionId: string };
  WorkoutComplete: { sessionId: string; durationSeconds: number; caloriesBurned?: number };
};

// Exercises Stack
export type ExercisesStackParamList = {
  ExercisesList: undefined;
  ExerciseDetail: { exerciseId: string };
  Favorites: undefined;
};

// Progress Stack
export type ProgressStackParamList = {
  ProgressOverview: undefined;
  ExerciseProgress: { exerciseId: string };
  LogProgress: { exerciseId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
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
