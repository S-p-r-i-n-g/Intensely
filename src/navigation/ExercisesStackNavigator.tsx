import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExercisesStackParamList } from './types';

// Screens
import ExercisesListScreen from '../screens/exercises/ExercisesListScreen';
import ExerciseDetailScreen from '../screens/exercises/ExerciseDetailScreen';
import CreateExerciseScreen from '../screens/exercises/CreateExerciseScreen';

const Stack = createNativeStackNavigator<ExercisesStackParamList>();

export const ExercisesStackNavigator = () => {
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
        name="ExercisesList"
        component={ExercisesListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateExercise"
        component={CreateExerciseScreen}
        options={{
          title: 'Create Exercise',
        }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{
          title: 'Exercise Details',
        }}
      />
    </Stack.Navigator>
  );
};
