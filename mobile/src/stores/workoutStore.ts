import { create } from 'zustand';
import { workoutsApi } from '../api';
import { Workout } from '../types/api';

/**
 * Workout Store
 * Manages workout state
 */

interface WorkoutState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  isLoading: boolean;

  // Actions
  loadWorkouts: () => Promise<void>;
  setCurrentWorkout: (workout: Workout | null) => void;
  getWorkoutById: (id: string) => Promise<Workout | null>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  currentWorkout: null,
  isLoading: false,

  /**
   * Load all workouts
   */
  loadWorkouts: async () => {
    try {
      set({ isLoading: true });

      const response = await workoutsApi.getAll();
      set({ workouts: response.data });
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Set current workout
   */
  setCurrentWorkout: (workout: Workout | null) => {
    set({ currentWorkout: workout });
  },

  /**
   * Get workout by ID
   */
  getWorkoutById: async (id: string): Promise<Workout | null> => {
    try {
      const response = await workoutsApi.getById(id);
      return response.data;
    } catch (error) {
      console.error('Failed to get workout:', error);
      return null;
    }
  },
}));
