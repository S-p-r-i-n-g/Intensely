import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProgressStackParamList } from './types';

// Screens
import ProgressOverviewScreen from '../screens/progress/ProgressOverviewScreen';
import ExerciseProgressScreen from '../screens/progress/ExerciseProgressScreen';
import LogProgressScreen from '../screens/progress/LogProgressScreen';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export const ProgressStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#FF6B35',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ProgressOverview"
        component={ProgressOverviewScreen}
        options={{
          title: 'Progress',
        }}
      />
      <Stack.Screen
        name="ExerciseProgress"
        component={ExerciseProgressScreen}
        options={{
          title: 'Exercise Progress',
        }}
      />
      <Stack.Screen
        name="LogProgress"
        component={LogProgressScreen}
        options={{
          title: 'Log Progress',
        }}
      />
    </Stack.Navigator>
  );
};
