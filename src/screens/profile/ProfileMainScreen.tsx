import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const ProfileMainScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, signOut, isLoading } = useAuthStore();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    console.log('[ProfileMainScreen] Sign out button pressed');

    // For web, Alert.alert doesn't work well, so use window.confirm
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) {
        console.log('[ProfileMainScreen] Sign out cancelled');
        return;
      }

      try {
        console.log('[ProfileMainScreen] Calling signOut...');
        await signOut();
        console.log('[ProfileMainScreen] Sign out completed');
      } catch (error) {
        console.error('[ProfileMainScreen] Sign out error:', error);
        window.alert('Failed to sign out');
      }
      return;
    }

    // For native, use Alert.alert
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
              console.log('[ProfileMainScreen] Calling signOut...');
              await signOut();
              console.log('[ProfileMainScreen] Sign out completed');
            } catch (error) {
              console.error('[ProfileMainScreen] Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profile?.firstName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.text.primary }]}>
          {profile?.firstName || profile?.lastName
            ? `${profile.firstName} ${profile.lastName}`.trim()
            : 'User'}
        </Text>
        <Text style={[styles.email, { color: theme.text.secondary }]}>{profile?.email}</Text>
      </View>

      {/* Stats Summary */}
      {profile && (
        <View style={[styles.statsCard, { backgroundColor: theme.background.secondary }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>-</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Workouts</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border.light }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>-</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border.light }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>-</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>PRs</Text>
          </View>
        </View>
      )}

      {/* Menu Section - Profile */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.light }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={[styles.menuItemText, { color: theme.text.primary }]}>Edit Profile</Text>
          <Text style={[styles.menuArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.light }]}
          onPress={() => navigation.navigate('Preferences')}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={[styles.menuItemText, { color: theme.text.primary }]}>Workout Preferences</Text>
          <Text style={[styles.menuArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Section - App */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>App</Text>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.light }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuIcon}>🔧</Text>
          <Text style={[styles.menuItemText, { color: theme.text.primary }]}>Settings</Text>
          <Text style={[styles.menuArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.light }]}
          onPress={() => {
            Alert.alert('About', 'Intensely HICT Workout App\nVersion 1.0.0\n\nBuilt with React Native & Expo');
          }}
        >
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={[styles.menuItemText, { color: theme.text.primary }]}>About</Text>
          <Text style={[styles.menuArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={isLoading}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.text.tertiary }]}>Made with ❤️ for fitness enthusiasts</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[5],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing[1],
  },
  email: {
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    marginBottom: spacing[6],
    padding: spacing[5],
    borderRadius: borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    marginHorizontal: spacing[3],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing[5],
    marginBottom: spacing[2],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
  },
  menuArrow: {
    fontSize: 18,
  },
  signOutButton: {
    margin: spacing[5],
    marginTop: spacing[2],
    padding: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: spacing[8],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});

export default ProfileMainScreen;
