import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useAuthStore, useWorkoutStore } from '../../stores';
import { spacing, colors } from '../../tokens';
import { useTheme } from '../../theme';
import { Text } from '../../components/ui';
import { WorkoutFlowCard } from '../../components/home';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

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
      </View>

      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>Get Started</Text>

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
  section: {
    padding: spacing[4],
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
});

export default HomeScreen;
