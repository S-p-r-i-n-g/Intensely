import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useAuthStore, useWorkoutStore } from '../../stores';
import { spacing, borderRadius, colors } from '../../tokens';
import { useTheme } from '../../theme';
import { Button, Text } from '../../components/ui';
import { StatsCard, WorkoutFlowCard } from '../../components/home';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { profile } = useAuthStore();
  const { loadObjectives, objectives } = useWorkoutStore();
  const [showBackendWarning, setShowBackendWarning] = useState(false);

  // Stats (placeholder - will be connected to actual data later)
  const workoutMinutes = 0;
  const totalWorkouts = 0;
  const streak = 0;

  useEffect(() => {
    loadObjectives().catch(() => {
      // If objectives fail to load, show backend warning
      setShowBackendWarning(true);
    });
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Backend Warning Banner */}
      {showBackendWarning && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text variant="bodySmall" style={styles.warningTitle}>Backend Offline</Text>
            <Text variant="bodySmall" style={styles.warningText}>
              Some features may be limited. Authentication still works!
            </Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text variant="h1" style={styles.greeting}>
          Hello{profile?.firstName ? `, ${profile.firstName}` : ''}!
        </Text>
        <Text variant="body" color="secondary">Ready to work out?</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <StatsCard value={`${workoutMinutes} min`} label="Workout" />
        <StatsCard value={totalWorkouts} label="Workouts" />
        <StatsCard value={`🔥${streak}`} label="Streak" icon="🔥" />
      </View>

      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Quick Start</Text>

        <WorkoutFlowCard
          title="Jump Right In"
          description="Get an instant workout based on your preferences. No thinking required."
          badge="FASTEST"
          badgeVariant="primary"
          estimatedTime="~20 min"
          difficulty="Any level"
          onPress={() => navigation.navigate('JumpRightIn')}
        />

        <WorkoutFlowCard
          title="Let Us Curate"
          description="Choose your goal, then customize duration, difficulty, and constraints."
          badge="RECOMMENDED"
          badgeVariant="success"
          estimatedTime="~20-45 min"
          difficulty="Any level"
          onPress={() => navigation.navigate('LetUsCurate', {})}
        />

        <WorkoutFlowCard
          title="Take the Wheel"
          description="Build your own workout from scratch. Choose exercises, sets, and timing."
          badge="CUSTOM"
          badgeVariant="info"
          onPress={() => navigation.navigate('TakeTheWheel')}
        />
      </View>

      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Recent Activity</Text>
        <View style={[styles.emptyState, { backgroundColor: theme.background.elevated }]}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text variant="h3" style={styles.emptyTitle}>No workouts yet</Text>
          <Text variant="body" color="secondary" style={styles.emptyText}>
            Start your first workout to see your activity here!
          </Text>
          <Button
            variant="secondary"
            size="medium"
            onPress={() => navigation.navigate('JumpRightIn')}
            style={styles.emptyButton}
          >
            Start First Workout
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warning[100],
    borderBottomWidth: 1,
    borderBottomColor: colors.warning[500],
    padding: spacing[4],
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing[4],
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    color: colors.warning[500],
    marginBottom: 2,
    fontWeight: '500',
  },
  warningText: {
    color: colors.warning[500],
  },
  header: {
    padding: spacing[4],
    paddingTop: spacing[8],
  },
  greeting: {
    marginBottom: spacing[2],
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
  section: {
    padding: spacing[4],
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing[8],
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  emptyTitle: {
    marginBottom: spacing[2],
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default HomeScreen;
