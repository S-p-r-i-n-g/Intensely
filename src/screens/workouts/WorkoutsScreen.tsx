import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { WorkoutsStackParamList, DrawerParamList } from '../../navigation/types';
import { workoutsApi } from '../../api';
import { useAuthStore } from '../../stores';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';
import { PlayIcon, PlusIcon } from 'react-native-heroicons/outline';
import { DIFFICULTY_COLORS, DifficultyLevel } from '../../hooks/useWorkoutBuilder';

// Helper to get difficulty color (matches design.md v1.3)
const getDifficultyColor = (level?: string): string => {
  const normalizedLevel = (level?.toLowerCase() || 'intermediate') as DifficultyLevel;
  return DIFFICULTY_COLORS[normalizedLevel] || DIFFICULTY_COLORS.intermediate;
};

// Helper to capitalize first letter
const capitalize = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

type NavigationProp = NativeStackNavigationProp<WorkoutsStackParamList, 'WorkoutsList'>;

interface CircuitExercise {
  id: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
  };
}

interface Circuit {
  id: string;
  exercises: CircuitExercise[];
}

interface Workout {
  id: string;
  name: string;
  difficultyLevel: string;
  estimatedDurationMinutes: number;
  estimatedCalories?: number;
  totalCircuits: number;
  exercisesPerCircuit: number;
  setsPerCircuit: number;
  intervalSeconds: number;
  restSeconds: number;
  circuits?: Circuit[];
}

// MetricChip component matching the Builder's style
const MetricChip = ({ value, label, theme }: { value: string; label: string; theme: any }) => (
  <View style={[styles.chip, { backgroundColor: theme.background.tertiary, borderColor: theme.border.strong }]}>
    <Text style={[styles.chipValue, { color: theme.text.primary }]}>
      {value}
    </Text>
    <Text style={[styles.chipLabel, { color: theme.text.secondary }]}>
      {label}
    </Text>
  </View>
);

const WorkoutsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      // Fetch all workouts - the backend will filter by authenticated user
      const response = await workoutsApi.getAll({});
      // Filter client-side to only show user's workouts
      const userWorkouts = response.data.filter(
        (w: any) => w.createdBy === user.id
      );
      setWorkouts(userWorkouts);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  // Reload workouts when screen comes into focus (e.g., after deleting a workout)
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  // Format exercise names with truncation
  const formatExerciseNames = (circuits?: Circuit[], maxDisplay = 3): string => {
    if (!circuits || circuits.length === 0) return '';
    const exercises = circuits[0]?.exercises || [];
    if (exercises.length === 0) return '';

    const names = exercises.slice(0, maxDisplay).map((ex) => ex.exercise?.name || 'Unknown');
    const remaining = exercises.length - maxDisplay;

    if (remaining > 0) {
      return `${names.join(', ')} +${remaining} more`;
    }
    return names.join(', ');
  };

  const renderWorkoutCard = ({ item }: { item: Workout }) => {
    const handleStartWorkout = () => {
      navigation.navigate('WorkoutPreview', { workoutId: item.id });
    };

    const exercisePreview = formatExerciseNames(item.circuits);

    return (
      <TouchableOpacity
        style={[styles.workoutCard, { backgroundColor: theme.background.elevated }]}
        onPress={() => navigation.navigate('WorkoutPreview', { workoutId: item.id })}
      >
        {/* Header: Name + Start Button */}
        <View style={styles.workoutHeader}>
          <Text style={[styles.workoutName, { color: theme.text.primary }]}>{item.name}</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <PlayIcon size={16} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Row: Duration, Calories, Difficulty */}
        <View style={styles.metricsRow}>
          <Text style={[styles.metricText, { color: theme.text.secondary }]}>
            {item.estimatedDurationMinutes} min
          </Text>
          {item.estimatedCalories && (
            <>
              <View style={[styles.metricDot, { backgroundColor: theme.text.tertiary }]} />
              <Text style={[styles.metricText, { color: theme.text.secondary }]}>
                {Math.round(item.estimatedCalories)} cal
              </Text>
            </>
          )}
          <View style={[styles.metricDot, { backgroundColor: theme.text.tertiary }]} />
          <Text style={[styles.metricText, { color: getDifficultyColor(item.difficultyLevel), fontWeight: '600' }]}>
            {capitalize(item.difficultyLevel)}
          </Text>
        </View>

        {/* Exercise Preview */}
        {exercisePreview && (
          <Text
            style={[styles.exercisePreview, { color: theme.text.secondary }]}
            numberOfLines={1}
          >
            {exercisePreview}
          </Text>
        )}

        {/* Metric Chips: Row 1 - Structure */}
        <View style={styles.chipRow}>
          <MetricChip value={String(item.totalCircuits)} label="Circuits" theme={theme} />
          <MetricChip value={String(item.setsPerCircuit)} label="Sets" theme={theme} />
        </View>

        {/* Metric Chips: Row 2 - Timing */}
        <View style={styles.chipRow}>
          <MetricChip value={`${item.intervalSeconds}s`} label="Work" theme={theme} />
          <MetricChip value={`${item.restSeconds}s`} label="Rest" theme={theme} />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const handleCreateWorkout = () => {
    // Navigate to NewWorkout in the Home stack
    const drawerNavigation = navigation.getParent<DrawerNavigationProp<DrawerParamList>>();
    drawerNavigation?.navigate('Home', {
      screen: 'NewWorkout',
      params: {},
    });
  };

  if (workouts.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <Text style={styles.emptyIcon}>💪</Text>
        <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Workouts Yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
          You haven't created any workouts.{'\n'}Let's fix that!
        </Text>
        <TouchableOpacity
          style={styles.createWorkoutButton}
          onPress={handleCreateWorkout}
        >
          <PlusIcon size={20} color="#FFFFFF" />
          <Text style={styles.createWorkoutButtonText}>
            Create Your First Workout
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      />
    </View>
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
    padding: spacing[5],
  },
  listContent: {
    padding: spacing[4],
  },
  workoutCard: {
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing[2],
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  metricText: {
    fontSize: 13,
  },
  metricDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing[2],
  },
  exercisePreview: {
    fontSize: 12,
    marginBottom: spacing[3],
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  chipValue: {
    fontWeight: '700',
    fontSize: 11,
  },
  chipLabel: {
    fontWeight: '400',
    fontSize: 11,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 100,
    gap: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  createWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: 100,
    marginTop: spacing[6],
    gap: spacing[2],
  },
  createWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutsScreen;
