import { supabase } from '../config/supabase';
import { ApiResponse, Workout } from '../types/api';

/**
 * Workout API Service
 * Handles all workout-related API calls including workout flows
 * Queries Supabase directly
 */

export const workoutsApi = {
  /**
   * Get all workouts
   */
  getAll: async (params?: {
    difficulty?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<Workout[]>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase.from('workouts').select('*').is('deleted_at', null);

      // Filter by difficulty if provided
      if (params?.difficulty) {
        query = query.eq('difficulty_level', params.difficulty);
      }

      // Filter by public/private
      if (params?.isPublic !== undefined) {
        query = query.eq('is_public', params.isPublic);
      } else if (user) {
        // If no isPublic filter, show public workouts OR user's own workouts
        query = query.or(`is_public.eq.true,created_by.eq.${user.id}`);
      } else {
        // Not authenticated, only show public workouts
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

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
   * Get a single workout by ID
   */
  getById: async (id: string): Promise<ApiResponse<Workout>> => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      return {
        data: data as Workout,
        status: 200,
        message: 'Success'
      };
    } catch (error: any) {
      return {
        data: {} as Workout,
        status: 404,
        message: error.message || 'Workout not found'
      };
    }
  },

  /**
   * Create a custom workout
   */
  create: async (data: {
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
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate workout metadata
      const totalCircuits = data.circuits.length;
      const exercisesPerCircuit = data.circuits[0]?.exercises.length || 0;
      const estimatedDurationMinutes = Math.ceil(
        (totalCircuits * exercisesPerCircuit * data.intervalSeconds * data.sets +
         totalCircuits * data.restSeconds * data.sets) / 60
      );

      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          name: data.name,
          created_by: user.id,
          is_public: false,
          is_template: false,
          total_circuits: totalCircuits,
          exercises_per_circuit: exercisesPerCircuit,
          interval_seconds: data.intervalSeconds,
          rest_seconds: data.restSeconds,
          sets_per_circuit: data.sets,
          estimated_duration_minutes: estimatedDurationMinutes,
          equipment_required: ['bodyweight'], // Default, could be calculated from exercises
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create circuits
      for (let i = 0; i < data.circuits.length; i++) {
        const circuit = data.circuits[i];

        const { data: circuitData, error: circuitError } = await supabase
          .from('circuits')
          .insert({
            workout_id: workout.id,
            circuit_order: i,
            interval_seconds: circuit.intervalSeconds || data.intervalSeconds,
            rest_seconds: circuit.restSeconds || data.restSeconds,
            sets: circuit.sets || data.sets,
          })
          .select()
          .single();

        if (circuitError) throw circuitError;

        // Create circuit exercises
        const exerciseInserts = circuit.exercises.map((exerciseId, idx) => ({
          circuit_id: circuitData.id,
          exercise_id: exerciseId,
          exercise_order: idx,
          duration_seconds: circuit.intervalSeconds || data.intervalSeconds,
        }));

        const { error: exerciseError } = await supabase
          .from('circuit_exercises')
          .insert(exerciseInserts);

        if (exerciseError) throw exerciseError;
      }

      return {
        data: workout as Workout,
        status: 201,
        message: 'Workout created successfully'
      };
    } catch (error: any) {
      return {
        data: {} as Workout,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Update a workout
   */
  update: async (id: string, data: {
    name?: string;
    difficulty?: string;
    durationMinutes?: number;
    isPublic?: boolean;
  }): Promise<ApiResponse<Workout>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.difficulty) updateData.difficulty_level = data.difficulty;
      if (data.durationMinutes) updateData.estimated_duration_minutes = data.durationMinutes;
      if (data.isPublic !== undefined) updateData.is_public = data.isPublic;

      const { data: workout, error } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', user.id) // Only allow updating own workouts
        .select()
        .single();

      if (error) throw error;

      return {
        data: workout as Workout,
        status: 200,
        message: 'Workout updated successfully'
      };
    } catch (error: any) {
      return {
        data: {} as Workout,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Delete a workout (soft delete)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('workouts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('created_by', user.id); // Only allow deleting own workouts

      if (error) throw error;

      return {
        data: undefined,
        status: 200,
        message: 'Workout deleted successfully'
      };
    } catch (error: any) {
      return {
        data: undefined,
        status: 500,
        message: error.message
      };
    }
  },
};
