import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity, useWindowDimensions } from 'react-native';
import { DrawerParamList } from './types';
import { CustomDrawerContent } from '../components/navigation/CustomDrawerContent';
import { ProfileIcon } from '../components/navigation/ProfileIcon';
import { Bars3Icon } from 'react-native-heroicons/outline';
import { useTheme } from '../theme';

// Stack navigators
import { HomeStackNavigator } from './HomeStackNavigator';
import { WorkoutsStackNavigator } from './WorkoutsStackNavigator';
import { ExercisesStackNavigator } from './ExercisesStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 16, padding: 8 }}
          >
            <Bars3Icon size={28} color={theme.text.primary} />
          </TouchableOpacity>
        ),
        headerRight: () => <ProfileIcon />,
        headerTitle: '',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        drawerType: 'front',
        drawerStyle: {
          width: width * 0.75, // 75% of screen width
        },
        scrimColor: 'rgba(0, 0, 0, 0.4)', // 40% opacity overlay
        overlayColor: 'rgba(0, 0, 0, 0.4)',
      })}
    >
      <Drawer.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
        }}
      />
      <Drawer.Screen
        name="Workouts"
        component={WorkoutsStackNavigator}
        options={{
          title: 'My Workouts',
        }}
      />
      <Drawer.Screen
        name="Exercises"
        component={ExercisesStackNavigator}
        options={{
          title: 'Exercise Library',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
        }}
      />
    </Drawer.Navigator>
  );
};
