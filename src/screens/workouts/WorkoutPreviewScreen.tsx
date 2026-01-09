import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { WorkoutsStackParamList } from '../../navigation/types';
import { workoutsApi } from '../../api';
import type { Workout } from '../../types/api';

type NavigationProp = NativeStackNavigationProp<WorkoutsStackParamList, 'WorkoutPreview'>;
type RoutePropType = RouteProp<WorkoutsStackParamList, 'WorkoutPreview'>;

const WorkoutPreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleEdit = () => {
    if (!workout) return;

    // Extract exercise IDs from the first circuit (assuming all circuits have the same exercises)
    const selectedExerciseIds = workout.circuits?.[0]?.exercises.map(ex => ex.exerciseId) || [];

    // Navigate to TakeTheWheel with workout data pre-filled
    // @ts-ignore - navigating across stacks
    navigation.navigate('Home', {
      screen: 'TakeTheWheel',
      params: {
        workoutId: workout.id, // Pass the workout ID for updating
        workoutName: workout.name,
        selectedExerciseIds,
        circuits: workout.totalCircuits,
        setsPerCircuit: workout.setsPerCircuit,
        workInterval: workout.intervalSeconds,
        restInterval: workout.restSeconds,
      }
    });
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
      navigation.goBack();
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

  if (isLoading || !workout) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{workout.name}</Text>
          {workout.description && (
            <Text style={styles.description}>{workout.description}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEdit}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
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
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
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

export default WorkoutPreviewScreen;
