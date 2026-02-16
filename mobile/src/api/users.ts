import { apiClient } from './client';
import { ApiResponse, User, UserPreference } from '../types/api';

/**
 * Users API Service
 * Handles user profile and preferences
 */

export const usersApi = {
  /**
   * Sync user with backend (creates if doesn't exist)
   */
  sync: async (): Promise<ApiResponse<User>> => {
    return apiClient.post('/users/sync');
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get('/users/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put('/users/me', data);
  },

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<ApiResponse<UserPreference>> => {
    return apiClient.get('/users/preferences');
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (data: Partial<UserPreference>): Promise<ApiResponse<UserPreference>> => {
    return apiClient.put('/users/preferences', data);
  },
};
