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
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProgressStackParamList, 'ProgressOverview'>;

const ProgressOverviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

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
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Your Progress</Text>
        <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>Keep up the great work!</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.statValue, { color: colors.primary[500] }]}>{stats.totalWorkouts}</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Workouts</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.statValue, { color: colors.primary[500] }]}>{stats.totalMinutes}</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Minutes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.statValue, { color: colors.primary[500] }]}>{stats.totalCalories}</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Calories</Text>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recent Workouts</Text>
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to full workout history
              Alert.alert('Coming Soon', 'Full workout history will be available soon.');
            }}
          >
            <Text style={[styles.seeAllText, { color: colors.primary[500] }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentSessions.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>No workouts yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>Complete your first workout to see it here!</Text>
          </View>
        ) : (
          recentSessions.map((session) => (
            <TouchableOpacity key={session.id} style={[styles.sessionCard, { backgroundColor: theme.background.secondary }]}>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionName, { color: theme.text.primary }]}>{session.workout.name}</Text>
                <Text style={[styles.sessionDate, { color: theme.text.secondary }]}>{formatDate(session.completedAt!)}</Text>
              </View>
              <View style={styles.sessionStats}>
                {session.durationSeconds && (
                  <Text style={[styles.sessionStat, { color: theme.text.secondary }]}>{formatDuration(session.durationSeconds)}</Text>
                )}
                {session.caloriesBurned && (
                  <Text style={[styles.sessionStat, { color: theme.text.secondary }]}>{session.caloriesBurned} cal</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Recent PRs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recent PRs 🏆</Text>
        </View>

        {recentPRs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>No personal records yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>Log your progress to track PRs!</Text>
          </View>
        ) : (
          recentPRs.map((pr) => (
            <TouchableOpacity
              key={pr.id}
              style={[styles.prCard, { backgroundColor: theme.background.elevated }]}
              onPress={() =>
                navigation.navigate('ExerciseProgress', { exerciseId: pr.exerciseId })
              }
            >
              <View style={[styles.prIcon, { backgroundColor: theme.background.secondary }]}>
                <Text style={styles.prEmoji}>🏆</Text>
              </View>
              <View style={styles.prInfo}>
                <Text style={[styles.prExercise, { color: theme.text.primary }]}>{pr.exercise.name}</Text>
                <Text style={[styles.prDetails, { color: colors.primary[500] }]}>
                  {pr.reps && `${pr.reps} reps`}
                  {pr.weight && ` × ${pr.weight} lbs`}
                  {pr.durationSeconds && ` ${pr.durationSeconds}s`}
                </Text>
                <Text style={[styles.prDate, { color: theme.text.secondary }]}>{formatDate(pr.loggedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Quick Actions</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => {
            // TODO: Navigate to exercise selection for logging
            Alert.alert('Coming Soon', 'Quick log functionality coming soon!');
          }}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={[styles.actionText, { color: theme.text.primary }]}>Log Progress</Text>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => {
            // TODO: Navigate to goals screen
            Alert.alert('Coming Soon', 'Goals tracking coming soon!');
          }}
        >
          <Text style={styles.actionIcon}>🎯</Text>
          <Text style={[styles.actionText, { color: theme.text.primary }]}>Set Goals</Text>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>
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
  loadingText: {
    marginTop: spacing[4],
    fontSize: 16,
  },
  header: {
    padding: spacing[5],
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
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
    marginBottom: spacing[1],
  },
  sessionDate: {
    fontSize: 13,
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionStat: {
    fontSize: 13,
    marginTop: 2,
  },
  prCard: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  prIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
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
    marginBottom: spacing[1],
  },
  prDetails: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  prDate: {
    fontSize: 12,
  },
  emptyCard: {
    borderRadius: borderRadius.md,
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  actionArrow: {
    fontSize: 18,
  },
});

export default ProgressOverviewScreen;
