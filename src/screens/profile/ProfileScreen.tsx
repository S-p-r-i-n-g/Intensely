import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';
import { Text, Button } from '../../components/ui';

const ProfileScreen = () => {
  const { profile, signOut, isLoading } = useAuthStore();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.header, { borderBottomColor: theme.border.light }]}>
        <Text variant="h2" color="primary">
          {profile?.firstName || profile?.lastName
            ? `${profile.firstName} ${profile.lastName}`.trim()
            : 'User'}
        </Text>
        <Text variant="body" color="secondary">{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <Button
          variant="ghost"
          onPress={() => {}}
          style={[styles.menuItem, { borderBottomColor: theme.border.light }]}
          textStyle={[styles.menuItemText, { color: theme.text.primary }]}
        >
          Edit Profile
        </Button>

        <Button
          variant="ghost"
          onPress={() => {}}
          style={[styles.menuItem, { borderBottomColor: theme.border.light }]}
          textStyle={[styles.menuItemText, { color: theme.text.primary }]}
        >
          Workout Preferences
        </Button>

        <Button
          variant="ghost"
          onPress={() => {}}
          style={[styles.menuItem, { borderBottomColor: theme.border.light }]}
          textStyle={[styles.menuItemText, { color: theme.text.primary }]}
        >
          Settings
        </Button>
      </View>

      <Button
        variant="primary"
        onPress={handleSignOut}
        disabled={isLoading}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[2],
    borderBottomWidth: 1,
    gap: spacing[1],
  },
  section: {
    marginTop: spacing[5],
  },
  menuItem: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderRadius: 0,
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  menuItemText: {
    fontSize: 16,
  },
  signOutButton: {
    margin: spacing[5],
  },
});

export default ProfileScreen;
