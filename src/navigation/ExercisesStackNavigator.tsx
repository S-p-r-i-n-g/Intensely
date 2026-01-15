import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExercisesStackParamList } from './types';

// Screens
import ExercisesListScreen from '../screens/exercises/ExercisesListScreen';
import ExerciseDetailScreen from '../screens/exercises/ExerciseDetailScreen';
import FavoritesScreen from '../screens/exercises/FavoritesScreen';

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
          title: 'Exercises',
        }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{
          title: 'Exercise Details',
        }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favorite Exercises',
        }}
      />
    </Stack.Navigator>
  );
};
