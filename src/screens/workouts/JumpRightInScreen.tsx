import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { workoutsApi, sessionsApi } from '../../api';
import { useWorkoutStore } from '../../stores';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'JumpRightIn'>;

const JumpRightInScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setCurrentWorkout } = useWorkoutStore();
  const [isLoading, setIsLoading] = useState(false);
  const [workout, setWorkout] = useState<any>(null);

  const generateWorkout = async () => {
    try {
      setIsLoading(true);
      const response = await workoutsApi.jumpRightIn();

      setWorkout(response.data);
      setCurrentWorkout(response.data);
    } catch (error: any) {
      console.error('Failed to generate workout:', error);
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
    // Navigate directly to execution screen
    navigation.navigate('WorkoutExecution', { workoutId: workout.id });
  };

  if (isLoading && !workout) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Generating your workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>⚡️</Text>
          <Text style={styles.title}>Jump Right In</Text>
          <Text style={styles.description}>
            We'll generate a workout based on your preferences and fitness level.
            No setup required!
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Tailored to your fitness level</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Based on your preferences</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>Ready in seconds</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateWorkout}
            disabled={isLoading}
          >
            <Text style={styles.generateButtonText}>
              Generate Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutTitle}>{workout.name}</Text>
        {workout.description && (
          <Text style={styles.workoutDescription}>{workout.description}</Text>
        )}
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
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{workout.difficultyLevel}</Text>
          <Text style={styles.statLabel}>Level</Text>
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
          style={styles.regenerateButton}
          onPress={generateWorkout}
          disabled={isLoading}
        >
          <Text style={styles.regenerateButtonText}>
            Generate New Workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          onPress={startWorkout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>
              Start Workout
            </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
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
  workoutDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
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
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  regenerateButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  regenerateButtonText: {
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

export default JumpRightInScreen;
