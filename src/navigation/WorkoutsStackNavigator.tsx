import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutsStackParamList } from './types';

// Screens
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';
import WorkoutPreviewScreen from '../screens/workouts/WorkoutPreviewScreen';
import WorkoutExecutionScreen from '../screens/workouts/WorkoutExecutionScreen';
import WorkoutCompleteScreen from '../screens/workouts/WorkoutCompleteScreen';

const Stack = createStackNavigator<WorkoutsStackParamList>();

export const WorkoutsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#FF6B35',
        headerTitleStyle: {
          fontWeight: 600,
        },
      }}
    >
      <Stack.Screen
        name="WorkoutsList"
        component={WorkoutsScreen}
        options={{
          title: 'My Workouts',
        }}
      />
      <Stack.Screen
        name="WorkoutPreview"
        component={WorkoutPreviewScreen}
        options={{
          title: 'Workout Preview',
        }}
      />
      <Stack.Screen
        name="WorkoutExecution"
        component={WorkoutExecutionScreen}
        options={{
          headerShown: false, // Full screen workout experience
        }}
      />
      <Stack.Screen
        name="WorkoutComplete"
        component={WorkoutCompleteScreen}
        options={{
          headerShown: false, // Clean completion screen
        }}
      />
    </Stack.Navigator>
  );
};
