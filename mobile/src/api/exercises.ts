import { apiClient } from './client';
import { supabase } from '../config/supabase';
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
    // Use Supabase directly instead of backend API
    try {
      let query = supabase.from('exercises').select('*', { count: 'exact' });

      if (params?.category) query = query.eq('primaryCategory', params.category);
      if (params?.difficulty) query = query.eq('difficulty', params.difficulty);
      if (params?.smallSpace !== undefined) query = query.eq('smallSpace', params.smallSpace);
      if (params?.quiet !== undefined) query = query.eq('quiet', params.quiet);
      if (params?.search) query = query.ilike('name', `%${params.search}%`);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: {
          exercises: data || [],
          total: count || 0,
          page: params?.page || 1,
          totalPages: Math.ceil((count || 0) / (params?.limit || 50))
        },
        status: 200,
        message: 'Success'
      };
    } catch (error: any) {
      return {
        data: { exercises: [], total: 0, page: 1, totalPages: 0 },
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Get a single exercise by ID
   */
  getById: async (id: string): Promise<ApiResponse<Exercise>> => {
    // Use Supabase directly instead of backend API
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data: data as Exercise,
        status: 200,
        message: 'Success'
      };
    } catch (error: any) {
      return {
        data: {} as Exercise,
        status: 404,
        message: error.message || 'Exercise not found'
      };
    }
  },

  /**
   * Search exercises
   */
  search: async (query: string): Promise<ApiResponse<Exercise[]>> => {
    // Use Supabase directly instead of backend API
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${query}%`);

      if (error) throw error;

      return {
        data: data || [],
        status: 200,
        message: 'Success'
      };
    } catch (error: any) {
      return {
        data: [],
        status: 500,
        message: error.message
      };
    }
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

  /**
   * Update an existing exercise
   */
  update: async (id: string, data: Partial<Exercise>): Promise<ApiResponse<Exercise>> => {
    return apiClient.put(`/exercises/${id}`, data);
  },

  /**
   * Delete (archive) an exercise
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/exercises/${id}`);
  },
};
