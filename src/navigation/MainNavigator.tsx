import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { useTheme } from '../theme';
import { colors } from '../tokens/colors';

// Stack navigators
import { HomeStackNavigator } from './HomeStackNavigator';
import { WorkoutsStackNavigator } from './WorkoutsStackNavigator';
import { ExercisesStackNavigator } from './ExercisesStackNavigator';
import { ProgressStackNavigator } from './ProgressStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Let nested navigators handle their own headers
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: theme.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.background.elevated,
          borderTopWidth: 1,
          borderTopColor: theme.border.light,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          // tabBarIcon can be added later with icon library
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsStackNavigator}
        options={{
          title: 'Workouts',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesStackNavigator}
        options={{
          title: 'Exercises',
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressStackNavigator}
        options={{
          title: 'Progress',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
