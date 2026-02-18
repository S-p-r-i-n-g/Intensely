import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExercisesStackParamList } from './types';
import { useTheme } from '../theme';

// Screens
import ExercisesListScreen from '../screens/exercises/ExercisesListScreen';
import ExerciseDetailScreen from '../screens/exercises/ExerciseDetailScreen';
import CreateExerciseScreen from '../screens/exercises/CreateExerciseScreen';

const Stack = createNativeStackNavigator<ExercisesStackParamList>();

export const ExercisesStackNavigator = () => {
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
