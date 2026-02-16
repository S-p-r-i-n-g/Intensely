import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';

// Screens
import ProfileMainScreen from '../screens/profile/ProfileMainScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import PreferencesScreen from '../screens/profile/PreferencesScreen';
import AnimationTestScreen from '../screens/AnimationTestScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {
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
        name="ProfileMain"
        component={ProfileMainScreen}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{
          title: 'Preferences',
        }}
      />
      <Stack.Screen
        name="AnimationTest"
        component={AnimationTestScreen}
        options={{
          title: 'Animation Test',
        }}
      />
    </Stack.Navigator>
  );
};
