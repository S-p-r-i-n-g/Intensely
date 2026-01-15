import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutsStackParamList } from './types';

// Screens
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';
import WorkoutPreviewScreen from '../screens/workouts/WorkoutPreviewScreen';
import WorkoutExecutionScreen from '../screens/workouts/WorkoutExecutionScreen';
import WorkoutCompleteScreen from '../screens/workouts/WorkoutCompleteScreen';

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

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
          gestureEnabled: false, // Prevent swipe back during workout
        }}
      />
      <Stack.Screen
        name="WorkoutComplete"
        component={WorkoutCompleteScreen}
        options={{
          headerShown: false, // Clean completion screen
          gestureEnabled: false, // Prevent swipe back
        }}
      />
    </Stack.Navigator>
  );
};
