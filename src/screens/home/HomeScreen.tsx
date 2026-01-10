import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useAuthStore, useWorkoutStore } from '../../stores';
import { designTokens } from '../../config/design-tokens';
import { Button } from '../../components/ui';
import { StatsCard, WorkoutFlowCard } from '../../components/home';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
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
    <ScrollView style={styles.container}>
      {/* Backend Warning Banner */}
      {showBackendWarning && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Backend Offline</Text>
            <Text style={styles.warningText}>
              Some features may be limited. Authentication still works!
            </Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello{profile?.firstName ? `, ${profile.firstName}` : ''}!
        </Text>
        <Text style={styles.subtitle}>Ready to work out?</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <StatsCard value={`${workoutMinutes} min`} label="Workout" />
        <StatsCard value={totalWorkouts} label="Workouts" />
        <StatsCard value={`🔥${streak}`} label="Streak" icon="🔥" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>

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
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptyText}>
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
    backgroundColor: designTokens.colors.neutral.background,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: designTokens.colors.semantic.warningLight,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.semantic.warning,
    padding: designTokens.spacing.md,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: designTokens.spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...designTokens.typography.label,
    color: designTokens.colors.semantic.warning,
    marginBottom: 2,
  },
  warningText: {
    ...designTokens.typography.caption,
    color: designTokens.colors.semantic.warning,
  },
  header: {
    padding: designTokens.spacing.md,
    paddingTop: designTokens.spacing.xl,
  },
  greeting: {
    ...designTokens.typography.h1,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  subtitle: {
    ...designTokens.typography.bodyMedium,
    color: designTokens.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  section: {
    padding: designTokens.spacing.md,
    paddingTop: 0,
  },
  sectionTitle: {
    ...designTokens.typography.h2,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: designTokens.spacing.xl,
    backgroundColor: designTokens.colors.neutral.surface,
    borderRadius: designTokens.borderRadius.md,
    ...designTokens.shadows.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: designTokens.spacing.md,
  },
  emptyTitle: {
    ...designTokens.typography.h3,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  emptyText: {
    ...designTokens.typography.bodyMedium,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default HomeScreen;
