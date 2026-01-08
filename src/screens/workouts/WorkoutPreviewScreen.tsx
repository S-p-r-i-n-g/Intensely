import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
import type { Workout } from '../../types/api';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'WorkoutPreview'>;
type RoutePropType = RouteProp<HomeStackParamList, 'WorkoutPreview'>;

const WorkoutPreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [route.params.workoutId]);

  const loadWorkout = async () => {
    try {
      setIsLoading(true);
      const response = await workoutsApi.getById(route.params.workoutId);
      setWorkout(response.data);
    } catch (error: any) {
      console.error('Failed to load workout:', error);
      Alert.alert('Error', 'Could not load workout details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !workout) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{workout.name}</Text>
        {workout.description && (
          <Text style={styles.description}>{workout.description}</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{workout.totalCircuits}</Text>
          <Text style={styles.statLabel}>Circuits</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{workout.setsPerCircuit}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{workout.intervalSeconds}s</Text>
          <Text style={styles.statLabel}>Work</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{workout.restSeconds}s</Text>
          <Text style={styles.statLabel}>Rest</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {workout.estimatedDurationMinutes} min
          </Text>
          <Text style={styles.metricLabel}>Duration</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {workout.estimatedCalories} cal
          </Text>
          <Text style={styles.metricLabel}>Est. Calories</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {workout.difficultyLevel}
          </Text>
          <Text style={styles.metricLabel}>Difficulty</Text>
        </View>
      </View>

      <View style={styles.circuitsSection}>
        <Text style={styles.sectionTitle}>Workout Breakdown</Text>
        {workout.circuits?.map((circuit, circuitIndex) => (
          <View key={circuit.id} style={styles.circuitCard}>
            <Text style={styles.circuitTitle}>
              Circuit {circuitIndex + 1}
            </Text>
            <Text style={styles.circuitInfo}>
              {workout.setsPerCircuit} sets × {circuit.exercises.length} exercises
            </Text>
            <View style={styles.exercisesList}>
              {circuit.exercises.map((ex, exIndex) => (
                <View key={ex.id} style={styles.exerciseItem}>
                  <Text style={styles.exerciseNumber}>{exIndex + 1}</Text>
                  <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Text style={styles.readyText}>Ready to start?</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            navigation.navigate('WorkoutExecution', { workoutId: workout.id });
          }}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF5F2',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  circuitsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  circuitCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  circuitTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  circuitInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default WorkoutPreviewScreen;
