import { apiClient } from './client';
import { ApiResponse, WorkoutSession, ActiveSession, WorkoutHistory } from '../types/api';

/**
 * Workout Session API Service
 * Handles live workout session tracking
 */

export const sessionsApi = {
  /**
   * Start a new workout session
   */
  start: async (workoutId: string): Promise<ApiResponse<WorkoutSession>> => {
    return apiClient.post('/sessions/start', { workoutId });
  },

  /**
   * Get session details
   */
  getSession: async (sessionId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/sessions/${sessionId}`);
  },

  /**
   * Update session progress
   */
  updateProgress: async (
    sessionId: string,
    data: {
      circuitsCompleted: number;
      totalExercisesCompleted: number;
      completionPercentage: number;
    }
  ): Promise<ApiResponse<any>> => {
    return apiClient.patch(`/sessions/${sessionId}/progress`, data);
  },

  /**
   * Complete a workout session
   */
  complete: async (
    sessionId: string,
    data: {
      circuitsCompleted: number;
      totalExercisesCompleted: number;
      completionPercentage: number;
      estimatedCaloriesBurned?: number;
      perceivedDifficulty?: number;
      notes?: string;
    }
  ): Promise<ApiResponse<{ sessionId: string; durationSeconds: number; completionPercentage: number; estimatedCaloriesBurned?: number }>> => {
    return apiClient.post(`/sessions/${sessionId}/complete`, data);
  },

  /**
   * Cancel a workout session
   */
  cancel: async (sessionId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/sessions/${sessionId}`);
  },

  /**
   * Get active sessions
   */
  getActive: async (): Promise<ApiResponse<ActiveSession[]>> => {
    return apiClient.get('/sessions/active');
  },

  /**
   * Get workout history
   */
  getHistory: async (params?: { limit?: number; offset?: number }): Promise<ApiResponse<{ sessions: WorkoutHistory[]; total: number }>> => {
    return apiClient.get('/history', { params });
  },
};
