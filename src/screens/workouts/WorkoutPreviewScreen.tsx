import React, { useEffect, useState } from 'react';
import {
  View,
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
import { Text, Button, SkeletonText, SkeletonButton, SkeletonLoader } from '../../components/ui';

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
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.skeletonHeader}>
          <SkeletonText lines={1} style={styles.skeletonTitle} />
        </View>
        <View style={styles.skeletonActionsRow}>
          <SkeletonButton style={{ flex: 1 }} />
          <SkeletonButton style={{ flex: 1 }} />
        </View>
        <View style={styles.skeletonStatsRow}>
          <SkeletonLoader width="23%" height={56} />
          <SkeletonLoader width="23%" height={56} />
          <SkeletonLoader width="23%" height={56} />
          <SkeletonLoader width="23%" height={56} />
        </View>
        <View style={styles.skeletonBody}>
          <SkeletonText lines={4} />
        </View>
        <View style={styles.skeletonFooter}>
          <SkeletonButton />
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <Text style={styles.title} color="primary">{workout.name}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            variant="secondary"
            onPress={handleEdit}
            style={styles.actionButton}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            onPress={handleDeletePress}
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
          >
            Delete
          </Button>
        </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.totalCircuits}</Text>
          <Text style={styles.statLabel} color="secondary">Circuits</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.setsPerCircuit}</Text>
          <Text style={styles.statLabel} color="secondary">Sets</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.intervalSeconds}s</Text>
          <Text style={styles.statLabel} color="secondary">Work</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.statValue}>{workout.restSeconds}s</Text>
          <Text style={styles.statLabel} color="secondary">Rest</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.metricValue} color="primary">
            {workout.estimatedDurationMinutes} min
          </Text>
          <Text style={styles.metricLabel} color="secondary">Duration</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={styles.metricValue} color="primary">
            {workout.estimatedCalories} cal
          </Text>
          <Text style={styles.metricLabel} color="secondary">Est. Calories</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.metricValue, { color: getDifficultyColor(workout.difficultyLevel) }]}>
            {capitalize(workout.difficultyLevel)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>Difficulty</Text>
        </View>
      </View>

      <View style={styles.circuitsSection}>
        <Text style={styles.sectionTitle} color="primary">Workout Breakdown</Text>
        {workout.circuits?.map((circuit, circuitIndex) => (
          <View key={circuit.id} style={[styles.circuitCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={styles.circuitTitle} color="primary">
              Circuit {circuitIndex + 1}
            </Text>
            <Text style={styles.circuitInfo} color="secondary">
              {workout.setsPerCircuit} sets × {circuit.exercises.length} exercises
            </Text>
            <View style={styles.exercisesList}>
              {circuit.exercises.map((ex, exIndex) => (
                <View key={ex.id} style={styles.exerciseItem}>
                  <Text style={styles.exerciseNumber}>{exIndex + 1}</Text>
                  <Text style={styles.exerciseName} color="primary">{ex.exercise.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.readyText} color="primary">Ready to start?</Text>
          <Button
            variant="primary"
            fullWidth
            onPress={() => {
              navigation.navigate('WorkoutExecution', { workoutId: workout.id });
            }}
          >
            Start Workout
          </Button>
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
            <Text style={styles.modalTitle} color="primary">Delete Workout?</Text>
            <Text style={styles.modalMessage} color="secondary">
              Are you sure you want to delete "{workout.name}"? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Button
                variant="secondary"
                onPress={handleDeleteCancel}
                disabled={isDeleting}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleDeleteConfirm}
                loading={isDeleting}
                disabled={isDeleting}
                style={[styles.modalButton, styles.modalDeleteButton]}
              >
                Delete
              </Button>
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
  skeletonHeader: {
    padding: spacing[5],
    paddingTop: spacing[8],
  },
  skeletonTitle: {
    height: 36,
    marginBottom: spacing[4],
  },
  skeletonActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[5],
    gap: spacing[3],
  },
  skeletonStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  skeletonBody: {
    padding: spacing[5],
  },
  skeletonFooter: {
    padding: spacing[5],
    paddingBottom: 40,
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
  },
  deleteButton: {
    backgroundColor: colors.error[50],
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
  },
  modalDeleteButton: {
    backgroundColor: colors.error[500],
  },
});

export default WorkoutPreviewScreen;
