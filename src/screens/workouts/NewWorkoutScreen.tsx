/**
 * NewWorkoutScreen
 * Unified workout builder that replaces the old TakeTheWheel flow
 * Features: Settings accordion, Sync/Split exercise mode, circuit tabs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { useWorkoutBuilder, WorkoutSettings } from '../../hooks/useWorkoutBuilder';
import { workoutsApi } from '../../api';
import { useAuthStore } from '../../stores';
import { Text, Button, Input, Card, PillSelector, Stepper } from '../../components/ui';
import { SettingsAccordion } from '../../components/workout/SettingsAccordion';
import { useTheme } from '../../theme';
import { spacing, colors, borderRadius } from '../../tokens';
import { PlayIcon, ArrowsRightLeftIcon } from 'react-native-heroicons/outline';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'NewWorkout'>;
type RoutePropType = RouteProp<HomeStackParamList, 'NewWorkout'>;

// Timing options
const WORK_OPTIONS = [
  { value: 20, label: '20s' },
  { value: 30, label: '30s' },
  { value: 40, label: '40s' },
  { value: 45, label: '45s' },
  { value: 60, label: '60s' },
];

const REST_OPTIONS = [
  { value: 10, label: '10s' },
  { value: 15, label: '15s' },
  { value: 20, label: '20s' },
  { value: 30, label: '30s' },
];

const WARMUP_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
];

const COOLDOWN_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
];

const NewWorkoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const {
    state,
    setName,
    setSetting,
    toggleSplit,
    setExercises,
    setActiveTab,
    toggleSettings,
    getSettingsSummary,
    getEstimatedDuration,
    getActiveCircuitIndex,
    getCurrentExercises,
  } = useWorkoutBuilder();

  // Handle returning from exercise selection
  useEffect(() => {
    if (route.params?.selectedExerciseIds) {
      const circuitIndex = route.params.circuitIndex ?? getActiveCircuitIndex();
      setExercises(circuitIndex, route.params.selectedExerciseIds);
    }
  }, [route.params?.selectedExerciseIds, route.params?.circuitIndex]);

  // Validate workout name for duplicates
  useEffect(() => {
    const checkNameUniqueness = async () => {
      if (!state.name.trim() || !user) {
        setNameError(null);
        return;
      }

      try {
        const response = await workoutsApi.getAll({});
        const duplicate = response.data.find(
          (w: any) =>
            w.name.toLowerCase() === state.name.trim().toLowerCase() &&
            w.createdBy === user.id &&
            !w.deletedAt
        );

        if (duplicate) {
          setNameError('You already have a workout with this name');
        } else {
          setNameError(null);
        }
      } catch (error) {
        console.error('Error checking workout name:', error);
        setNameError(null);
      }
    };

    const timeoutId = setTimeout(checkNameUniqueness, 500);
    return () => clearTimeout(timeoutId);
  }, [state.name, user]);

  const handleSelectExercises = useCallback(() => {
    const circuitIndex = getActiveCircuitIndex();
    navigation.navigate('ExerciseSelection', {
      selectedIds: getCurrentExercises(),
      circuitIndex,
      // Pass current state to restore on return
      workoutName: state.name,
      circuits: state.settings.circuits,
      setsPerCircuit: state.settings.sets,
      workInterval: state.settings.work,
      restInterval: state.settings.rest,
    });
  }, [navigation, state, getActiveCircuitIndex, getCurrentExercises]);

  const handleSaveWorkout = async (startImmediately: boolean = false) => {
    // Validate
    if (!state.name.trim()) {
      Alert.alert('Missing Name', 'Please give your workout a name.');
      return;
    }

    if (nameError) {
      Alert.alert('Invalid Name', nameError);
      return;
    }

    const exercises = getCurrentExercises();
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Please select at least one exercise.');
      return;
    }

    try {
      setIsLoading(true);

      // Build circuits array based on sync/split mode
      const circuitsData = Array.from({ length: state.settings.circuits }, (_, i) => {
        const circuitExercises = state.isSplit
          ? (state.exercises[i] || state.exercises[0] || [])
          : (state.exercises[0] || []);

        return {
          exercises: circuitExercises,
          sets: state.settings.sets,
          intervalSeconds: state.settings.work,
          restSeconds: state.settings.rest,
        };
      });

      const params = {
        name: state.name,
        circuits: circuitsData,
        intervalSeconds: state.settings.work,
        restSeconds: state.settings.rest,
        sets: state.settings.sets,
      };

      const response = await workoutsApi.takeTheWheel(params);

      if (startImmediately) {
        // Navigate directly to workout execution
        navigation.navigate('WorkoutExecution', { workoutId: response.data.id });
      } else {
        // Navigate to workouts list
        // @ts-ignore - navigating across stacks
        navigation.navigate('Workouts', { screen: 'WorkoutsList' });
      }
    } catch (error: any) {
      console.error('Failed to save workout:', error);
      Alert.alert(
        'Save Failed',
        error.response?.data?.message || 'Could not save workout. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderCircuitTabs = () => {
    if (!state.isSplit || state.settings.circuits <= 1) return null;

    return (
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {Array.from({ length: state.settings.circuits }, (_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.tab,
                  { backgroundColor: theme.background.elevated },
                  state.activeCircuitTab === i && styles.tabActive,
                ]}
                onPress={() => setActiveTab(i)}
              >
                <Text
                  variant="bodySmall"
                  style={[
                    styles.tabText,
                    state.activeCircuitTab === i && styles.tabTextActive,
                  ]}
                >
                  Circuit {i + 1}
                </Text>
                <Text
                  variant="caption"
                  style={[
                    styles.tabCount,
                    { color: theme.text.secondary },
                    state.activeCircuitTab === i && styles.tabCountActive,
                  ]}
                >
                  {(state.exercises[i] || []).length} exercises
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2" style={[styles.title, { color: theme.text.primary }]}>
          New Workout
        </Text>
        {getEstimatedDuration() > 0 && (
          <Text variant="body" style={{ color: theme.text.secondary }}>
            Est. {getEstimatedDuration()} min
          </Text>
        )}
      </View>

      {/* Workout Name */}
      <View style={styles.section}>
        <Input
          label="Workout Name"
          placeholder="e.g., Morning HIIT"
          value={state.name}
          onChangeText={setName}
          error={nameError || undefined}
        />
      </View>

      {/* Settings Accordion */}
      <View style={styles.section}>
        <SettingsAccordion
          isOpen={state.isSettingsExpanded}
          onToggle={toggleSettings}
          summaryText={getSettingsSummary()}
        >
          {/* Circuits & Sets */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsHalf}>
              <Stepper
                label="Circuits"
                value={state.settings.circuits}
                onIncrease={() => setSetting('circuits', state.settings.circuits + 1)}
                onDecrease={() => setSetting('circuits', state.settings.circuits - 1)}
                min={1}
                max={10}
                size="small"
              />
            </View>
            <View style={styles.settingsHalf}>
              <Stepper
                label="Sets"
                value={state.settings.sets}
                onIncrease={() => setSetting('sets', state.settings.sets + 1)}
                onDecrease={() => setSetting('sets', state.settings.sets - 1)}
                min={1}
                max={5}
                size="small"
              />
            </View>
          </View>

          {/* Work Interval */}
          <PillSelector
            label="Work Interval"
            options={WORK_OPTIONS}
            currentValue={state.settings.work}
            onChange={(value) => setSetting('work', value)}
          />

          {/* Rest Interval */}
          <PillSelector
            label="Rest Interval"
            options={REST_OPTIONS}
            currentValue={state.settings.rest}
            onChange={(value) => setSetting('rest', value)}
          />

          {/* Warm-up */}
          <PillSelector
            label="Warm-up"
            options={WARMUP_OPTIONS}
            currentValue={state.settings.warmUp}
            onChange={(value) => setSetting('warmUp', value)}
          />

          {/* Cool-down */}
          <PillSelector
            label="Cool-down"
            options={COOLDOWN_OPTIONS}
            currentValue={state.settings.coolDown}
            onChange={(value) => setSetting('coolDown', value)}
          />
        </SettingsAccordion>
      </View>

      {/* Sync/Split Toggle */}
      {state.settings.circuits > 1 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.splitToggle, { backgroundColor: theme.background.elevated }]}
            onPress={toggleSplit}
            activeOpacity={0.7}
          >
            <ArrowsRightLeftIcon size={20} color={colors.primary[500]} />
            <View style={styles.splitToggleContent}>
              <Text variant="body" style={[styles.splitToggleTitle, { color: theme.text.primary }]}>
                {state.isSplit ? 'Split Mode' : 'Sync Mode'}
              </Text>
              <Text variant="caption" style={{ color: theme.text.secondary }}>
                {state.isSplit
                  ? 'Different exercises per circuit'
                  : 'Same exercises in all circuits'}
              </Text>
            </View>
            <View style={[styles.splitIndicator, state.isSplit && styles.splitIndicatorActive]}>
              <Text variant="caption" style={styles.splitIndicatorText}>
                {state.isSplit ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Circuit Tabs (only in split mode) */}
      {renderCircuitTabs()}

      {/* Exercise Selection */}
      <View style={styles.section}>
        <Text variant="bodyLarge" style={[styles.sectionLabel, { color: theme.text.primary }]}>
          {state.isSplit ? `Circuit ${state.activeCircuitTab + 1} Exercises` : 'Exercises'}
        </Text>
        <Card
          variant="filled"
          padding="medium"
          onPress={handleSelectExercises}
          style={styles.exerciseCard}
        >
          <View style={styles.exerciseCardContent}>
            <Text variant="body" style={{ color: theme.text.primary }}>
              {getCurrentExercises().length > 0
                ? `${getCurrentExercises().length} exercises selected`
                : 'Select Exercises'}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          variant="secondary"
          fullWidth
          onPress={() => handleSaveWorkout(false)}
          loading={isLoading}
          disabled={isLoading || !!nameError}
          style={styles.saveButton}
        >
          Save Workout
        </Button>

        <Button
          variant="primary"
          size="large"
          fullWidth
          onPress={() => handleSaveWorkout(true)}
          loading={isLoading}
          disabled={isLoading || !!nameError}
        >
          <View style={styles.buttonContent}>
            <PlayIcon size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Save & Start</Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing[10],
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[4],
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  settingsRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[2],
  },
  settingsHalf: {
    flex: 1,
  },
  splitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    gap: spacing[3],
  },
  splitToggleContent: {
    flex: 1,
  },
  splitToggleTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  splitIndicator: {
    backgroundColor: colors.secondary[300],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  splitIndicatorActive: {
    backgroundColor: colors.primary[500],
  },
  splitIndicatorText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
  tabsContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    minWidth: 100,
  },
  tabActive: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontWeight: '600',
    marginBottom: 2,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabCount: {
    fontSize: 11,
  },
  tabCountActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  arrow: {
    fontSize: 18,
    color: colors.secondary[400],
  },
  buttonContainer: {
    padding: spacing[5],
    paddingTop: spacing[6],
    gap: spacing[3],
  },
  saveButton: {
    marginBottom: spacing[1],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewWorkoutScreen;
