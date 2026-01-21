import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/types';
import { useAuthStore, useWorkoutStore } from '../../stores';
import { spacing, colors } from '../../tokens';
import { useTheme } from '../../theme';
import { Text } from '../../components/ui';
import { ActionButton } from '../../components/home';
// Import Heroicons
import { PlusIcon, MagnifyingGlassIcon, PlayIcon } from 'react-native-heroicons/outline';

type NavigationProp = DrawerNavigationProp<DrawerParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { profile } = useAuthStore();
  const { loadObjectives } = useWorkoutStore();
  const [showBackendWarning, setShowBackendWarning] = useState(false);

  useEffect(() => {
    loadObjectives().catch(() => {
      // If objectives fail to load, show backend warning
      setShowBackendWarning(true);
    });
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]} contentContainerStyle={styles.scrollContent}>
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

        {/* Greeting */}
        <View style={styles.header}>
          <Text variant="h1" style={styles.greeting}>
            Hi{profile?.firstName ? `, ${profile.firstName}` : ' Daniel'}!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Primary CTA - Start Workout */}
          <ActionButton
            title="Start Workout"
            variant="primary"
            icon={<PlayIcon size={24} color="#FFFFFF" />}
            onPress={() => navigation.navigate('Workouts', {
              screen: 'WorkoutsList',
            })}
          />

          {/* Secondary CTA - New Workout */}
          <ActionButton
            title="New Workout"
            variant="secondary"
            icon={<PlusIcon size={24} color="#000000" />}
            onPress={() => navigation.navigate('Home', {
              screen: 'TakeTheWheel',
            })}
          />

          {/* Secondary CTA - Exercise Library */}
          <ActionButton
            title="Exercise Library"
            variant="secondary"
            icon={<MagnifyingGlassIcon size={24} color="#000000" />}
            onPress={() => navigation.navigate('Exercises')}
          />
        </View>

        {/* Empty Space for Future Content */}
        <View style={styles.emptySpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20, // Match Gemini spec
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: colors.warning[100],
    borderBottomWidth: 1,
    borderBottomColor: colors.warning[500],
    padding: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[4],
    borderRadius: 8,
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
    paddingTop: 24,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
  },
  actionsContainer: {
    marginBottom: spacing[6],
  },
  emptySpace: {
    height: 200, // Reserved for future Stats and History
  },
});

export default HomeScreen;
