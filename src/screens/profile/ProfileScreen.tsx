import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

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
        <Text style={[styles.name, { color: theme.text.primary }]}>
          {profile?.firstName || profile?.lastName
            ? `${profile.firstName} ${profile.lastName}`.trim()
            : 'User'}
        </Text>
        <Text style={[styles.email, { color: theme.text.secondary }]}>{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border.light }]}>
          <Text style={[styles.menuItemText, { color: theme.text.primary }]}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border.light }]}>
          <Text style={[styles.menuItemText, { color: theme.text.primary }]}>Workout Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border.light }]}>
          <Text style={[styles.menuItemText, { color: theme.text.primary }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={isLoading}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
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
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing[1],
  },
  email: {
    fontSize: 16,
  },
  section: {
    marginTop: spacing[5],
  },
  menuItem: {
    padding: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  signOutButton: {
    margin: spacing[5],
    padding: spacing[4],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
