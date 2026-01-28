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

type NavigationProp = NativeStackNavigationProp<WorkoutsStackParamList, 'WorkoutsList'>;

interface Workout {
  id: string;
  name: string;
  difficultyLevel: string;
  estimatedDurationMinutes: number;
  totalCircuits: number;
  exercisesPerCircuit: number;
}

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

  const renderWorkoutCard = ({ item }: { item: Workout }) => {
    const handleStartWorkout = () => {
      navigation.navigate('WorkoutPreview', { workoutId: item.id });
    };

    return (
      <TouchableOpacity
        style={[styles.workoutCard, { backgroundColor: theme.background.secondary }]}
        onPress={() => navigation.navigate('WorkoutPreview', { workoutId: item.id })}
      >
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

        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.totalCircuits}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Circuits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.exercisesPerCircuit}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.estimatedDurationMinutes}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getDifficultyColor(item.difficultyLevel) }]}>
              {item.difficultyLevel?.charAt(0).toUpperCase()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Level</Text>
          </View>
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
    borderRadius: borderRadius.md,
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
  },
  workoutStats: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[500],
    marginBottom: 2,
  },
  statLabel: {
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
