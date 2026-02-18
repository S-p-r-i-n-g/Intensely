import { create } from 'zustand';
import { workoutsApi } from '../api';
import { Workout } from '../types/api';

/**
 * Workout Store
 * Manages workout state
 */

export interface WorkoutDraft {
  workoutName?: string;
  circuits?: number;
  setsPerCircuit?: number;
  workInterval?: number;
  restInterval?: number;
  exercisesJson?: string;
}

interface WorkoutState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  isLoading: boolean;
  draft: WorkoutDraft | null;
  hasActiveDraft: boolean;

  // Actions
  loadWorkouts: () => Promise<void>;
  setCurrentWorkout: (workout: Workout | null) => void;
  getWorkoutById: (id: string) => Promise<Workout | null>;
  saveDraft: (draft: WorkoutDraft) => void;
  clearDraft: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  currentWorkout: null,
  isLoading: false,
  draft: null,
  hasActiveDraft: false,

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

  saveDraft: (draft: WorkoutDraft) => {
    set({ draft, hasActiveDraft: true });
  },

  clearDraft: () => {
    set({ draft: null, hasActiveDraft: false });
  },
}));
