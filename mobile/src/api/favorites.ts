import { supabase } from '../config/supabase';
import { ApiResponse, FavoriteExercise, FavoriteWorkout } from '../types/api';

/**
 * Favorites API Service
 * Handles favorite exercises and workouts
 * Queries Supabase directly
 */

export const favoritesApi = {
  // Exercise Favorites
  /**
   * Add exercise to favorites
   */
  addExercise: async (exerciseId: string): Promise<ApiResponse<FavoriteExercise>> => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('favorite_exercises')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .single();

      if (existing) {
        return {
          data: existing as FavoriteExercise,
          status: 200,
          message: 'Already favorited'
        };
      }

      // Insert new favorite
      const { data, error } = await supabase
        .from('favorite_exercises')
        .insert({
          user_id: user.id,
          exercise_id: exerciseId,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as FavoriteExercise,
        status: 201,
        message: 'Added to favorites'
      };
    } catch (error: any) {
      return {
        data: {} as FavoriteExercise,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Remove exercise from favorites
   */
  removeExercise: async (exerciseId: string): Promise<ApiResponse<void>> => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('favorite_exercises')
        .delete()
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId);

      if (error) throw error;

      return {
        data: undefined,
        status: 200,
        message: 'Removed from favorites'
      };
    } catch (error: any) {
      return {
        data: undefined,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Get favorite exercises
   */
  getFavoriteExercises: async (): Promise<ApiResponse<FavoriteExercise[]>> => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        // Return empty array if not authenticated
        return {
          data: [],
          status: 200,
          message: 'Not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('favorite_exercises')
        .select('*')
        .eq('user_id', user.id);

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

  // Workout Favorites
  /**
   * Add workout to favorites
   */
  addWorkout: async (workoutId: string): Promise<ApiResponse<FavoriteWorkout>> => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from('favorite_workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('workout_id', workoutId)
        .single();

      if (existing) {
        return {
          data: existing as FavoriteWorkout,
          status: 200,
          message: 'Already favorited'
        };
      }

      // Insert new favorite
      const { data, error } = await supabase
        .from('favorite_workouts')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as FavoriteWorkout,
        status: 201,
        message: 'Added to favorites'
      };
    } catch (error: any) {
      return {
        data: {} as FavoriteWorkout,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Remove workout from favorites
   */
  removeWorkout: async (workoutId: string): Promise<ApiResponse<void>> => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('favorite_workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('workout_id', workoutId);

      if (error) throw error;

      return {
        data: undefined,
        status: 200,
        message: 'Removed from favorites'
      };
    } catch (error: any) {
      return {
        data: undefined,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Get favorite workouts
   */
  getFavoriteWorkouts: async (): Promise<ApiResponse<FavoriteWorkout[]>> => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        // Return empty array if not authenticated
        return {
          data: [],
          status: 200,
          message: 'Not authenticated'
        };
      }

      const { data, error } = await supabase
        .from('favorite_workouts')
        .select('*')
        .eq('user_id', user.id);

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
};
