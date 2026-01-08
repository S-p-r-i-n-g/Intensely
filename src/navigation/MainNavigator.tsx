import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';

// Stack navigators
import { HomeStackNavigator } from './HomeStackNavigator';
import { ExercisesStackNavigator } from './ExercisesStackNavigator';
import { ProgressStackNavigator } from './ProgressStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';

// Placeholder screens - will be implemented later
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Let nested navigators handle their own headers
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#666',
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
        component={WorkoutsScreen}
        options={{
          title: 'Workouts',
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
