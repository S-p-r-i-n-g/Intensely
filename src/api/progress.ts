import { apiClient } from './client';
import { ApiResponse, ExerciseProgress, ProgressSummary } from '../types/api';

/**
 * Progress Tracking API Service
 * Handles personal records and progress tracking
 */

export const progressApi = {
  /**
   * Log exercise progress
   */
  logProgress: async (
    exerciseId: string,
    data: {
      maxReps?: number;
      maxDurationSeconds?: number;
      maxWeight?: number;
      notes?: string;
      achievedAt?: string;
    }
  ): Promise<ApiResponse<{ isNewPR: boolean; data: ExerciseProgress }>> => {
    return apiClient.post(`/progress/exercises/${exerciseId}`, data);
  },

  /**
   * Get progress for specific exercise
   */
  getExerciseProgress: async (exerciseId: string): Promise<ApiResponse<ExerciseProgress>> => {
    return apiClient.get(`/progress/exercises/${exerciseId}`);
  },

  /**
   * Get all progress records
   */
  getAllProgress: async (params?: {
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<ApiResponse<ExerciseProgress[]>> => {
    return apiClient.get('/progress/exercises', { params });
  },

  /**
   * Get progress summary statistics
   */
  getSummary: async (): Promise<ApiResponse<ProgressSummary>> => {
    return apiClient.get('/progress/summary');
  },

  /**
   * Delete progress record
   */
  deleteProgress: async (exerciseId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/progress/exercises/${exerciseId}`);
  },
};
