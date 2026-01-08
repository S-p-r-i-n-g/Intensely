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

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Preferences'>;

const PreferencesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, syncProfile } = useAuthStore();

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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Preferences</Text>
        <Text style={styles.headerSubtitle}>
          Customize your default workout settings
        </Text>
      </View>

      {/* Default Difficulty */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Difficulty Level</Text>
        <Text style={styles.sectionDescription}>
          This will be used as your default when generating workouts
        </Text>

        <View style={styles.optionsContainer}>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.optionButton,
                selectedDifficulty === diff && styles.optionButtonActive,
              ]}
              onPress={() => setSelectedDifficulty(diff)}
            >
              <Text
                style={[
                  styles.optionButtonText,
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
        <Text style={styles.sectionTitle}>Space & Environment</Text>
        <Text style={styles.sectionDescription}>
          Set default constraints for your workout space
        </Text>

        <TouchableOpacity
          style={styles.toggleOption}
          onPress={() => setSmallSpace(!smallSpace)}
        >
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Small Space</Text>
            <Text style={styles.toggleDescription}>
              Prefer exercises that don't require much room
            </Text>
          </View>
          <View style={[styles.toggle, smallSpace && styles.toggleActive]}>
            <View style={[styles.toggleCircle, smallSpace && styles.toggleCircleActive]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleOption}
          onPress={() => setQuiet(!quiet)}
        >
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Quiet Mode</Text>
            <Text style={styles.toggleDescription}>
              Avoid jumping exercises and loud movements
            </Text>
          </View>
          <View style={[styles.toggle, quiet && styles.toggleActive]}>
            <View style={[styles.toggleCircle, quiet && styles.toggleCircleActive]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#FF6B35',
  },
  optionButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E5E5E5',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF6B35',
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
    backgroundColor: '#FFF5F2',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  saveButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
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
