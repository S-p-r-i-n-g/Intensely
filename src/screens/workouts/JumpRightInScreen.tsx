import React, { useState } from 'react';
import {
  View,
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
import { Button, Text, Card } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, borderRadius, colors } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'JumpRightIn'>;

const JumpRightInScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
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
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text variant="body" color="secondary" style={styles.loadingText}>
          Generating your workout...
        </Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.content}>
          <Text style={styles.icon}>⚡️</Text>
          <Text variant="h1" style={styles.title}>
            Jump Right In
          </Text>
          <Text variant="body" color="secondary" style={styles.description}>
            We'll generate a workout based on your preferences and fitness level.
            No setup required!
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text variant="body">Tailored to your fitness level</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text variant="body">Based on your preferences</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text variant="body">Ready in seconds</Text>
            </View>
          </View>

          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={generateWorkout}
            disabled={isLoading}
          >
            Generate Workout
          </Button>
        </View>
      </View>
    );
  }

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
            <Text variant="caption" style={styles.metricLabel}>
              Duration
            </Text>
          </Card>
          <Card variant="flat" padding="medium" style={styles.metricCard}>
            <Text variant="bodyLarge" style={styles.metricValue}>
              {workout.estimatedCalories} cal
            </Text>
            <Text variant="caption" style={styles.metricLabel}>
              Est. Calories
            </Text>
          </Card>
          <Card variant="flat" padding="medium" style={styles.metricCard}>
            <Text variant="bodyLarge" style={styles.metricValue}>
              {workout.difficultyLevel}
            </Text>
            <Text variant="caption" style={styles.metricLabel}>
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
            onPress={generateWorkout}
            disabled={isLoading}
            style={styles.regenerateButton}
          >
            Generate New Workout
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
  loadingText: {
    marginTop: spacing[4],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[5],
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: spacing[5],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing[8],
  },
  featuresList: {
    marginBottom: spacing[10],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  featureIcon: {
    fontSize: 20,
    color: colors.success[500],
    marginRight: spacing[3],
    width: 24,
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
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: '600',
    marginBottom: spacing[1],
    color: colors.secondary[900],
  },
  metricLabel: {
    color: colors.secondary[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
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
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  regenerateButton: {
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

export default JumpRightInScreen;
