import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import NewWorkoutScreen from '../screens/workouts/NewWorkoutScreen';
import WorkoutFlowSelectionScreen from '../screens/workouts/WorkoutFlowSelectionScreen';
import JumpRightInScreen from '../screens/workouts/JumpRightInScreen';
import TakeTheWheelScreen from '../screens/workouts/TakeTheWheelScreen';
import ExerciseSelectionScreen from '../screens/workouts/ExerciseSelectionScreen';
import WorkoutPreviewScreen from '../screens/workouts/WorkoutPreviewScreen';
import WorkoutExecutionScreen from '../screens/workouts/WorkoutExecutionScreen';
import WorkoutCompleteScreen from '../screens/workouts/WorkoutCompleteScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

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
        options={{
          title: 'New Workout',
        }}
      />
      <Stack.Screen
        name="WorkoutFlowSelection"
        component={WorkoutFlowSelectionScreen}
        options={{
          title: 'Choose Your Workout',
        }}
      />
      <Stack.Screen
        name="JumpRightIn"
        component={JumpRightInScreen}
        options={{
          title: 'Jump Right In',
        }}
      />
      <Stack.Screen
        name="TakeTheWheel"
        component={TakeTheWheelScreen}
        options={{
          title: 'Take the Wheel',
        }}
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
