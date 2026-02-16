import { create } from 'zustand';
import { sessionsApi } from '../api';
import { WorkoutSession } from '../types/api';

/**
 * Session Store
 * Manages active workout session state
 */

interface SessionState {
  activeSession: WorkoutSession | null;
  sessionId: string | null;
  currentCircuit: number;
  currentExercise: number;
  currentSet: number;
  isPaused: boolean;
  elapsedTime: number;
  completedExercises: number;

  // Actions
  startSession: (workoutId: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  nextExercise: () => void;
  previousExercise: () => void;
  completeSession: (data: {
    circuitsCompleted: number;
    totalExercisesCompleted: number;
    completionPercentage: number;
    estimatedCaloriesBurned?: number;
    perceivedDifficulty?: number;
    notes?: string;
  }) => Promise<void>;
  cancelSession: () => Promise<void>;
  updateProgress: () => Promise<void>;
  setElapsedTime: (time: number) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  sessionId: null,
  currentCircuit: 0,
  currentExercise: 0,
  currentSet: 0,
  isPaused: false,
  elapsedTime: 0,
  completedExercises: 0,

  /**
   * Start a new workout session
   */
  startSession: async (workoutId: string) => {
    try {
      const response = await sessionsApi.start(workoutId);

      set({
        activeSession: response.data,
        sessionId: response.data.sessionId,
        currentCircuit: 0,
        currentExercise: 0,
        currentSet: 0,
        isPaused: false,
        elapsedTime: 0,
        completedExercises: 0,
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  },

  /**
   * Pause the session
   */
  pauseSession: () => {
    set({ isPaused: true });
  },

  /**
   * Resume the session
   */
  resumeSession: () => {
    set({ isPaused: false });
  },

  /**
   * Move to next exercise
   */
  nextExercise: () => {
    const { activeSession, currentCircuit, currentExercise, currentSet, completedExercises } = get();

    if (!activeSession) return;

    const circuit = activeSession.circuits[currentCircuit];
    const totalExercisesInCircuit = circuit.exercises.length;

    // Move to next exercise
    if (currentExercise < totalExercisesInCircuit - 1) {
      set({
        currentExercise: currentExercise + 1,
        completedExercises: completedExercises + 1,
      });
    }
    // Move to next set
    else if (currentSet < activeSession.workout.setsPerCircuit - 1) {
      set({
        currentExercise: 0,
        currentSet: currentSet + 1,
        completedExercises: completedExercises + 1,
      });
    }
    // Move to next circuit
    else if (currentCircuit < activeSession.circuits.length - 1) {
      set({
        currentCircuit: currentCircuit + 1,
        currentExercise: 0,
        currentSet: 0,
        completedExercises: completedExercises + 1,
      });
    }
    // Workout complete
    else {
      set({ completedExercises: completedExercises + 1 });
    }

    // Update progress on backend
    get().updateProgress();
  },

  /**
   * Move to previous exercise
   */
  previousExercise: () => {
    const { currentCircuit, currentExercise, currentSet } = get();

    // Move to previous exercise in same set
    if (currentExercise > 0) {
      set({ currentExercise: currentExercise - 1 });
    }
    // Move to last exercise of previous set
    else if (currentSet > 0) {
      const { activeSession } = get();
      if (!activeSession) return;

      const circuit = activeSession.circuits[currentCircuit];
      set({
        currentExercise: circuit.exercises.length - 1,
        currentSet: currentSet - 1,
      });
    }
    // Move to last exercise of previous circuit
    else if (currentCircuit > 0) {
      const { activeSession } = get();
      if (!activeSession) return;

      const prevCircuit = activeSession.circuits[currentCircuit - 1];
      set({
        currentCircuit: currentCircuit - 1,
        currentExercise: prevCircuit.exercises.length - 1,
        currentSet: activeSession.workout.setsPerCircuit - 1,
      });
    }
  },

  /**
   * Complete the workout session
   */
  completeSession: async (data) => {
    try {
      const { sessionId } = get();
      if (!sessionId) throw new Error('No active session');

      await sessionsApi.complete(sessionId, data);
      get().reset();
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  },

  /**
   * Cancel the workout session
   */
  cancelSession: async () => {
    try {
      const { sessionId } = get();
      if (!sessionId) throw new Error('No active session');

      await sessionsApi.cancel(sessionId);
      get().reset();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      throw error;
    }
  },

  /**
   * Update progress on backend
   */
  updateProgress: async () => {
    try {
      const { sessionId, activeSession, currentCircuit, completedExercises } = get();
      if (!sessionId || !activeSession) return;

      const totalExercises = activeSession.workout.totalExercises;
      const completionPercentage = (completedExercises / totalExercises) * 100;

      await sessionsApi.updateProgress(sessionId, {
        circuitsCompleted: currentCircuit,
        totalExercisesCompleted: completedExercises,
        completionPercentage,
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  },

  /**
   * Set elapsed time (called by timer)
   */
  setElapsedTime: (time: number) => {
    set({ elapsedTime: time });
  },

  /**
   * Reset session state
   */
  reset: () => {
    set({
      activeSession: null,
      sessionId: null,
      currentCircuit: 0,
      currentExercise: 0,
      currentSet: 0,
      isPaused: false,
      elapsedTime: 0,
      completedExercises: 0,
    });
  },
}));
