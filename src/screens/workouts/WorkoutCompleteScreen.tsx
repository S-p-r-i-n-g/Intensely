import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'WorkoutComplete'>;
type RoutePropType = RouteProp<HomeStackParamList, 'WorkoutComplete'>;

const WorkoutCompleteScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();

  const { durationSeconds, caloriesBurned } = route.params;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        {/* Congratulations Message */}
        <Text style={[styles.title, { color: theme.text.primary }]}>Workout Complete!</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Great job! You crushed it.
        </Text>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.background.tertiary }]}>
            <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Duration</Text>
          </View>

          {caloriesBurned && (
            <View style={[styles.statCard, { backgroundColor: theme.background.tertiary }]}>
              <Text style={styles.statValue}>{caloriesBurned}</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Calories Burned</Text>
            </View>
          )}
        </View>

        {/* Motivational Message */}
        <View style={[styles.messageCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.messageText, { color: theme.text.primary }]}>
            Every workout counts. You're one step closer to your goals!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.background.secondary }]}
            onPress={() => navigation.navigate('HomeMain')}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // Navigate back to home and allow starting another workout
              navigation.navigate('HomeMain');
            }}
          >
            <Text style={styles.primaryButtonText}>Start Another</Text>
          </TouchableOpacity>
        </View>

        {/* Optional: View Progress Link */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            // TODO: Navigate to progress/history screen
            navigation.navigate('HomeMain');
          }}
        >
          <Text style={styles.linkText}>View Workout History →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[10],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  successIcon: {
    fontSize: 100,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: spacing[10],
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing[8],
    gap: spacing[4],
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary[500],
    marginBottom: spacing[2],
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  messageCard: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    marginBottom: spacing[8],
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4] + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing[4] + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: spacing[3],
  },
  linkText: {
    fontSize: 16,
    color: colors.primary[500],
    fontWeight: '600',
  },
});

export default WorkoutCompleteScreen;
