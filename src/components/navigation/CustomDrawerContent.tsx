import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from '../../theme';
import { spacing } from '../../tokens';
import { Text, Button } from '../../components/ui';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { theme } = useTheme();
  const { state, navigation } = props;

  const menuItems = [
    { key: 'Home', label: 'Home', route: 'Home' },
    { key: 'Workouts', label: 'My Workouts', route: 'Workouts' },
    { key: 'Exercises', label: 'Exercise Library', route: 'Exercises' },
    { key: 'Profile', label: 'Profile', route: 'Profile' },
  ];

  const activeRoute = state.routeNames[state.index];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerText} color="primary">Intensely</Text>
        </View>

        <View style={styles.menuItems}>
          {menuItems.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <Button
                key={item.key}
                variant="ghost"
                onPress={() => navigation.navigate(item.route)}
                style={[
                  styles.menuItem,
                  isActive && { backgroundColor: theme.background.secondary },
                ]}
                textStyle={[
                  styles.menuItemText,
                  { color: theme.text.primary },
                  isActive && styles.menuItemTextActive,
                ]}
              >
                {item.label}
              </Button>
            );
          })}
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing[6],
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
  },
  menuItems: {
    paddingTop: spacing[4],
  },
  menuItem: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: 8,
    marginHorizontal: spacing[3],
    marginBottom: spacing[2],
    justifyContent: 'flex-start',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemTextActive: {
    fontWeight: '700',
  },
});
