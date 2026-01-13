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
import { WorkoutsStackParamList } from '../../navigation/types';
import { workoutsApi } from '../../api';
import { useAuthStore } from '../../stores';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<WorkoutsStackParamList, 'WorkoutsList'>;

interface Workout {
  id: string;
  name: string;
  description?: string;
  difficultyLevel: string;
  estimatedDurationMinutes: number;
  totalCircuits: number;
  exercisesPerCircuit: number;
  objectiveMappings?: Array<{
    objective: {
      name: string;
      colorHex: string;
    };
  }>;
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
    const primaryObjective = item.objectiveMappings?.[0]?.objective;

    return (
      <TouchableOpacity
        style={[styles.workoutCard, { backgroundColor: theme.background.secondary }]}
        onPress={() => navigation.navigate('WorkoutPreview', { workoutId: item.id })}
      >
        <View style={styles.workoutHeader}>
          <Text style={[styles.workoutName, { color: theme.text.primary }]}>{item.name}</Text>
          {primaryObjective && (
            <View
              style={[
                styles.objectiveBadge,
                { backgroundColor: primaryObjective.colorHex },
              ]}
            >
              <Text style={styles.objectiveBadgeText}>
                {primaryObjective.name}
              </Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={[styles.workoutDescription, { color: theme.text.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

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
            <Text style={styles.statValue}>
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

  if (workouts.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <Text style={styles.emptyIcon}>💪</Text>
        <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Workouts Yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
          Create your first workout from the Home tab
        </Text>
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
  objectiveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    marginLeft: spacing[2],
  },
  objectiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  workoutDescription: {
    fontSize: 14,
    marginBottom: spacing[3],
    lineHeight: 20,
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
});

export default WorkoutsScreen;
