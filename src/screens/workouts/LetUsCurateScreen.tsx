import React, { useState, useEffect } from 'react';
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
import { HomeStackParamList } from '../../navigation/types';
import { workoutsApi, sessionsApi } from '../../api';
import { useWorkoutStore } from '../../stores';
import type { WorkoutObjective, WorkoutConstraints } from '../../types/api';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'LetUsCurate'>;
type RoutePropType = RouteProp<HomeStackParamList, 'LetUsCurate'>;

const LetUsCurateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { objectives, loadObjectives, setCurrentWorkout } = useWorkoutStore();

  const [selectedObjective, setSelectedObjective] = useState<WorkoutObjective | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [workout, setWorkout] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Constraints
  const [difficulty, setDifficulty] = useState<string>('intermediate');
  const [duration, setDuration] = useState<number>(20);
  const [smallSpace, setSmallSpace] = useState<boolean>(false);
  const [quiet, setQuiet] = useState<boolean>(false);

  useEffect(() => {
    if (objectives.length === 0) {
      loadObjectives();
    }

    // If objective slug provided in route params
    if (route.params?.objectiveSlug) {
      const objective = objectives.find(o => o.slug === route.params.objectiveSlug);
      if (objective) {
        setSelectedObjective(objective);
        setShowCustomization(true);
      }
    }
  }, [objectives, route.params]);

  const generateWorkout = async () => {
    if (!selectedObjective) return;

    try {
      setIsLoading(true);

      const constraints: WorkoutConstraints = {
        difficulty,
        durationMinutes: duration,
        smallSpace,
        quiet,
      };

      const response = await workoutsApi.letUsCurate({
        objectiveSlug: selectedObjective.slug,
        constraints,
      });

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

  if (isLoading && objectives.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (workout) {
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
              style={styles.backButton}
              onPress={() => {
                setWorkout(null);
                setShowCustomization(true);
              }}
            >
              <Text style={styles.backButtonText}>Customize Again</Text>
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
                <Text style={styles.startButtonText}>Start Workout</Text>
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
  }

  if (showCustomization && selectedObjective) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Customize Your Workout</Text>
          <Text style={styles.subtitle}>{selectedObjective.name}</Text>
        </View>

        <View style={styles.customizationSection}>
          <Text style={styles.optionLabel}>Difficulty</Text>
          <View style={styles.optionsRow}>
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  difficulty === level && styles.optionButtonActive,
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    difficulty === level && styles.optionButtonTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.optionLabel}>Duration (minutes)</Text>
          <View style={styles.optionsRow}>
            {[15, 20, 30, 45].map((min) => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.optionButton,
                  duration === min && styles.optionButtonActive,
                ]}
                onPress={() => setDuration(min)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    duration === min && styles.optionButtonTextActive,
                  ]}
                >
                  {min}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.optionLabel}>Constraints</Text>
          <TouchableOpacity
            style={styles.constraintOption}
            onPress={() => setSmallSpace(!smallSpace)}
          >
            <Text style={styles.constraintText}>Small Space</Text>
            <View style={[styles.checkbox, smallSpace && styles.checkboxActive]}>
              {smallSpace && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.constraintOption}
            onPress={() => setQuiet(!quiet)}
          >
            <Text style={styles.constraintText}>Quiet (No jumping)</Text>
            <View style={[styles.checkbox, quiet && styles.checkboxActive]}>
              {quiet && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
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
              <Text style={styles.generateButtonText}>Generate Workout</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Goal</Text>
        <Text style={styles.subtitle}>Select a workout objective</Text>
      </View>

      <View style={styles.objectivesContainer}>
        {objectives.map((objective) => (
          <TouchableOpacity
            key={objective.id}
            style={styles.objectiveCard}
            onPress={() => {
              setSelectedObjective(objective);
              setShowCustomization(true);
            }}
          >
            <Text style={styles.objectiveTitle}>{objective.name}</Text>
            <Text style={styles.objectiveDescription}>
              {objective.description}
            </Text>
            {objective.tagline && (
              <Text style={styles.objectiveTagline}>{objective.tagline}</Text>
            )}
          </TouchableOpacity>
        ))}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  objectivesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  objectiveCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  objectiveTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  objectiveDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 6,
  },
  objectiveTagline: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '500',
  },
  customizationSection: {
    padding: 20,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#FF6B35',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  constraintOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  constraintText: {
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    textTransform: 'capitalize',
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

export default LetUsCurateScreen;
