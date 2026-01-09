import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutsStackParamList } from '../../navigation/types';
import { workoutsApi } from '../../api';
import { useAuthStore } from '../../stores';

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

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const renderWorkoutCard = ({ item }: { item: Workout }) => {
    const primaryObjective = item.objectiveMappings?.[0]?.objective;

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => navigation.navigate('WorkoutPreview', { workoutId: item.id })}
      >
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutName}>{item.name}</Text>
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
          <Text style={styles.workoutDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.totalCircuits}</Text>
            <Text style={styles.statLabel}>Circuits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.exercisesPerCircuit}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.estimatedDurationMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {item.difficultyLevel?.charAt(0).toUpperCase()}
            </Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>💪</Text>
        <Text style={styles.emptyTitle}>No Workouts Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first workout from the Home tab
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
      />
    </View>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  objectiveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  objectiveBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WorkoutsScreen;
