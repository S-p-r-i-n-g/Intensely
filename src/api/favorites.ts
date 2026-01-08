import { apiClient } from './client';
import { ApiResponse, FavoriteExercise, FavoriteWorkout } from '../types/api';

/**
 * Favorites API Service
 * Handles favorite exercises and workouts
 */

export const favoritesApi = {
  // Exercise Favorites
  /**
   * Add exercise to favorites
   */
  addExercise: async (exerciseId: string): Promise<ApiResponse<FavoriteExercise>> => {
    return apiClient.post(`/favorites/exercises/${exerciseId}`);
  },

  /**
   * Remove exercise from favorites
   */
  removeExercise: async (exerciseId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/favorites/exercises/${exerciseId}`);
  },

  /**
   * Get favorite exercises
   */
  getFavoriteExercises: async (): Promise<ApiResponse<FavoriteExercise[]>> => {
    return apiClient.get('/favorites/exercises');
  },

  // Workout Favorites
  /**
   * Add workout to favorites
   */
  addWorkout: async (workoutId: string): Promise<ApiResponse<FavoriteWorkout>> => {
    return apiClient.post(`/favorites/workouts/${workoutId}`);
  },

  /**
   * Remove workout from favorites
   */
  removeWorkout: async (workoutId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/favorites/workouts/${workoutId}`);
  },

  /**
   * Get favorite workouts
   */
  getFavoriteWorkouts: async (): Promise<ApiResponse<FavoriteWorkout[]>> => {
    return apiClient.get('/favorites/workouts');
  },
};
