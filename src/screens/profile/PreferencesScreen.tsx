import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Preferences'>;

const PreferencesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, syncProfile } = useAuthStore();
  const { theme } = useTheme();

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('intermediate');
  const [smallSpace, setSmallSpace] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    if (profile?.preferences) {
      setSelectedDifficulty(profile.preferences.defaultDifficulty || 'intermediate');
      setSmallSpace(profile.preferences.smallSpace || false);
      setQuiet(profile.preferences.quiet || false);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await usersApi.updatePreferences({
        defaultDifficulty: selectedDifficulty,
        smallSpace,
        quiet,
      });

      // Sync profile to update state
      await syncProfile();

      Alert.alert('Success', 'Preferences saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not save preferences. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Workout Preferences</Text>
        <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
          Customize your default workout settings
        </Text>
      </View>

      {/* Default Difficulty */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Default Difficulty Level</Text>
        <Text style={[styles.sectionDescription, { color: theme.text.secondary }]}>
          This will be used as your default when generating workouts
        </Text>

        <View style={styles.optionsContainer}>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.optionButton,
                { backgroundColor: theme.background.secondary },
                selectedDifficulty === diff && styles.optionButtonActive,
              ]}
              onPress={() => setSelectedDifficulty(diff)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  { color: theme.text.primary },
                  selectedDifficulty === diff && styles.optionButtonTextActive,
                ]}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Space Constraints */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Space & Environment</Text>
        <Text style={[styles.sectionDescription, { color: theme.text.secondary }]}>
          Set default constraints for your workout space
        </Text>

        <TouchableOpacity
          style={[styles.toggleOption, { borderBottomColor: theme.border.light }]}
          onPress={() => setSmallSpace(!smallSpace)}
        >
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: theme.text.primary }]}>Small Space</Text>
            <Text style={[styles.toggleDescription, { color: theme.text.secondary }]}>
              Prefer exercises that don't require much room
            </Text>
          </View>
          <View style={[styles.toggle, { backgroundColor: theme.border.medium }, smallSpace && styles.toggleActive]}>
            <View style={[styles.toggleCircle, smallSpace && styles.toggleCircleActive]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleOption, { borderBottomColor: theme.border.light }]}
          onPress={() => setQuiet(!quiet)}
        >
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: theme.text.primary }]}>Quiet Mode</Text>
            <Text style={[styles.toggleDescription, { color: theme.text.secondary }]}>
              Avoid jumping exercises and loud movements
            </Text>
          </View>
          <View style={[styles.toggle, { backgroundColor: theme.border.medium }, quiet && styles.toggleActive]}>
            <View style={[styles.toggleCircle, quiet && styles.toggleCircleActive]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={[styles.infoCard, { backgroundColor: theme.background.elevated }]}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={[styles.infoText, { color: theme.text.secondary }]}>
          You can always override these settings when creating a specific workout
        </Text>
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
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[7],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: spacing[4],
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primary[500],
  },
  optionButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  toggleDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary[500],
  },
  toggleCircle: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: spacing[5],
    marginBottom: spacing[6],
    padding: spacing[4],
    borderRadius: borderRadius.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[10],
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

export default PreferencesScreen;
