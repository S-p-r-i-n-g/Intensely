import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, SkeletonLoader, SkeletonText, SkeletonButton } from '../../components/ui';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { workoutsApi, sessionsApi } from '../../api';
import type { Workout, Circuit, CircuitExercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'WorkoutExecution'>;
type RoutePropType = RouteProp<HomeStackParamList, 'WorkoutExecution'>;

const { width } = Dimensions.get('window');

type IntervalType = 'work' | 'rest' | 'circuitRest';

const WorkoutExecutionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();

  // Workout data
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Progress tracking
  const [currentCircuitIndex, setCurrentCircuitIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Timer state
  const [intervalType, setIntervalType] = useState<IntervalType>('work');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoProgressRef = useRef(true);

  useEffect(() => {
    loadWorkoutAndStartSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Auto-restart timer when exercise/set/circuit changes or time is reset
  useEffect(() => {
    if (workout && !isPaused && timeRemaining > 0 && shouldAutoProgressRef.current) {
      console.log('Timer restart triggered:', {
        exercise: currentExerciseIndex,
        set: currentSetIndex,
        circuit: currentCircuitIndex,
        intervalType,
        timeRemaining
      });
      // Clear any existing timer
      if (timerRef.current) clearInterval(timerRef.current);

      // Start new timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer reached 0, move to next interval on next tick
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeout(() => moveToNextInterval(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workout, currentExerciseIndex, currentSetIndex, currentCircuitIndex, intervalType, timeRemaining, isPaused]);

  const loadWorkoutAndStartSession = async () => {
    try {
      shouldAutoProgressRef.current = false; // Prevent auto-start during load
      const response = await workoutsApi.getById(route.params.workoutId);
      const workoutData = response.data;
      setWorkout(workoutData);

      // Start session
      console.log('Starting workout session for workout:', workoutData.id);
      const sessionResponse = await sessionsApi.start(workoutData.id);
      console.log('Session started:', sessionResponse.data);
      setSessionId(sessionResponse.data.sessionId);

      // Initialize first interval
      setTimeRemaining(workoutData.intervalSeconds);
      setIntervalType('work');

      // Enable auto-progress and start timers
      shouldAutoProgressRef.current = true;
      startElapsedTimer();
    } catch (error: any) {
      console.error('Failed to load workout or start session:', error);
      console.error('Error details:', error.response?.data || error.message);

      const errorMessage = error.response?.status === 401
        ? 'You must be signed in to start a workout session.'
        : error.response?.data?.message || 'Could not load workout. Please try again.';

      Alert.alert('Error', errorMessage);
      navigation.goBack();
    }
  };


  const startElapsedTimer = () => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      setTotalElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
  };

  const moveToNextInterval = () => {
    if (!workout) return;

    const currentCircuit = workout.circuits![currentCircuitIndex];
    const isLastExerciseInCircuit = currentExerciseIndex === currentCircuit.exercises.length - 1;

    if (intervalType === 'work') {
      // After work interval, check if we need rest or move to next exercise
      if (isLastExerciseInCircuit) {
        // Last exercise in set - move to rest
        setIntervalType('rest');
        setTimeRemaining(workout.restSeconds);
      } else {
        // Not last exercise - move directly to next exercise (no rest)
        setCurrentExerciseIndex((prev) => prev + 1);
        setTimeRemaining(workout.intervalSeconds);
        // intervalType stays as 'work'
      }
    } else if (intervalType === 'rest') {
      // After rest, move to next set or circuit
      moveToNextSet();
    } else if (intervalType === 'circuitRest') {
      // After circuit rest, start next circuit
      setIntervalType('work');
      setTimeRemaining(workout.intervalSeconds);
    }
  };

  const moveToNextSet = () => {
    if (!workout) return;

    const isLastSet = currentSetIndex === workout.setsPerCircuit - 1;

    if (isLastSet) {
      // Move to next circuit or finish workout
      const isLastCircuit = currentCircuitIndex === workout.circuits!.length - 1;

      if (isLastCircuit) {
        completeWorkout();
        return;
      } else {
        // Move to next circuit
        setCurrentCircuitIndex((prev) => prev + 1);
        setCurrentSetIndex(0);
        setCurrentExerciseIndex(0);
        setIntervalType('circuitRest');
        setTimeRemaining(workout.circuitRestSeconds || 60);
      }
    } else {
      // Move to next set, back to first exercise
      setCurrentSetIndex((prev) => prev + 1);
      setCurrentExerciseIndex(0);
      setIntervalType('work');
      setTimeRemaining(workout.intervalSeconds);
    }
  };

  const moveToPreviousExercise = () => {
    if (!workout) return;

    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setIntervalType('work');
      setTimeRemaining(workout.intervalSeconds);
    } else if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
      setCurrentExerciseIndex(workout.circuits![currentCircuitIndex].exercises.length - 1);
      setIntervalType('work');
      setTimeRemaining(workout.intervalSeconds);
    } else if (currentCircuitIndex > 0) {
      const prevCircuit = workout.circuits![currentCircuitIndex - 1];
      setCurrentCircuitIndex(currentCircuitIndex - 1);
      setCurrentSetIndex(workout.setsPerCircuit - 1);
      setCurrentExerciseIndex(prevCircuit.exercises.length - 1);
      setIntervalType('work');
      setTimeRemaining(workout.intervalSeconds);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume - useEffect will restart countdown timer
      startElapsedTimer();
      setIsPaused(false);
    } else {
      stopTimer();
      setIsPaused(true);
    }
  };

  const completeWorkout = async () => {
    stopTimer();

    if (!sessionId) {
      Alert.alert('Error', 'Session not found');
      navigation.goBack();
      return;
    }

    try {
      await sessionsApi.complete(sessionId, {
        durationSeconds: totalElapsedTime,
        caloriesBurned: workout?.estimatedCalories,
      });

      navigation.replace('WorkoutComplete', {
        sessionId,
        durationSeconds: totalElapsedTime,
        caloriesBurned: workout?.estimatedCalories,
      });
    } catch (error: any) {
      console.error('Failed to complete workout:', error);
      Alert.alert('Error', 'Could not save workout completion');
    }
  };

  const handleQuit = () => {
    console.log('Quit button pressed, showing modal');
    setShowQuitModal(true);
  };

  const confirmQuit = async () => {
    console.log('Confirm quit pressed');
    setShowQuitModal(false);
    stopTimer();

    // Try to cancel session, but don't block navigation on failure
    if (sessionId) {
      sessionsApi.cancel(sessionId).catch((error) => {
        console.warn('Failed to cancel session (session may not exist):', error.message);
      });
    }

    console.log('Navigating back to home');
    // Use popToTop to go back to the root of the stack (HomeMain)
    setTimeout(() => {
      navigation.popToTop();
    }, 100);
  };

  const cancelQuit = () => {
    console.log('Cancel quit pressed');
    setShowQuitModal(false);
  };

  if (!workout || !workout.circuits) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.skeletonContainer}>
          <SkeletonText lines={1} style={styles.skeletonTitle} />
          <SkeletonLoader width="100%" height={120} style={styles.skeletonTimer} />
          <View style={styles.skeletonControls}>
            <SkeletonButton style={{ flex: 1 }} />
            <SkeletonButton style={{ flex: 1.5 }} />
            <SkeletonButton style={{ flex: 1 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentCircuit = workout.circuits[currentCircuitIndex];
  const currentExercise = currentCircuit.exercises[currentExerciseIndex];
  const totalExercisesInCircuit = currentCircuit.exercises.length;
  const totalExercises = workout.circuits.reduce((sum, c) => sum + c.exercises.length, 0) * workout.setsPerCircuit * workout.totalCircuits;
  const completedExercises =
    (currentCircuitIndex * currentCircuit.exercises.length * workout.setsPerCircuit) +
    (currentSetIndex * totalExercisesInCircuit) +
    currentExerciseIndex;
  const progressPercentage = (completedExercises / totalExercises) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          onPress={handleQuit}
          style={styles.quitButton}
          textStyle={styles.quitButtonText}
        >
          ✕ Quit
        </Button>
        <Text style={[styles.elapsedTime, { color: theme.text.primary }]}>{formatTime(totalElapsedTime)}</Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border.medium }]}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>

      {/* Circuit/Set/Exercise Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.circuitInfo} color="secondary">
          Circuit {currentCircuitIndex + 1} of {workout.totalCircuits} • Set {currentSetIndex + 1} of {workout.setsPerCircuit}
        </Text>
        <Text style={styles.exerciseCounter} color="tertiary">
          Exercise {currentExerciseIndex + 1} of {totalExercisesInCircuit}
        </Text>
      </View>

      {/* Main Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.intervalLabel} color="tertiary">
          {intervalType === 'work' ? 'WORK' : intervalType === 'rest' ? 'REST' : 'CIRCUIT REST'}
        </Text>
        <Text
          style={[styles.timerText, intervalType === 'work' ? styles.timerWork : styles.timerRest]}
          maxFontSizeMultiplier={1.2}
        >
          {formatTime(timeRemaining)}
        </Text>
      </View>

      {/* Exercise Display */}
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseTitle} color="primary">{currentExercise.exercise.name}</Text>
        {currentExercise.exercise.instructions && (
          <Text style={styles.exerciseInstructions} color="secondary">
            {currentExercise.exercise.instructions}
          </Text>
        )}
        {currentExercise.exercise.targetMuscleGroups && currentExercise.exercise.targetMuscleGroups.length > 0 && (
          <View style={styles.muscleGroupsContainer}>
            {currentExercise.exercise.targetMuscleGroups.map((muscle) => (
              <View key={muscle} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <Button
          variant="secondary"
          onPress={moveToPreviousExercise}
          disabled={currentCircuitIndex === 0 && currentSetIndex === 0 && currentExerciseIndex === 0}
          style={{ flex: 1 }}
        >
          ← Previous
        </Button>

        <Button
          variant="primary"
          onPress={togglePause}
          style={{ flex: 1.5 }}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </Button>

        <Button
          variant="secondary"
          onPress={moveToNextInterval}
          style={{ flex: 1 }}
        >
          Skip →
        </Button>
      </View>

      {/* Quit Confirmation Modal */}
      <Modal
        visible={showQuitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelQuit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background.elevated }]}>
            <Text style={styles.modalTitle} color="primary">Quit Workout?</Text>
            <Text style={styles.modalMessage} color="secondary">
              Are you sure you want to quit? Your progress will not be saved.
            </Text>
            <View style={styles.modalButtons}>
              <Button
                variant="secondary"
                onPress={cancelQuit}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={confirmQuit}
                style={[styles.modalButton, styles.modalQuitButton]}
              >
                Quit
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    gap: spacing[6],
  },
  skeletonTitle: {
    marginBottom: spacing[2],
  },
  skeletonTimer: {
    borderRadius: borderRadius.md,
  },
  skeletonControls: {
    flexDirection: 'row',
    gap: spacing[5],
    marginTop: 'auto',
    paddingBottom: spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  quitButton: {
    padding: spacing[2],
  },
  quitButtonText: {
    fontSize: 16,
    color: colors.error[500],
    fontWeight: '600',
  },
  elapsedTime: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    marginHorizontal: spacing[5],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  infoContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  circuitInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseCounter: {
    fontSize: 14,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  intervalLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing[4],
  },
  timerText: {
    fontSize: 96,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerWork: {
    color: colors.primary[500],
  },
  timerRest: {
    color: colors.success[500],
  },
  exerciseContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[6],
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  exerciseInstructions: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  muscleTag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  muscleTagText: {
    fontSize: 12,
    color: colors.primary[500],
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[5],
    gap: spacing[5],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: spacing[6],
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
  modalQuitButton: {
    backgroundColor: colors.error[500],
  },
});

export default WorkoutExecutionScreen;
