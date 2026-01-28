import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Card, Text } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, borderRadius, colors } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'WorkoutFlowSelection'>;

const WorkoutFlowSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Text variant="h1" style={styles.title}>
          Choose Your Workout
        </Text>
        <Text variant="body" color="secondary">
          Three ways to get started
        </Text>
      </View>

      <View style={styles.flowsContainer}>
        {/* Jump Right In */}
        <Card
          variant="elevated"
          padding="large"
          onPress={() => navigation.navigate('JumpRightIn')}
          style={[styles.flowCard, styles.primaryCard]}
        >
          <Text style={styles.flowIcon}>⚡️</Text>
          <Text variant="h3" style={styles.flowTitle}>
            Jump Right In
          </Text>
          <Text variant="body" color="secondary" style={styles.flowDescription}>
            Get an instant workout based on your preferences. No thinking required.
          </Text>
          <View style={[styles.flowBadge, styles.primaryBadge]}>
            <Text variant="caption" style={styles.flowBadgeText}>
              FASTEST
            </Text>
          </View>
        </Card>

        {/* Let Us Curate */}
        <Card
          variant="elevated"
          padding="large"
          onPress={() => navigation.navigate('LetUsCurate', {})}
          style={styles.flowCard}
        >
          <Text style={styles.flowIcon}>🎯</Text>
          <Text variant="h3" style={styles.flowTitle}>
            Let Us Curate
          </Text>
          <Text variant="body" color="secondary" style={styles.flowDescription}>
            Choose your goal, then customize duration, difficulty, and constraints.
          </Text>
          <View style={[styles.flowBadge, styles.successBadge]}>
            <Text variant="caption" style={styles.flowBadgeText}>
              RECOMMENDED
            </Text>
          </View>
        </Card>

        {/* Take the Wheel */}
        <Card
          variant="elevated"
          padding="large"
          onPress={() => navigation.navigate('NewWorkout', {})}
          style={styles.flowCard}
        >
          <Text style={styles.flowIcon}>🛠️</Text>
          <Text variant="h3" style={styles.flowTitle}>
            Take the Wheel
          </Text>
          <Text variant="body" color="secondary" style={styles.flowDescription}>
            Build your own workout from scratch. Choose exercises, sets, and timing.
          </Text>
          <View style={[styles.flowBadge, styles.infoBadge]}>
            <Text variant="caption" style={styles.flowBadgeText}>
              CUSTOM
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[8],
  },
  title: {
    marginBottom: spacing[2],
  },
  flowsContainer: {
    padding: spacing[5],
    paddingTop: 0,
  },
  flowCard: {
    marginBottom: spacing[4],
  },
  primaryCard: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  flowIcon: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  flowTitle: {
    marginBottom: spacing[2],
  },
  flowDescription: {
    lineHeight: 22,
    marginBottom: spacing[3],
  },
  flowBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.md,
  },
  primaryBadge: {
    backgroundColor: colors.primary[500],
  },
  successBadge: {
    backgroundColor: colors.success[500],
  },
  infoBadge: {
    backgroundColor: colors.accent[500],
  },
  flowBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default WorkoutFlowSelectionScreen;
