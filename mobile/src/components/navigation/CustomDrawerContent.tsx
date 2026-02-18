import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from '../../theme';
import { spacing } from '../../tokens';
import { useWorkoutStore } from '../../stores/workoutStore';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { theme } = useTheme();
  const { state, navigation } = props;
  const { hasActiveDraft, draft } = useWorkoutStore();

  const activeRoute = state.routeNames[state.index];

  // Detect if the active HomeStack screen is NewWorkout
  const homeRoute = state.routes.find((r) => r.name === 'Home');
  const homeStackState = homeRoute?.state as any;
  const activeHomeScreen = homeStackState?.routes?.[homeStackState?.index ?? 0]?.name;
  const isOnNewWorkout = activeRoute === 'Home' && activeHomeScreen === 'NewWorkout';

  const handleNewWorkoutPress = () => {
    navigation.closeDrawer();
    if (hasActiveDraft && draft) {
      navigation.navigate('Home', {
        screen: 'NewWorkout',
        params: draft,
      });
    } else {
      navigation.navigate('Home', { screen: 'NewWorkout' });
    }
  };

  const drawerRouteItems = [
    { key: 'Workouts', label: 'My Workouts', route: 'Workouts' },
    { key: 'Exercises', label: 'Exercise Library', route: 'Exercises' },
    { key: 'Profile', label: 'Profile', route: 'Profile' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.text.primary }]}>Intensely</Text>
        </View>

        <View style={styles.menuItems}>
          {/* Home — always navigates to HomeMain (Idempotent Home Pattern) */}
          {(() => {
            const isActive = activeRoute === 'Home' && !isOnNewWorkout;
            return (
              <TouchableOpacity
                key="Home"
                style={[styles.menuItem, isActive && { backgroundColor: theme.background.secondary }]}
                onPress={() => navigation.navigate('Home', { screen: 'HomeMain' })}
              >
                <Text style={[styles.menuItemText, { color: theme.text.primary }, isActive && styles.menuItemTextActive]}>
                  Home
                </Text>
              </TouchableOpacity>
            );
          })()}

          {/* New Workout */}
          <TouchableOpacity
            style={[styles.menuItem, isOnNewWorkout && { backgroundColor: theme.background.secondary }]}
            onPress={handleNewWorkoutPress}
          >
            <Text style={[styles.menuItemText, { color: theme.text.primary }, isOnNewWorkout && styles.menuItemTextActive]}>
              New Workout
            </Text>
          </TouchableOpacity>

          {/* My Workouts + Exercise Library */}
          {drawerRouteItems.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, isActive && { backgroundColor: theme.background.secondary }]}
                onPress={() => navigation.navigate(item.route)}
              >
                <Text style={[styles.menuItemText, { color: theme.text.primary }, isActive && styles.menuItemTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing[6],
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
  },
  menuItems: {
    paddingTop: spacing[4],
  },
  menuItem: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: 8,
    marginHorizontal: spacing[3],
    marginBottom: spacing[2],
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemTextActive: {
    fontWeight: '700',
  },
});
