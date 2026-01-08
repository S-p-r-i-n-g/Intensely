import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadWorkoutAndStartSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const loadWorkoutAndStartSession = async () => {
    try {
      const response = await workoutsApi.getById(route.params.workoutId);
      const workoutData = response.data;
      setWorkout(workoutData);

      // Start session
      const sessionResponse = await sessionsApi.start(workoutData.id);
      setSessionId(sessionResponse.data.sessionId);

      // Initialize first interval
      setTimeRemaining(workoutData.intervalSeconds);
      setIntervalType('work');
      startTimer();
      startElapsedTimer();
    } catch (error: any) {
      console.error('Failed to load workout:', error);
      Alert.alert('Error', 'Could not load workout. Please try again.');
      navigation.goBack();
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          moveToNextInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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

    if (intervalType === 'work') {
      // Move to rest after work
      setIntervalType('rest');
      setTimeRemaining(workout.restSeconds);
    } else if (intervalType === 'rest') {
      // Move to next exercise or set or circuit
      moveToNextExercise();
    }
  };

  const moveToNextExercise = () => {
    if (!workout) return;

    const currentCircuit = workout.circuits![currentCircuitIndex];
    const isLastExerciseInCircuit = currentExerciseIndex === currentCircuit.exercises.length - 1;

    if (isLastExerciseInCircuit) {
      // End of circuit - check if we need another set
      const isLastSet = currentSetIndex === workout.setsPerCircuit - 1;

      if (isLastSet) {
        // Move to next circuit or finish workout
        const isLastCircuit = currentCircuitIndex === workout.circuits!.length - 1;

        if (isLastCircuit) {
          completeWorkout();
          return;
        } else {
          // Move to next circuit
          setCurrentCircuitIndex(currentCircuitIndex + 1);
          setCurrentSetIndex(0);
          setCurrentExerciseIndex(0);
          setIntervalType('circuitRest');
          setTimeRemaining(workout.circuitRestSeconds || 60);
        }
      } else {
        // Move to next set, back to first exercise
        setCurrentSetIndex(currentSetIndex + 1);
        setCurrentExerciseIndex(0);
        setIntervalType('work');
        setTimeRemaining(workout.intervalSeconds);
      }
    } else {
      // Move to next exercise in circuit
      setCurrentExerciseIndex(currentExerciseIndex + 1);
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
      startTimer();
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
    Alert.alert(
      'Quit Workout?',
      'Are you sure you want to quit? Your progress will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: async () => {
            stopTimer();
            if (sessionId) {
              try {
                await sessionsApi.cancel(sessionId);
              } catch (error) {
                console.error('Failed to cancel session:', error);
              }
            }
            navigation.navigate('HomeMain');
          },
        },
      ]
    );
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
});

export default WorkoutExecutionScreen;
