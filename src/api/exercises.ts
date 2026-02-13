import { apiClient } from './client';
import { ApiResponse, Exercise } from '../types/api';

/**
 * Exercise API Service
 * Handles all exercise-related API calls
 */

export const exercisesApi = {
  /**
   * Get all exercises with optional filters
   */
  getAll: async (params?: {
    category?: string;
    difficulty?: string;
    equipment?: string;
    smallSpace?: boolean;
    quiet?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ exercises: Exercise[]; total: number; page: number; totalPages: number }>> => {
    return apiClient.get('/exercises', { params });
  },

  /**
   * Get a single exercise by ID
   */
  getById: async (id: string): Promise<ApiResponse<Exercise>> => {
    return apiClient.get(`/exercises/${id}`);
  },

  /**
   * Search exercises
   */
  search: async (query: string): Promise<ApiResponse<Exercise[]>> => {
    return apiClient.get('/exercises', { params: { search: query } });
  },

  /**
   * Create a new custom exercise
   */
  create: async (data: {
    name: string;
    primaryCategory: string;
    difficulty: string;
    primaryMuscles: string[];
    secondaryMuscles?: string[];
    equipment?: string[];
    description?: string;
    instructions?: string[];
  }): Promise<ApiResponse<Exercise>> => {
    return apiClient.post('/exercises', data);
  },
};
