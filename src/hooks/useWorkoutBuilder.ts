/**
 * useWorkoutBuilder Hook
 * Manages complex workout builder state with reducer pattern
 * Handles Sync/Customize logic for exercises across circuits
 */

import { useReducer, useCallback } from 'react';

export type WorkoutSettings = {
  work: number;      // Work interval in seconds
  rest: number;      // Rest interval in seconds
  warmUp: number;    // Warm-up duration in seconds
  coolDown: number;  // Cool-down duration in seconds
  circuits: number;  // Number of circuits
  sets: number;      // Sets per circuit
};

export type WorkoutState = {
  name: string;
  settings: WorkoutSettings;
  isSynced: boolean;  // Whether all circuits share the same exercises
  exercises: Record<number, string[]>;  // Key is circuit index: 0, 1, 2...
  activeCircuitTab: number;
  isSettingsExpanded: boolean;
};

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_SETTING'; payload: { key: keyof WorkoutSettings; value: number } }
  | { type: 'SET_SYNCED'; payload: boolean }
  | { type: 'SET_EXERCISES'; payload: { circuitIndex: number; exerciseIds: string[] } }
  | { type: 'SET_TAB'; payload: number }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'RESET' }
  | { type: 'LOAD_WORKOUT'; payload: Partial<WorkoutState> };

const DEFAULT_SETTINGS: WorkoutSettings = {
  work: 30,
  rest: 15,
  warmUp: 0,
  coolDown: 0,
  circuits: 3,
  sets: 3,
};

const initialState: WorkoutState = {
  name: '',
  settings: DEFAULT_SETTINGS,
  isSynced: true,
  exercises: { 0: [] },
  activeCircuitTab: 0,
  isSettingsExpanded: true,
};

function workoutReducer(state: WorkoutState, action: Action): WorkoutState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'SET_SETTING': {
      const newSettings = { ...state.settings, [action.payload.key]: action.payload.value };

      // If circuits changed and we're in customize mode, adjust exercises
      if (action.payload.key === 'circuits' && !state.isSynced) {
        const newCircuits = action.payload.value;
        const newExercises = { ...state.exercises };

        // Add new circuit entries if needed
        for (let i = 0; i < newCircuits; i++) {
          if (!newExercises[i]) {
            // Clone from circuit 0 if available
            newExercises[i] = [...(state.exercises[0] || [])];
          }
        }

        // Remove excess circuit entries
        Object.keys(newExercises).forEach(key => {
          const index = parseInt(key, 10);
          if (index >= newCircuits) {
            delete newExercises[index];
          }
        });

        // Adjust active tab if needed
        const newActiveTab = state.activeCircuitTab >= newCircuits
          ? newCircuits - 1
          : state.activeCircuitTab;

        return {
          ...state,
          settings: newSettings,
          exercises: newExercises,
          activeCircuitTab: newActiveTab,
        };
      }

      return { ...state, settings: newSettings };
    }

    case 'SET_SYNCED': {
      const newIsSynced = action.payload;
      let newExercises = { ...state.exercises };

      if (!newIsSynced) {
        // Sync → Customize: Clone circuit 0 exercises to all circuits
        const baseExercises = state.exercises[0] || [];
        for (let i = 1; i < state.settings.circuits; i++) {
          newExercises[i] = [...baseExercises];
        }
      } else {
        // Customize → Sync: Collapse to circuit 0 only
        newExercises = { 0: [...(state.exercises[0] || [])] };
      }

      return {
        ...state,
        isSynced: newIsSynced,
        exercises: newExercises,
        activeCircuitTab: 0
      };
    }

    case 'SET_EXERCISES':
      return {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.circuitIndex]: action.payload.exerciseIds,
        },
      };

    case 'SET_TAB':
      return { ...state, activeCircuitTab: action.payload };

    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsExpanded: !state.isSettingsExpanded };

    case 'RESET':
      return initialState;

    case 'LOAD_WORKOUT':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function useWorkoutBuilder(initial?: Partial<WorkoutState>) {
  const [state, dispatch] = useReducer(
    workoutReducer,
    initial ? { ...initialState, ...initial } : initialState
  );

  const setName = useCallback((name: string) => {
    dispatch({ type: 'SET_NAME', payload: name });
  }, []);

  const setSetting = useCallback((key: keyof WorkoutSettings, value: number) => {
    dispatch({ type: 'SET_SETTING', payload: { key, value } });
  }, []);

  const setSynced = useCallback((value: boolean) => {
    dispatch({ type: 'SET_SYNCED', payload: value });
  }, []);

  const setExercises = useCallback((circuitIndex: number, exerciseIds: string[]) => {
    dispatch({ type: 'SET_EXERCISES', payload: { circuitIndex, exerciseIds } });
  }, []);

  const setActiveTab = useCallback((tab: number) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  }, []);

  const toggleSettings = useCallback(() => {
    dispatch({ type: 'TOGGLE_SETTINGS' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const loadWorkout = useCallback((workout: Partial<WorkoutState>) => {
    dispatch({ type: 'LOAD_WORKOUT', payload: workout });
  }, []);

  // Get exercises for the current active circuit (or circuit 0 if synced)
  const getCurrentExercises = useCallback(() => {
    if (!state.isSynced) {
      return state.exercises[state.activeCircuitTab] || [];
    }
    return state.exercises[0] || [];
  }, [state.isSynced, state.exercises, state.activeCircuitTab]);

  // Get the circuit index to use for exercise operations
  const getActiveCircuitIndex = useCallback(() => {
    return !state.isSynced ? state.activeCircuitTab : 0;
  }, [state.isSynced, state.activeCircuitTab]);

  // Calculate estimated duration
  const getEstimatedDuration = useCallback(() => {
    const exerciseCount = state.exercises[0]?.length || 0;
    if (exerciseCount === 0) return 0;

    const { work, rest, warmUp, coolDown, circuits, sets } = state.settings;
    const workTime = exerciseCount * work * sets * circuits;
    const restTime = (exerciseCount * sets * circuits - 1) * rest; // Rest between exercises
    const total = warmUp + workTime + restTime + coolDown;

    return Math.ceil(total / 60); // Return in minutes
  }, [state.settings, state.exercises]);

  // Generate summary text for collapsed settings
  const getSettingsSummary = useCallback(() => {
    const { work, rest, circuits, sets } = state.settings;
    return `${circuits} circuits • ${sets} sets • ${work}s work / ${rest}s rest`;
  }, [state.settings]);

  return {
    state,
    dispatch,
    // Actions
    setName,
    setSetting,
    setSynced,
    setExercises,
    setActiveTab,
    toggleSettings,
    reset,
    loadWorkout,
    // Computed
    getCurrentExercises,
    getActiveCircuitIndex,
    getEstimatedDuration,
    getSettingsSummary,
  };
}

export type UseWorkoutBuilderReturn = ReturnType<typeof useWorkoutBuilder>;
