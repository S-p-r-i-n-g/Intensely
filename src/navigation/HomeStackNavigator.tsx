import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './types';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import NewWorkoutScreen from '../screens/workouts/NewWorkoutScreen';
import ExerciseSelectionScreen from '../screens/workouts/ExerciseSelectionScreen';
import WorkoutPreviewScreen from '../screens/workouts/WorkoutPreviewScreen';
import WorkoutExecutionScreen from '../screens/workouts/WorkoutExecutionScreen';
import WorkoutCompleteScreen from '../screens/workouts/WorkoutCompleteScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStackNavigator = () => {
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
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerShown: false, // Home screen shows its own header in the content
        }}
      />
      <Stack.Screen
        name="NewWorkout"
        component={NewWorkoutScreen}
        options={({ route }) => ({
          title: route.params?.workoutId ? 'Edit Workout' : 'New Workout',
        })}
      />
      <Stack.Screen
        name="ExerciseSelection"
        component={ExerciseSelectionScreen}
        options={{
          title: 'Select Exercises',
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
