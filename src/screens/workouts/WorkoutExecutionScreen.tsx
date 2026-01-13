import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { workoutsApi, sessionsApi } from '../../api';
import type { Workout, Circuit, CircuitExercise } from '../../types/api';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'WorkoutExecution'>;
type RoutePropType = RouteProp<HomeStackParamList, 'WorkoutExecution'>;

const { width } = Dimensions.get('window');

type IntervalType = 'work' | 'rest' | 'circuitRest';

const WorkoutExecutionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

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
    setShowQuitModal(true);
  };

  const confirmQuit = async () => {
    setShowQuitModal(false);
    stopTimer();
    if (sessionId) {
      try {
        await sessionsApi.cancel(sessionId);
      } catch (error) {
        console.error('Failed to cancel session:', error);
      }
    }
    navigation.navigate('HomeMain');
  };

  const cancelQuit = () => {
    setShowQuitModal(false);
  };

  if (!workout || !workout.circuits) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading workout...</Text>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
          <Text style={styles.quitButtonText}>✕ Quit</Text>
        </TouchableOpacity>
        <Text style={styles.elapsedTime}>{formatTime(totalElapsedTime)}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>

      {/* Circuit/Set/Exercise Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.circuitInfo}>
          Circuit {currentCircuitIndex + 1} of {workout.totalCircuits} • Set {currentSetIndex + 1} of {workout.setsPerCircuit}
        </Text>
        <Text style={styles.exerciseCounter}>
          Exercise {currentExerciseIndex + 1} of {totalExercisesInCircuit}
        </Text>
      </View>

      {/* Main Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.intervalLabel}>
          {intervalType === 'work' ? 'WORK' : intervalType === 'rest' ? 'REST' : 'CIRCUIT REST'}
        </Text>
        <Text style={[
          styles.timerText,
          intervalType === 'work' ? styles.timerWork : styles.timerRest
        ]}>
          {formatTime(timeRemaining)}
        </Text>
      </View>

      {/* Exercise Display */}
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseTitle}>{currentExercise.exercise.name}</Text>
        {currentExercise.exercise.instructions && (
          <Text style={styles.exerciseInstructions}>
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
        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={moveToPreviousExercise}
          disabled={currentCircuitIndex === 0 && currentSetIndex === 0 && currentExerciseIndex === 0}
        >
          <Text style={styles.secondaryButtonText}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.primaryButton]}
          onPress={togglePause}
        >
          <Text style={styles.primaryButtonText}>{isPaused ? '▶ Resume' : '⏸ Pause'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={moveToNextInterval}
        >
          <Text style={styles.secondaryButtonText}>Skip →</Text>
        </TouchableOpacity>
      </View>

      {/* Quit Confirmation Modal */}
      <Modal
        visible={showQuitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelQuit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quit Workout?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to quit? Your progress will not be saved.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={cancelQuit}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalQuitButton]}
                onPress={confirmQuit}
              >
                <Text style={styles.modalQuitButtonText}>Quit</Text>
              </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quitButton: {
    padding: 8,
  },
  quitButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  elapsedTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  circuitInfo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseCounter: {
    fontSize: 14,
    color: '#999',
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
    marginBottom: 16,
    color: '#999',
  },
  timerText: {
    fontSize: 96,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerWork: {
    color: '#FF6B35',
  },
  timerRest: {
    color: '#4CAF50',
  },
  exerciseContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  exerciseInstructions: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  muscleTag: {
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  muscleTagText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    flex: 1.5,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
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
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalCancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  modalQuitButton: {
    backgroundColor: '#FF3B30',
  },
  modalQuitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WorkoutExecutionScreen;
