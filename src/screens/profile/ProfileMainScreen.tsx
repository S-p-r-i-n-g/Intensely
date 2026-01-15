import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const { width } = Dimensions.get('window');

const ProfileMainScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, signOut, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = () => {
    console.log('[ProfileMainScreen] Sign out button pressed');
    setShowSignOutModal(true);
  };

  const cancelSignOut = () => {
    console.log('[ProfileMainScreen] Sign out cancelled');
    setShowSignOutModal(false);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    try {
      console.log('[ProfileMainScreen] Calling signOut...');
      await signOut();
      console.log('[ProfileMainScreen] Sign out completed');
    } catch (error) {
      console.error('[ProfileMainScreen] Sign out error:', error);
      // Could show an error modal here if needed
    }
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

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={isLoading}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelSignOut}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background.elevated }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Sign Out?</Text>
            <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: theme.background.secondary }]}
                onPress={cancelSignOut}
              >
                <Text style={[styles.modalCancelButtonText, { color: theme.text.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSignOutButton]}
                onPress={confirmSignOut}
              >
                <Text style={styles.modalSignOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: spacing[6],
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    // backgroundColor applied dynamically via theme
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSignOutButton: {
    backgroundColor: colors.error[500],
  },
  modalSignOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileMainScreen;
