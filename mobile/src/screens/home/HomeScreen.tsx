import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]} contentContainerStyle={styles.scrollContent}>
        {/* Greeting */}
        <View style={styles.header}>
          <Text variant="h1" style={styles.greeting}>
            Hi{profile?.firstName ? `, ${profile.firstName}` : ' there'}!
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
              screen: 'NewWorkout',
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
