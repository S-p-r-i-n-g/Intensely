import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const generateWorkout = async () => {
    try {
      setIsLoading(true);
      const response = await workoutsApi.jumpRightIn();

      setWorkout(response.data);
      setCurrentWorkout(response.data);
    } catch (error: any) {
      console.error('Failed to generate workout:', error);

      // Extract error message
      let errorMessage = 'Could not generate workout. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Generation Failed',
        errorMessage + '\n\nTip: Make sure the backend server is running.',
        [{ text: 'OK' }]
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

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workout) return;

    try {
      setIsDeleting(true);
      await workoutsApi.delete(workout.id);
      setShowDeleteModal(false);
      Alert.alert('Success', 'Workout deleted successfully');
      setWorkout(null); // Reset to initial state
    } catch (error: any) {
      console.error('Failed to delete workout:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not delete workout. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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
    <>
      <ScrollView style={styles.container}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          {workout.description && (
            <Text style={styles.workoutDescription}>{workout.description}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeletePress}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
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
          {workout.circuits?.map((circuit: any, index: number) => (
            <View key={circuit.id} style={styles.circuitCard}>
              <Text style={styles.circuitTitle}>Circuit {index + 1}</Text>
              <Text style={styles.circuitInfo}>
                {workout.setsPerCircuit} sets × {circuit.exercises.length} exercises
              </Text>
              <View style={styles.exercisesList}>
                {circuit.exercises.map((ex: any, exIndex: number) => (
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
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={generateWorkout}
            disabled={isLoading}
          >
            <Text style={styles.regenerateButtonText}>
              Generate New Workout
            </Text>
          </TouchableOpacity>

          <Text style={styles.readyText}>Ready to start?</Text>
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Workout?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{workout.name}"? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleDeleteCancel}
                disabled={isDeleting}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FEE',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteButtonText: {
    color: '#DC2626',
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
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalCancelButton: {
    backgroundColor: '#F5F5F5',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalDeleteButton: {
    backgroundColor: '#DC2626',
  },
  modalDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default JumpRightInScreen;
