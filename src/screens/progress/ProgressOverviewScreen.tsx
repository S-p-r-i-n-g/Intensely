import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressStackParamList } from '../../navigation/types';
import { sessionsApi, progressApi } from '../../api';
import type { WorkoutSession, ProgressEntry } from '../../types/api';

type NavigationProp = NativeStackNavigationProp<ProgressStackParamList, 'ProgressOverview'>;

const ProgressOverviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [recentPRs, setRecentPRs] = useState<ProgressEntry[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadProgressData();
    }, [])
  );

  const loadProgressData = async () => {
    try {
      setIsLoading(true);

      // Load recent workout sessions
      const sessionsResponse = await sessionsApi.getHistory({ limit: 5 });
      setRecentSessions(sessionsResponse.data.sessions);

      // Load recent PRs
      const prsResponse = await progressApi.getAll({ limit: 5 });
      setRecentPRs(prsResponse.data.filter((pr) => pr.isPersonalRecord));

      // Calculate stats from sessions
      const totalWorkouts = sessionsResponse.data.total;
      const totalMinutes = sessionsResponse.data.sessions.reduce(
        (sum, session) => sum + (session.durationSeconds || 0) / 60,
        0
      );
      const totalCalories = sessionsResponse.data.sessions.reduce(
        (sum, session) => sum + (session.caloriesBurned || 0),
        0
      );

      setStats({
        totalWorkouts,
        totalMinutes: Math.round(totalMinutes),
        totalCalories: Math.round(totalCalories),
        currentStreak: 0, // TODO: Calculate streak
      });
    } catch (error: any) {
      console.error('Failed to load progress data:', error);
      Alert.alert('Error', 'Could not load progress data.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Keep up the great work!</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalMinutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCalories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to full workout history
              Alert.alert('Coming Soon', 'Full workout history will be available soon.');
            }}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No workouts yet</Text>
            <Text style={styles.emptySubtext}>Complete your first workout to see it here!</Text>
          </View>
        ) : (
          recentSessions.map((session) => (
            <TouchableOpacity key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionName}>{session.workout.name}</Text>
                <Text style={styles.sessionDate}>{formatDate(session.completedAt!)}</Text>
              </View>
              <View style={styles.sessionStats}>
                {session.durationSeconds && (
                  <Text style={styles.sessionStat}>{formatDuration(session.durationSeconds)}</Text>
                )}
                {session.caloriesBurned && (
                  <Text style={styles.sessionStat}>{session.caloriesBurned} cal</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent PRs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent PRs 🏆</Text>
        </View>

        {recentPRs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No personal records yet</Text>
            <Text style={styles.emptySubtext}>Log your progress to track PRs!</Text>
          </View>
        ) : (
          recentPRs.map((pr) => (
            <TouchableOpacity
              key={pr.id}
              style={styles.prCard}
              onPress={() =>
                navigation.navigate('ExerciseProgress', { exerciseId: pr.exerciseId })
              }
            >
              <View style={styles.prIcon}>
                <Text style={styles.prEmoji}>🏆</Text>
              </View>
              <View style={styles.prInfo}>
                <Text style={styles.prExercise}>{pr.exercise.name}</Text>
                <Text style={styles.prDetails}>
                  {pr.reps && `${pr.reps} reps`}
                  {pr.weight && ` × ${pr.weight} lbs`}
                  {pr.durationSeconds && ` ${pr.durationSeconds}s`}
                </Text>
                <Text style={styles.prDate}>{formatDate(pr.loggedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // TODO: Navigate to exercise selection for logging
            Alert.alert('Coming Soon', 'Quick log functionality coming soon!');
          }}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>Log Progress</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            // TODO: Navigate to goals screen
            Alert.alert('Coming Soon', 'Goals tracking coming soon!');
          }}
        >
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={styles.actionText}>Set Goals</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF5F2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: '#666',
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionStat: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  prCard: {
    backgroundColor: '#FFF5F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  prEmoji: {
    fontSize: 24,
  },
  prInfo: {
    flex: 1,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  prDetails: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 2,
  },
  prDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionArrow: {
    fontSize: 18,
    color: '#999',
  },
});

export default ProgressOverviewScreen;
