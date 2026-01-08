import { create } from 'zustand';
import { workoutsApi } from '../api';
import { Workout, WorkoutObjective } from '../types/api';

/**
 * Workout Store
 * Manages workout and objective state
 */

interface WorkoutState {
  objectives: WorkoutObjective[];
  workouts: Workout[];
  currentWorkout: Workout | null;
  isLoading: boolean;

  // Actions
  loadObjectives: () => Promise<void>;
  loadWorkouts: () => Promise<void>;
  setCurrentWorkout: (workout: Workout | null) => void;
  getWorkoutById: (id: string) => Promise<Workout | null>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  objectives: [],
  workouts: [],
  currentWorkout: null,
  isLoading: false,

  /**
   * Load all workout objectives
   */
  loadObjectives: async () => {
    try {
      set({ isLoading: true });

      const response = await workoutsApi.getObjectives();
      set({ objectives: response.data });
    } catch (error) {
      console.error('Failed to load objectives:', error);
    } finally {
      set({ isLoading: false });
    }
  },

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
