import { getErrorMessage } from '../utils/errors';
import { supabase } from '../config/supabase';
import { ApiResponse, Workout } from '../types/api';

/**
 * Workout API Service
 * Handles all workout-related API calls including workout flows
 * Queries Supabase directly
 */

interface DbWorkoutRow {
  id: string;
  name: string;
  created_by?: string;
  is_public: boolean;
  is_template: boolean;
  total_circuits: number;
  exercises_per_circuit: number;
  interval_seconds: number;
  rest_seconds: number;
  sets_per_circuit: number;
  estimated_duration_minutes?: number;
  estimated_calories?: number;
  difficulty_level?: string;
  equipment_required: string[];
  average_rating?: number;
  times_completed: number;
  updated_at: string;
}

interface DbCircuitExerciseRow {
  id: string;
  circuit_id: string;
  exercise_id: string;
  exercise_order: number;
  reps?: number;
  duration_seconds?: number;
  exercises: {
    id: string;
    name: string;
    slug: string;
    primary_category: string;
    difficulty: string;
    primary_muscles: string[];
    secondary_muscles: string[];
    equipment: string[];
    hict_suitable: boolean;
    small_space: boolean;
    quiet: boolean;
    cardio_intensive: boolean;
    strength_focus: boolean;
    mobility_focus: boolean;
    minimal_transition: boolean;
    beginner_friendly: boolean;
    is_verified: boolean;
    movement_pattern?: string;
    mechanic?: string;
    description?: string;
    instructions: string[];
    tips: string[];
    thumbnail_url?: string;
    default_reps?: number;
    default_duration_seconds?: number;
    calories_per_minute?: number;
  };
}

interface DbCircuitRow {
  id: string;
  workout_id: string;
  circuit_order: number;
  interval_seconds?: number;
  rest_seconds?: number;
  sets?: number;
  circuit_exercises: DbCircuitExerciseRow[];
}

interface DbWorkoutWithCircuitsRow extends DbWorkoutRow {
  circuits: DbCircuitRow[];
}

// Map snake_case DB fields to camelCase Workout interface
const mapDbWorkout = (row: DbWorkoutRow): Workout => ({
  id: row.id,
  name: row.name,
  createdBy: row.created_by,
  isPublic: row.is_public,
  isTemplate: row.is_template,
  totalCircuits: row.total_circuits,
  exercisesPerCircuit: row.exercises_per_circuit,
  intervalSeconds: row.interval_seconds,
  restSeconds: row.rest_seconds,
  setsPerCircuit: row.sets_per_circuit,
  estimatedDurationMinutes: row.estimated_duration_minutes,
  estimatedCalories: row.estimated_calories,
  difficultyLevel: row.difficulty_level,
  equipmentRequired: row.equipment_required,
  averageRating: row.average_rating,
  timesCompleted: row.times_completed || 0,
});

export const workoutsApi = {
  /**
   * Get all workouts
   */
  getAll: async (params?: {
    difficulty?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<Workout[]>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

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
        data: (data || []).map(row => mapDbWorkout(row as unknown as DbWorkoutRow)),
        status: 200,
        message: 'Success'
      };
    } catch (error: unknown) {
      return {
        data: [],
        status: 500,
        message: getErrorMessage(error)
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
        data: mapDbWorkout(data as unknown as DbWorkoutRow),
        status: 200,
        message: 'Success'
      };
    } catch (error: unknown) {
      return {
        data: {} as Workout,
        status: 404,
        message: getErrorMessage(error) || 'Workout not found'
      };
    }
  },

  /**
   * Get a single workout by ID including nested circuits and exercises
   * Used by WorkoutExecutionScreen which requires circuit data to run
   */
  getByIdWithCircuits: async (id: string): Promise<ApiResponse<Workout>> => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          circuits (
            *,
            circuit_exercises (
              *,
              exercises (*)
            )
          )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      const row = data as unknown as DbWorkoutWithCircuitsRow;
      const workout = mapDbWorkout(row);

      workout.circuits = (row.circuits || [])
        .sort((a, b) => a.circuit_order - b.circuit_order)
        .map((circuit) => ({
          id: circuit.id,
          workoutId: circuit.workout_id,
          circuitOrder: circuit.circuit_order,
          intervalSeconds: circuit.interval_seconds,
          restSeconds: circuit.rest_seconds,
          sets: circuit.sets,
          exercises: (circuit.circuit_exercises || [])
            .sort((a, b) => a.exercise_order - b.exercise_order)
            .map((ce) => ({
              id: ce.id,
              circuitId: ce.circuit_id,
              exerciseId: ce.exercise_id,
              exerciseOrder: ce.exercise_order,
              reps: ce.reps,
              durationSeconds: ce.duration_seconds,
              exercise: {
                id: ce.exercises.id,
                name: ce.exercises.name,
                slug: ce.exercises.slug,
                primaryCategory: ce.exercises.primary_category,
                difficulty: ce.exercises.difficulty,
                primaryMuscles: ce.exercises.primary_muscles || [],
                secondaryMuscles: ce.exercises.secondary_muscles || [],
                equipment: ce.exercises.equipment || [],
                hictSuitable: ce.exercises.hict_suitable,
                smallSpace: ce.exercises.small_space,
                quiet: ce.exercises.quiet,
                cardioIntensive: ce.exercises.cardio_intensive,
                strengthFocus: ce.exercises.strength_focus,
                mobilityFocus: ce.exercises.mobility_focus,
                minimalTransition: ce.exercises.minimal_transition,
                beginnerFriendly: ce.exercises.beginner_friendly,
                isVerified: ce.exercises.is_verified,
                movementPattern: ce.exercises.movement_pattern,
                mechanic: ce.exercises.mechanic,
                description: ce.exercises.description,
                instructions: ce.exercises.instructions || [],
                tips: ce.exercises.tips || [],
                thumbnailUrl: ce.exercises.thumbnail_url,
                defaultReps: ce.exercises.default_reps,
                defaultDurationSeconds: ce.exercises.default_duration_seconds,
                caloriesPerMinute: ce.exercises.calories_per_minute,
              },
            })),
        }));

      return { data: workout, status: 200, message: 'Success' };
    } catch (error: unknown) {
      return {
        data: {} as Workout,
        status: 404,
        message: getErrorMessage(error) || 'Workout not found',
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
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Ensure user exists in public.users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error when no rows found

      if (!existingUser) {
        console.log('[Workouts] Creating user in public.users table:', user.id);
        // Create user in public.users table with all required fields
        const now = new Date().toISOString();
        const { error: userCreateError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            auth_provider: 'email',
            email_verified: !!user.email_confirmed_at,
            fitness_level: 'beginner', // Required field with default
            metric_system: true, // Required field with default
            notification_preferences: {}, // Required field with default
            updated_at: now,
          });

        if (userCreateError) {
          console.error('[Workouts] Failed to create user:', userCreateError);
          throw new Error(`Failed to create user profile: ${userCreateError.message}`);
        }
        console.log('[Workouts] User created successfully');
      }

      // Calculate workout metadata
      const totalCircuits = data.circuits.length;
      const exercisesPerCircuit = data.circuits[0]?.exercises.length || 0;
      const estimatedDurationMinutes = Math.ceil(
        (totalCircuits * exercisesPerCircuit * data.intervalSeconds * data.sets +
         totalCircuits * data.restSeconds * data.sets) / 60
      );

      // Create workout
      const now = new Date().toISOString();
      const workoutId = crypto.randomUUID();

      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          id: workoutId,
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
          updated_at: now,
        })
        .select()
        .single();

      if (workoutError) {
        console.error('[Workouts] Failed to create workout:', JSON.stringify(workoutError, null, 2));
        console.error('[Workouts] Workout data:', JSON.stringify({
          name: data.name,
          created_by: user.id,
          total_circuits: totalCircuits,
          exercises_per_circuit: exercisesPerCircuit,
          interval_seconds: data.intervalSeconds,
          rest_seconds: data.restSeconds,
          sets_per_circuit: data.sets,
        }, null, 2));
        throw workoutError;
      }

      // Create circuits
      for (let i = 0; i < data.circuits.length; i++) {
        const circuit = data.circuits[i];
        const circuitId = crypto.randomUUID();

        const { data: circuitData, error: circuitError } = await supabase
          .from('circuits')
          .insert({
            id: circuitId,
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
          id: crypto.randomUUID(),
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

      console.log('[Workouts] Workout created successfully!', {
        id: workout.id,
        name: workout.name,
        circuits: data.circuits.length,
      });

      return {
        data: mapDbWorkout(workout as unknown as DbWorkoutRow),
        status: 201,
        message: 'Workout created successfully'
      };
    } catch (error: unknown) {
      console.error('[Workouts] Create workout error:', getErrorMessage(error));
      return {
        data: {} as Workout,
        status: 500,
        message: getErrorMessage(error)
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
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
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
    } catch (error: unknown) {
      return {
        data: {} as Workout,
        status: 500,
        message: getErrorMessage(error)
      };
    }
  },

  /**
   * Delete a workout (soft delete)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
    } catch (error: unknown) {
      return {
        data: undefined,
        status: 500,
        message: getErrorMessage(error)
      };
    }
  },
};
