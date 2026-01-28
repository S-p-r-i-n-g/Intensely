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
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';
import { DIFFICULTY_COLORS, DifficultyLevel } from '../../hooks/useWorkoutBuilder';

// Helper to get difficulty color (matches design.md v1.3)
const getDifficultyColor = (level?: string): string => {
  const normalizedLevel = (level?.toLowerCase() || 'intermediate') as DifficultyLevel;
  return DIFFICULTY_COLORS[normalizedLevel] || DIFFICULTY_COLORS.intermediate;
};

// Helper to capitalize first letter
const capitalize = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

type NavigationProp = NativeStackNavigationProp<WorkoutsStackParamList, 'WorkoutPreview'>;
type RoutePropType = RouteProp<WorkoutsStackParamList, 'WorkoutPreview'>;

const WorkoutPreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();
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

    // Navigate to NewWorkout with workout ID for editing
    // @ts-ignore - navigating across stacks
    navigation.navigate('Home', {
      screen: 'NewWorkout',
      params: {
        workoutId: workout.id,
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
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{workout.name}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.background.secondary }]}
            onPress={handleEdit}
          >
            <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeletePress}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.totalCircuits}</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Circuits</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.setsPerCircuit}</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Sets</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.intervalSeconds}s</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Work</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.restSeconds}s</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Rest</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.metricValue, { color: theme.text.primary }]}>
            {workout.estimatedDurationMinutes} min
          </Text>
          <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>Duration</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.metricValue, { color: theme.text.primary }]}>
            {workout.estimatedCalories} cal
          </Text>
          <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>Est. Calories</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.metricValue, { color: getDifficultyColor(workout.difficultyLevel) }]}>
            {capitalize(workout.difficultyLevel)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>Difficulty</Text>
        </View>
      </View>

      <View style={styles.circuitsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Workout Breakdown</Text>
        {workout.circuits?.map((circuit, circuitIndex) => (
          <View key={circuit.id} style={[styles.circuitCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[styles.circuitTitle, { color: theme.text.primary }]}>
              Circuit {circuitIndex + 1}
            </Text>
            <Text style={[styles.circuitInfo, { color: theme.text.secondary }]}>
              {workout.setsPerCircuit} sets × {circuit.exercises.length} exercises
            </Text>
            <View style={styles.exercisesList}>
              {circuit.exercises.map((ex, exIndex) => (
                <View key={ex.id} style={styles.exerciseItem}>
                  <Text style={styles.exerciseNumber}>{exIndex + 1}</Text>
                  <Text style={[styles.exerciseName, { color: theme.text.primary }]}>{ex.exercise.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

        <View style={styles.buttonContainer}>
          <Text style={[styles.readyText, { color: theme.text.primary }]}>Ready to start?</Text>
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
          <View style={[styles.modalContent, { backgroundColor: theme.background.elevated }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Delete Workout?</Text>
            <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>
              Are you sure you want to delete "{workout.name}"? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: theme.background.secondary }]}
                onPress={handleDeleteCancel}
                disabled={isDeleting}
              >
                <Text style={[styles.modalCancelButtonText, { color: theme.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[8],
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[5],
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error[50],
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: colors.error[500],
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.sm,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  metricCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  circuitsSection: {
    padding: spacing[5],
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: spacing[4],
  },
  circuitCard: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  circuitTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  circuitInfo: {
    fontSize: 14,
    marginBottom: spacing[4],
  },
  exercisesList: {
    marginTop: spacing[2],
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: spacing[3],
  },
  exerciseName: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: 40,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  startButton: {
    backgroundColor: colors.primary[500],
    padding: spacing[5],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
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
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: spacing[3],
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing[6],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalCancelButton: {
    // backgroundColor applied dynamically via theme
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    backgroundColor: colors.error[500],
  },
  modalDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WorkoutPreviewScreen;
