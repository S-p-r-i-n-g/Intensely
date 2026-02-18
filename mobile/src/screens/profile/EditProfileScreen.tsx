import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores';
import { usersApi } from '../../api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, syncProfile } = useAuthStore();
  const { theme } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert('Invalid Input', 'Please enter at least a first or last name.');
      return;
    }

    try {
      setIsSaving(true);

      await usersApi.updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      // Sync profile to update state
      await syncProfile();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert(
        'Error',
        error.message || 'Could not update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {firstName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={[styles.avatarHint, { color: theme.text.tertiary }]}>Tap to change avatar (coming soon)</Text>
        </View>

        {/* Form Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text.primary }]}>First Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={theme.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text.primary }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={theme.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text.primary }]}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, { backgroundColor: theme.background.elevated, color: theme.text.tertiary }]}
              value={profile?.email || ''}
              editable={false}
            />
            <Text style={[styles.inputHelper, { color: theme.text.tertiary }]}>Email cannot be changed</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing[10],
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  avatarHint: {
    fontSize: 13,
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing[5],
  },
  inputGroup: {
    marginBottom: spacing[5],
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  input: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputHelper: {
    fontSize: 12,
    marginTop: spacing[1],
  },
  saveButton: {
    marginHorizontal: spacing[5],
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
