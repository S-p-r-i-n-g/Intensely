import { apiClient } from './client';
import { ApiResponse, Workout, WorkoutObjective, WorkoutConstraints } from '../types/api';

/**
 * Workout API Service
 * Handles all workout-related API calls including workout flows
 */

export const workoutsApi = {
  /**
   * Get all objectives
   */
  getObjectives: async (): Promise<ApiResponse<WorkoutObjective[]>> => {
    return apiClient.get('/objectives');
  },

  /**
   * Get a single objective by slug
   */
  getObjective: async (slug: string): Promise<ApiResponse<WorkoutObjective>> => {
    return apiClient.get(`/objectives/${slug}`);
  },

  /**
   * Get all workouts
   */
  getAll: async (params?: {
    difficulty?: string;
    objective?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<Workout[]>> => {
    return apiClient.get('/workouts', { params });
  },

  /**
   * Get a single workout by ID
   */
  getById: async (id: string): Promise<ApiResponse<Workout>> => {
    return apiClient.get(`/workouts/${id}`);
  },

  /**
   * Jump Right In - Instant workout generation
   */
  jumpRightIn: async (): Promise<ApiResponse<Workout>> => {
    return apiClient.post('/flows/jump-right-in');
  },

  /**
   * Let Us Curate - Objective-based with customization
   */
  letUsCurate: async (data: {
    objectiveSlug: string;
    constraints?: WorkoutConstraints;
  }): Promise<ApiResponse<Workout>> => {
    return apiClient.post('/flows/let-us-curate', data);
  },

  /**
   * Take the Wheel - Custom workout building
   */
  takeTheWheel: async (data: {
    name: string;
    circuits: {
      exercises: string[]; // exercise IDs
      sets?: number;
      intervalSeconds?: number;
      restSeconds?: number;
    }[];
    intervalSeconds: number;
    restSeconds: number;
    sets: number;
  }): Promise<ApiResponse<Workout>> => {
    return apiClient.post('/flows/take-the-wheel', data);
  },

  /**
   * Update a workout
   */
  update: async (id: string, data: {
    name?: string;
    description?: string;
    difficulty?: string;
    durationMinutes?: number;
    isPublic?: boolean;
  }): Promise<ApiResponse<Workout>> => {
    return apiClient.put(`/workouts/${id}`, data);
  },

  /**
   * Delete a workout
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/workouts/${id}`);
  },
};
