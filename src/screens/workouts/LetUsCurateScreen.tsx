import React, { useState, useEffect } from 'react';
import {
  View,
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
import { Button, Text, Card } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, borderRadius, colors } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'LetUsCurate'>;
type RoutePropType = RouteProp<HomeStackParamList, 'LetUsCurate'>;

const LetUsCurateScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();
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
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (workout) {
    return (
      <>
        <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
          <View style={styles.workoutHeader}>
            <Text variant="h2" style={styles.workoutTitle}>
              {workout.name}
            </Text>
            {workout.description && (
              <Text variant="body" color="secondary" style={styles.workoutDescription}>
                {workout.description}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              variant="ghost"
              size="small"
              onPress={handleDeletePress}
              style={styles.deleteButton}
            >
              Delete
            </Button>
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
                {workout.setsPerCircuit}
              </Text>
              <Text variant="caption" color="secondary">
                Sets
              </Text>
            </Card>
            <Card variant="flat" padding="medium" style={styles.statBox}>
              <Text variant="h3" style={styles.statValue}>
                {workout.intervalSeconds}s
              </Text>
              <Text variant="caption" color="secondary">
                Work
              </Text>
            </Card>
            <Card variant="flat" padding="medium" style={styles.statBox}>
              <Text variant="h3" style={styles.statValue}>
                {workout.restSeconds}s
              </Text>
              <Text variant="caption" color="secondary">
                Rest
              </Text>
            </Card>
          </View>

          <View style={styles.metricsRow}>
            <Card variant="flat" padding="medium" style={styles.metricCard}>
              <Text variant="bodyLarge" style={styles.metricValue}>
                {workout.estimatedDurationMinutes} min
              </Text>
              <Text variant="caption" color="secondary">
                Duration
              </Text>
            </Card>
            <Card variant="flat" padding="medium" style={styles.metricCard}>
              <Text variant="bodyLarge" style={styles.metricValue}>
                {workout.estimatedCalories} cal
              </Text>
              <Text variant="caption" color="secondary">
                Est. Calories
              </Text>
            </Card>
            <Card variant="flat" padding="medium" style={styles.metricCard}>
              <Text variant="bodyLarge" style={styles.metricValue}>
                {workout.difficultyLevel}
              </Text>
              <Text variant="caption" color="secondary">
                Difficulty
              </Text>
            </Card>
          </View>

          <View style={styles.circuitsSection}>
            <Text variant="h2" style={styles.sectionTitle}>
              Workout Breakdown
            </Text>
            {workout.circuits?.map((circuit: any, index: number) => (
              <Card key={circuit.id} variant="flat" padding="medium" style={styles.circuitCard}>
                <Text variant="h3" style={styles.circuitTitle}>
                  Circuit {index + 1}
                </Text>
                <Text variant="bodySmall" color="secondary" style={styles.circuitInfo}>
                  {workout.setsPerCircuit} sets × {circuit.exercises.length} exercises
                </Text>
                <View style={styles.exercisesList}>
                  {circuit.exercises.map((ex: any, exIndex: number) => (
                    <View key={ex.id} style={styles.exerciseItem}>
                      <View style={styles.exerciseNumber}>
                        <Text variant="bodySmall" style={styles.exerciseNumberText}>
                          {exIndex + 1}
                        </Text>
                      </View>
                      <Text variant="body" style={styles.exerciseName}>
                        {ex.exercise.name}
                      </Text>
                    </View>
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
                setShowCustomization(true);
              }}
              style={styles.backButton}
            >
              Customize Again
            </Button>

            <Text variant="bodyLarge" style={styles.readyText}>
              Ready to start?
            </Text>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={startWorkout}
              loading={isLoading}
              disabled={isLoading}
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
            <Card variant="elevated" padding="large" style={styles.modalContent}>
              <Text variant="h3" style={styles.modalTitle}>
                Delete Workout?
              </Text>
              <Text variant="body" color="secondary" style={styles.modalMessage}>
                Are you sure you want to delete "{workout?.name}"? This action cannot be undone.
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
            </Card>
          </View>
        </Modal>
      </>
    );
  }

  if (showCustomization && selectedObjective) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.header}>
          <Text variant="h2" style={styles.title}>
            Customize Your Workout
          </Text>
          <Text variant="body" color="secondary">
            {selectedObjective.name}
          </Text>
        </View>

        <View style={styles.customizationSection}>
          <Text variant="bodyLarge" style={styles.optionLabel}>
            Difficulty
          </Text>
          <View style={styles.optionsRow}>
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.background.elevated, borderColor: theme.border.medium },
                  difficulty === level && styles.optionButtonActive,
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  variant="body"
                  style={[
                    difficulty === level && styles.optionButtonTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text variant="bodyLarge" style={styles.optionLabel}>
            Duration (minutes)
          </Text>
          <View style={styles.optionsRow}>
            {[15, 20, 30, 45].map((min) => (
              <TouchableOpacity
                key={min}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.background.elevated, borderColor: theme.border.medium },
                  duration === min && styles.optionButtonActive,
                ]}
                onPress={() => setDuration(min)}
              >
                <Text
                  variant="body"
                  style={[
                    duration === min && styles.optionButtonTextActive,
                  ]}
                >
                  {min}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text variant="bodyLarge" style={styles.optionLabel}>
            Constraints
          </Text>
          <Card variant="flat" padding="none" style={styles.constraintsCard}>
            <TouchableOpacity
              style={[styles.constraintOption, { borderBottomColor: theme.border.light }]}
              onPress={() => setSmallSpace(!smallSpace)}
            >
              <Text variant="body">Small Space</Text>
              <View style={[
                styles.checkbox,
                { borderColor: smallSpace ? colors.primary[500] : theme.border.medium },
                smallSpace && styles.checkboxActive
              ]}>
                {smallSpace && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.constraintOption}
              onPress={() => setQuiet(!quiet)}
            >
              <Text variant="body">Quiet (No jumping)</Text>
              <View style={[
                styles.checkbox,
                { borderColor: quiet ? colors.primary[500] : theme.border.medium },
                quiet && styles.checkboxActive
              ]}>
                {quiet && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={generateWorkout}
            loading={isLoading}
            disabled={isLoading}
          >
            Generate Workout
          </Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>
          Choose Your Goal
        </Text>
        <Text variant="body" color="secondary">
          Select a workout objective
        </Text>
      </View>

      <View style={styles.objectivesContainer}>
        {objectives.map((objective) => (
          <Card
            key={objective.id}
            variant="flat"
            padding="medium"
            onPress={() => {
              setSelectedObjective(objective);
              setShowCustomization(true);
            }}
            style={styles.objectiveCard}
          >
            <Text variant="h3" style={styles.objectiveTitle}>
              {objective.name}
            </Text>
            <Text variant="bodySmall" color="secondary" style={styles.objectiveDescription}>
              {objective.description}
            </Text>
            {objective.tagline && (
              <Text variant="bodySmall" style={styles.objectiveTagline}>
                {objective.tagline}
              </Text>
            )}
          </Card>
        ))}
      </View>
    </ScrollView>
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
    marginBottom: spacing[2],
  },
  objectivesContainer: {
    padding: spacing[5],
    paddingTop: 0,
  },
  objectiveCard: {
    marginBottom: spacing[3],
  },
  objectiveTitle: {
    marginBottom: spacing[2],
  },
  objectiveDescription: {
    lineHeight: 20,
    marginBottom: spacing[2],
  },
  objectiveTagline: {
    color: colors.primary[500],
    fontWeight: '500',
  },
  customizationSection: {
    padding: spacing[5],
  },
  optionLabel: {
    fontWeight: '600',
    marginBottom: spacing[3],
    marginTop: spacing[4],
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  optionButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  optionButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  constraintsCard: {
    overflow: 'hidden',
  },
  constraintOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  workoutHeader: {
    padding: spacing[5],
    paddingTop: spacing[8],
  },
  workoutTitle: {
    marginBottom: spacing[2],
  },
  workoutDescription: {
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[5],
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: colors.error[50],
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
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
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
    gap: spacing[2],
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  circuitsSection: {
    padding: spacing[5],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  circuitCard: {
    marginBottom: spacing[3],
  },
  circuitTitle: {
    marginBottom: spacing[1],
  },
  circuitInfo: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  exerciseNumberText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseName: {
    flex: 1,
  },
  backButton: {
    marginBottom: spacing[3],
  },
  readyText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing[4],
    marginTop: spacing[3],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: spacing[3],
  },
  modalMessage: {
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

export default LetUsCurateScreen;
