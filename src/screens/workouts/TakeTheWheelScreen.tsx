import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { workoutsApi } from '../../api';
import { useWorkoutStore } from '../../stores';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'TakeTheWheel'>;
type RoutePropType = RouteProp<HomeStackParamList, 'TakeTheWheel'>;

const TakeTheWheelScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { setCurrentWorkout } = useWorkoutStore();

  const [isLoading, setIsLoading] = useState(false);
  const [workout, setWorkout] = useState<any>(null);

  // Workout customization state
  const [workoutName, setWorkoutName] = useState('My Custom Workout');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  // Update selected exercises when returning from ExerciseSelection
  useEffect(() => {
    if (route.params?.selectedExerciseIds) {
      setSelectedExerciseIds(route.params.selectedExerciseIds);
    }
  }, [route.params?.selectedExerciseIds]);
  const [circuits, setCircuits] = useState(3);
  const [setsPerCircuit, setSetsPerCircuit] = useState(2);
  const [workInterval, setWorkInterval] = useState(45);
  const [restInterval, setRestInterval] = useState(15);
  const [circuitRest, setCircuitRest] = useState(60);

  const generateWorkout = async () => {
    if (selectedExerciseIds.length === 0) {
      Alert.alert('No Exercises', 'Please select at least one exercise to create a workout.');
      return;
    }

    if (!workoutName.trim()) {
      Alert.alert('Missing Name', 'Please give your workout a name.');
      return;
    }

    try {
      setIsLoading(true);

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
    } catch (error: any) {
      console.error('Failed to generate custom workout:', error);
      Alert.alert(
        'Generation Failed',
        error.response?.data?.message || 'Could not generate workout. Please try again.'
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
      <ScrollView style={styles.container}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{workout.totalCircuits}</Text>
            <Text style={styles.statLabel}>Circuits</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{workout.estimatedDurationMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{workout.estimatedCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        <View style={styles.circuitsSection}>
          <Text style={styles.sectionTitle}>Circuits</Text>
          {workout.circuits?.map((circuit: any, index: number) => (
            <View key={circuit.id} style={styles.circuitCard}>
              <Text style={styles.circuitTitle}>Circuit {index + 1}</Text>
              <Text style={styles.circuitInfo}>
                {circuit.exercises.length} exercises • {workout.setsPerCircuit} sets
              </Text>
              <View style={styles.exercisesList}>
                {circuit.exercises.map((ex: any) => (
                  <Text key={ex.id} style={styles.exerciseItem}>
                    • {ex.exercise.name}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setWorkout(null);
            }}
          >
            <Text style={styles.backButtonText}>Customize Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startButton}
            onPress={startWorkout}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Build Your Workout</Text>
        <Text style={styles.subtitle}>
          Customize every aspect of your workout
        </Text>
      </View>

      {/* Workout Name */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Workout Name</Text>
        <TextInput
          style={styles.textInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Enter workout name"
          placeholderTextColor="#999"
        />
      </View>

      {/* Exercise Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Exercises</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            navigation.navigate('ExerciseSelection', { selectedIds: selectedExerciseIds });
          }}
        >
          <Text style={styles.selectButtonText}>
            {selectedExerciseIds.length > 0
              ? `${selectedExerciseIds.length} exercises selected`
              : 'Select Exercises'}
          </Text>
          <Text style={styles.selectButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Circuits */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Number of Circuits</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setCircuits(Math.max(1, circuits - 1))}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{circuits}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setCircuits(Math.min(10, circuits + 1))}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sets per Circuit */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Sets per Circuit</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setSetsPerCircuit(Math.max(1, setsPerCircuit - 1))}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{setsPerCircuit}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setSetsPerCircuit(Math.min(5, setsPerCircuit + 1))}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Work Interval */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Work Interval (seconds)</Text>
        <View style={styles.intervalButtons}>
          {[30, 45, 60, 90].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.intervalButton,
                workInterval === seconds && styles.intervalButtonActive,
              ]}
              onPress={() => setWorkInterval(seconds)}
            >
              <Text
                style={[
                  styles.intervalButtonText,
                  workInterval === seconds && styles.intervalButtonTextActive,
                ]}
              >
                {seconds}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rest Interval */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Rest Interval (seconds)</Text>
        <View style={styles.intervalButtons}>
          {[10, 15, 20, 30].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.intervalButton,
                restInterval === seconds && styles.intervalButtonActive,
              ]}
              onPress={() => setRestInterval(seconds)}
            >
              <Text
                style={[
                  styles.intervalButtonText,
                  restInterval === seconds && styles.intervalButtonTextActive,
                ]}
              >
                {seconds}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Circuit Rest */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Circuit Rest (seconds)</Text>
        <View style={styles.intervalButtons}>
          {[30, 60, 90, 120].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.intervalButton,
                circuitRest === seconds && styles.intervalButtonActive,
              ]}
              onPress={() => setCircuitRest(seconds)}
            >
              <Text
                style={[
                  styles.intervalButtonText,
                  circuitRest === seconds && styles.intervalButtonTextActive,
                ]}
              >
                {seconds}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateWorkout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Create Workout</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  selectButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectButtonArrow: {
    fontSize: 18,
    color: '#999',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 60,
    textAlign: 'center',
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  intervalButtonActive: {
    backgroundColor: '#FF6B35',
  },
  intervalButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  intervalButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  generateButton: {
    backgroundColor: '#FF6B35',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  workoutHeader: {
    padding: 20,
    paddingTop: 30,
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  circuitsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  circuitCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  circuitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  circuitInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TakeTheWheelScreen;
