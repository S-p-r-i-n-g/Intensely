import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';
import { Text } from '../../components/ui';
import { ActionButton } from '../../components/home';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from 'react-native-heroicons/outline';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const { width } = Dimensions.get('window');

const ProfileMainScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, signOut, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    try {
      await signOut();
    } catch (error) {
      console.error('[ProfileMainScreen] Sign out error:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1" style={styles.greeting}>
          Profile
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          {profile?.email || 'Manage your account'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <ActionButton
          title="Edit Profile"
          variant="secondary"
          icon={<UserIcon size={24} color="#000000" />}
          onPress={() => navigation.navigate('EditProfile')}
        />

        <ActionButton
          title="Workout Preferences"
          variant="secondary"
          icon={<Cog6ToothIcon size={24} color="#000000" />}
          onPress={() => navigation.navigate('Preferences')}
        />

        <ActionButton
          title="Sign Out"
          variant="secondary"
          icon={<ArrowRightOnRectangleIcon size={24} color="#000000" />}
          onPress={handleSignOut}
        />
      </View>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelSignOut}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background.elevated }]}>
            <Text variant="h3" style={[styles.modalTitle, { color: theme.text.primary }]}>
              Sign Out?
            </Text>
            <Text variant="body" style={[styles.modalMessage, { color: theme.text.secondary }]}>
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 24,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
  },
  actionsContainer: {
    marginBottom: spacing[6],
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
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  modalMessage: {
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
    borderRadius: 100, // Pill shape
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
