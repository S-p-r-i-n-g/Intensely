import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { workoutsApi } from '../../api';
import { useWorkoutStore, useAuthStore } from '../../stores';
import { Button, Text, Card, Input } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, borderRadius, colors } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'TakeTheWheel'>;
type RoutePropType = RouteProp<HomeStackParamList, 'TakeTheWheel'>;

const TakeTheWheelScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();
  const { setCurrentWorkout } = useWorkoutStore();
  const { user } = useAuthStore();

  const isEditMode = !!route.params?.workoutId;
  const [isLoading, setIsLoading] = useState(false);
  const [workout, setWorkout] = useState<any>(null);

  // Workout customization state - initialize from route params if available
  const [workoutName, setWorkoutName] = useState(route.params?.workoutName || '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(
    route.params?.selectedExerciseIds || []
  );
  const [circuits, setCircuits] = useState(route.params?.circuits || 3);
  const [setsPerCircuit, setSetsPerCircuit] = useState(route.params?.setsPerCircuit || 3);
  const [workInterval, setWorkInterval] = useState(route.params?.workInterval || 20);
  const [restInterval, setRestInterval] = useState(route.params?.restInterval || 60);

  // Update selected exercises when returning from ExerciseSelection
  useEffect(() => {
    if (route.params?.selectedExerciseIds) {
      setSelectedExerciseIds(route.params.selectedExerciseIds);
    }
    if (route.params?.workoutName) {
      setWorkoutName(route.params.workoutName);
    }
    if (route.params?.circuits !== undefined) {
      setCircuits(route.params.circuits);
    }
    if (route.params?.setsPerCircuit !== undefined) {
      setSetsPerCircuit(route.params.setsPerCircuit);
    }
    if (route.params?.workInterval !== undefined) {
      setWorkInterval(route.params.workInterval);
    }
    if (route.params?.restInterval !== undefined) {
      setRestInterval(route.params.restInterval);
    }
  }, [route.params]);

  // Validate workout name for duplicates
  useEffect(() => {
    const checkNameUniqueness = async () => {
      if (!workoutName.trim() || !user) {
        setNameError(null);
        return;
      }

      try {
        const response = await workoutsApi.getAll({});
        const duplicate = response.data.find(
          (w: any) =>
            w.name.toLowerCase() === workoutName.trim().toLowerCase() &&
            w.createdBy === user.id &&
            !w.deletedAt &&
            w.id !== route.params?.workoutId // Exclude current workout in edit mode
        );

        if (duplicate) {
          setNameError('You already have a workout with this name');
        } else {
          setNameError(null);
        }
      } catch (error) {
        console.error('Error checking workout name:', error);
        // Don't block user if check fails
        setNameError(null);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkNameUniqueness, 500);
    return () => clearTimeout(timeoutId);
  }, [workoutName, user, route.params?.workoutId]);

  const generateWorkout = async () => {
    if (selectedExerciseIds.length === 0) {
      Alert.alert('No Exercises', 'Please select at least one exercise to create a workout.');
      return;
    }

    if (!workoutName.trim()) {
      Alert.alert('Missing Name', 'Please give your workout a name.');
      return;
    }

    if (nameError) {
      Alert.alert('Invalid Name', nameError);
      return;
    }

    try {
      setIsLoading(true);

      if (isEditMode && route.params?.workoutId) {
        // Update existing workout by deleting and recreating
        // This allows updating the full workout structure (circuits, exercises, etc.)
        // not just metadata

        // Delete the old workout first
        await workoutsApi.delete(route.params.workoutId);

        // Build circuits array - each circuit has the same exercises
        const circuitsData = Array.from({ length: circuits }, () => ({
          exercises: selectedExerciseIds,
          sets: setsPerCircuit,
          intervalSeconds: workInterval,
          restSeconds: restInterval,
        }));

        const params = {
          name: workoutName,
          circuits: circuitsData,
          intervalSeconds: workInterval,
          restSeconds: restInterval,
          sets: setsPerCircuit,
        };

        // Create the new workout
        const response = await workoutsApi.takeTheWheel(params);

        // Navigate back to WorkoutPreview with the NEW workout ID
        // @ts-ignore - navigating across stacks
        navigation.navigate('Workouts', {
          screen: 'WorkoutPreview',
          params: { workoutId: response.data.id }
        });
      } else {
        // Create new workout
        // Build circuits array - each circuit has the same exercises
        const circuitsData = Array.from({ length: circuits }, () => ({
          exercises: selectedExerciseIds,
          sets: setsPerCircuit,
          intervalSeconds: workInterval,
          restSeconds: restInterval,
        }));

        const params = {
          name: workoutName,
          circuits: circuitsData,
          intervalSeconds: workInterval,
          restSeconds: restInterval,
          sets: setsPerCircuit,
        };

        const response = await workoutsApi.takeTheWheel(params);
        setWorkout(response.data);
        setCurrentWorkout(response.data);
      }
    } catch (error: any) {
      console.error('Failed to save workout:', error);
      Alert.alert(
        isEditMode ? 'Update Failed' : 'Generation Failed',
        error.response?.data?.message || `Could not ${isEditMode ? 'update' : 'generate'} workout. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkout = () => {
    if (!workout) return;
    navigation.navigate('WorkoutExecution', { workoutId: workout.id });
  };

  if (workout) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.workoutHeader}>
          <Text variant="h2" style={styles.workoutTitle}>
            {workout.name}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Card variant="flat" padding="medium" style={styles.statBox}>
            <Text variant="h3" style={styles.statValue}>
              {workout.totalCircuits}
            </Text>
            <Text variant="caption" color="secondary">
              Circuits
            </Text>
          </Card>
          <Card variant="flat" padding="medium" style={styles.statBox}>
            <Text variant="h3" style={styles.statValue}>
              {workout.estimatedDurationMinutes}
            </Text>
            <Text variant="caption" color="secondary">
              Minutes
            </Text>
          </Card>
          <Card variant="flat" padding="medium" style={styles.statBox}>
            <Text variant="h3" style={styles.statValue}>
              {workout.estimatedCalories}
            </Text>
            <Text variant="caption" color="secondary">
              Calories
            </Text>
          </Card>
        </View>

        <View style={styles.circuitsSection}>
          <Text variant="h2" style={styles.sectionTitle}>
            Circuits
          </Text>
          {workout.circuits?.map((circuit: any, index: number) => (
            <Card key={circuit.id} variant="flat" padding="medium" style={styles.circuitCard}>
              <Text variant="h3" style={styles.circuitTitle}>
                Circuit {index + 1}
              </Text>
              <Text variant="bodySmall" color="secondary" style={styles.circuitInfo}>
                {circuit.exercises.length} exercises • {workout.setsPerCircuit} sets
              </Text>
              <View style={styles.exercisesList}>
                {circuit.exercises.map((ex: any) => (
                  <Text key={ex.id} variant="body" style={styles.exerciseItem}>
                    • {ex.exercise.name}
                  </Text>
                ))}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="secondary"
            fullWidth
            onPress={() => {
              setWorkout(null);
            }}
            style={styles.backButton}
          >
            Customize Again
          </Button>

          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={startWorkout}
          >
            Start Workout
          </Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>
          Build Your Workout
        </Text>
        <Text variant="body" color="secondary">
          Customize every aspect of your workout
        </Text>
      </View>

      {/* Workout Name */}
      <View style={styles.section}>
        <Input
          label="Workout Name"
          placeholder="Enter workout name"
          value={workoutName}
          onChangeText={setWorkoutName}
          error={nameError || undefined}
        />
      </View>

      {/* Exercise Selection */}
      <View style={styles.section}>
        <Text variant="bodyLarge" style={styles.sectionLabel}>
          Exercises
        </Text>
        <Card
          variant="flat"
          padding="medium"
          onPress={() => {
            navigation.navigate('ExerciseSelection', {
              selectedIds: selectedExerciseIds,
              workoutName,
              circuits,
              setsPerCircuit,
              workInterval,
              restInterval,
            });
          }}
          style={styles.selectButton}
        >
          <Text variant="body" style={styles.selectButtonText}>
            {selectedExerciseIds.length > 0
              ? `${selectedExerciseIds.length} exercises selected`
              : 'Select Exercises'}
          </Text>
          <Text style={styles.selectButtonArrow}>→</Text>
        </Card>
      </View>

      {/* Circuits */}
      <View style={styles.section}>
        <Text variant="bodyLarge" style={styles.sectionLabel}>
          Number of Circuits
        </Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={[styles.counterButton, { backgroundColor: theme.background.elevated }]}
            onPress={() => setCircuits(Math.max(1, circuits - 1))}
          >
            <Text variant="h3">−</Text>
          </TouchableOpacity>
          <Text variant="display" style={styles.counterValue}>
            {circuits}
          </Text>
          <TouchableOpacity
            style={[styles.counterButton, { backgroundColor: theme.background.elevated }]}
            onPress={() => setCircuits(Math.min(10, circuits + 1))}
          >
            <Text variant="h3">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sets per Circuit */}
      <View style={styles.section}>
        <Text variant="bodyLarge" style={styles.sectionLabel}>
          Sets per Circuit
        </Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={[styles.counterButton, { backgroundColor: theme.background.elevated }]}
            onPress={() => setSetsPerCircuit(Math.max(1, setsPerCircuit - 1))}
          >
            <Text variant="h3">−</Text>
          </TouchableOpacity>
          <Text variant="display" style={styles.counterValue}>
            {setsPerCircuit}
          </Text>
          <TouchableOpacity
            style={[styles.counterButton, { backgroundColor: theme.background.elevated }]}
            onPress={() => setSetsPerCircuit(Math.min(5, setsPerCircuit + 1))}
          >
            <Text variant="h3">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Work */}
      <View style={styles.section}>
        <Text variant="bodyLarge" style={styles.sectionLabel}>
          Work (seconds)
        </Text>
        <View style={styles.intervalButtons}>
          {[10, 15, 20, 30, 45, 60].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.intervalButton,
                { backgroundColor: theme.background.elevated, borderColor: theme.border.medium },
                workInterval === seconds && styles.intervalButtonActive,
              ]}
              onPress={() => setWorkInterval(seconds)}
            >
              <Text
                variant="body"
                style={[
                  workInterval === seconds && styles.intervalButtonTextActive,
                ]}
              >
                {seconds}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rest */}
      <View style={styles.section}>
        <Text variant="bodyLarge" style={styles.sectionLabel}>
          Rest (seconds)
        </Text>
        <View style={styles.intervalButtons}>
          {[15, 30, 60, 90, 120].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.intervalButton,
                { backgroundColor: theme.background.elevated, borderColor: theme.border.medium },
                restInterval === seconds && styles.intervalButtonActive,
              ]}
              onPress={() => setRestInterval(seconds)}
            >
              <Text
                variant="body"
                style={[
                  restInterval === seconds && styles.intervalButtonTextActive,
                ]}
              >
                {seconds}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {isEditMode && (
          <Button
            variant="secondary"
            fullWidth
            onPress={() => {
              // @ts-ignore - navigating across stacks
              navigation.navigate('Workouts', {
                screen: 'WorkoutPreview',
                params: { workoutId: route.params?.workoutId }
              });
            }}
            disabled={isLoading}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          size="large"
          fullWidth
          onPress={generateWorkout}
          loading={isLoading}
          disabled={isLoading || !!nameError}
        >
          {isEditMode ? 'Update Workout' : 'Create Workout'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[8],
  },
  title: {
    marginBottom: spacing[2],
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontWeight: '500',
  },
  selectButtonArrow: {
    fontSize: 18,
    color: colors.secondary[400],
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[6],
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    minWidth: 60,
    textAlign: 'center',
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  intervalButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.md,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
  },
  intervalButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  intervalButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  cancelButton: {
    marginBottom: spacing[3],
  },
  workoutHeader: {
    padding: spacing[5],
    paddingTop: spacing[8],
  },
  workoutTitle: {
    marginBottom: spacing[2],
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary[500],
    marginBottom: spacing[1],
  },
  circuitsSection: {
    padding: spacing[5],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  circuitCard: {
    marginBottom: spacing[3],
  },
  circuitTitle: {
    marginBottom: spacing[1],
  },
  circuitInfo: {
    marginBottom: spacing[3],
  },
  exercisesList: {
    marginTop: spacing[2],
  },
  exerciseItem: {
    marginBottom: spacing[1],
  },
  backButton: {
    marginBottom: spacing[3],
  },
});

export default TakeTheWheelScreen;
