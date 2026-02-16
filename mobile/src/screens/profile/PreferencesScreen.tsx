import React, { useState, useEffect } from 'react';
import {
  View,
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
import { Text, Button, PillSelector, Stepper } from '../../components/ui';
import { spacing } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Preferences'>;

// Pill options (same as NewWorkoutScreen)
const WORK_OPTIONS = [
  { value: 15, label: '15s' },
  { value: 20, label: '20s' },
  { value: 30, label: '30s' },
  { value: 45, label: '45s' },
];

const REST_OPTIONS = [
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
  { value: 90, label: '90s' },
  { value: 120, label: '120s' },
];

const WARMUP_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 120, label: '2 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
];

const COOLDOWN_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 120, label: '2 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
];

const PreferencesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile, syncProfile } = useAuthStore();
  const { theme } = useTheme();

  // Workout timing defaults
  const [circuits, setCircuits] = useState(3);
  const [sets, setSets] = useState(3);
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(60);
  const [warmUp, setWarmUp] = useState(0);
  const [coolDown, setCoolDown] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from profile preferences
  useEffect(() => {
    const prefs = profile?.preferences;
    if (prefs) {
      setCircuits(prefs.defaultCircuits ?? 3);
      setSets(prefs.defaultSets ?? 3);
      setWork(prefs.defaultIntervalSeconds ?? 30);
      setRest(prefs.defaultRestSeconds ?? 60);
      setWarmUp(prefs.defaultWarmUpSeconds ?? 0);
      setCoolDown(prefs.defaultCoolDownSeconds ?? 0);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await usersApi.updatePreferences({
        defaultCircuits: circuits,
        defaultSets: sets,
        defaultIntervalSeconds: work,
        defaultRestSeconds: rest,
        defaultWarmUpSeconds: warmUp,
        defaultCoolDownSeconds: coolDown,
      });

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
        <Text variant="h2" style={{ color: theme.text.primary }}>
          Workout Preferences
        </Text>
        <Text variant="body" style={{ color: theme.text.secondary }}>
          Set your default workout timing. You can always override these when creating a workout.
        </Text>
      </View>

      {/* Circuits & Sets */}
      <View style={styles.section}>
        <View style={styles.stepperRow}>
          <View style={styles.stepperHalf}>
            <Stepper
              label="Circuits"
              value={circuits}
              onIncrease={() => setCircuits(circuits + 1)}
              onDecrease={() => setCircuits(circuits - 1)}
              min={1}
              max={10}
              size="small"
            />
          </View>
          <View style={styles.stepperHalf}>
            <Stepper
              label="Sets"
              value={sets}
              onIncrease={() => setSets(sets + 1)}
              onDecrease={() => setSets(sets - 1)}
              min={1}
              max={5}
              size="small"
            />
          </View>
        </View>
      </View>

      {/* Work */}
      <View style={styles.section}>
        <PillSelector
          label="Work"
          options={WORK_OPTIONS}
          currentValue={work}
          onChange={setWork}
        />
      </View>

      {/* Rest */}
      <View style={styles.section}>
        <PillSelector
          label="Rest"
          options={REST_OPTIONS}
          currentValue={rest}
          onChange={setRest}
        />
      </View>

      {/* Warm Up */}
      <View style={styles.section}>
        <PillSelector
          label="Warm Up"
          options={WARMUP_OPTIONS}
          currentValue={warmUp}
          onChange={setWarmUp}
        />
      </View>

      {/* Cool Down */}
      <View style={styles.section}>
        <PillSelector
          label="Cool Down"
          options={COOLDOWN_OPTIONS}
          currentValue={coolDown}
          onChange={setCoolDown}
        />
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            'Save Preferences'
          )}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[8],
    gap: spacing[2],
  },
  section: {
    paddingHorizontal: spacing[5],
  },
  stepperRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  stepperHalf: {
    flex: 1,
  },
  buttonContainer: {
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
});

export default PreferencesScreen;
