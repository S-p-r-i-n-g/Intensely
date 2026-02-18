import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { useTheme } from '../theme';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import NewWorkoutScreen from '../screens/workouts/NewWorkoutScreen';
import ExerciseSelectionScreen from '../screens/workouts/ExerciseSelectionScreen';
import WorkoutPreviewScreen from '../screens/workouts/WorkoutPreviewScreen';
import WorkoutExecutionScreen from '../screens/workouts/WorkoutExecutionScreen';
import WorkoutCompleteScreen from '../screens/workouts/WorkoutCompleteScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background.elevated,
        },
        headerTintColor: theme.text.primary,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          color: theme.text.primary,
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
