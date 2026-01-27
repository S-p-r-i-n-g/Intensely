/**
 * NewWorkoutScreen
 * Unified workout builder that replaces the old TakeTheWheel flow
 * Features: Settings accordion, Sync/Customize exercise mode, circuit tabs
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { useWorkoutBuilder } from '../../hooks/useWorkoutBuilder';
import { workoutsApi } from '../../api';
import { Text, Button, Card, PillSelector, Stepper } from '../../components/ui';
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

  const [isLoading, setIsLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [pendingStartImmediately, setPendingStartImmediately] = useState(false);

  const {
    state,
    setName,
    setSetting,
    setSynced,
    setExercises,
    setActiveTab,
    toggleSettings,
    toggleExercises,
    loadWorkout,
    getSettingsSummary,
    getExercisesSummary,
    getEstimatedDuration,
    getActiveCircuitIndex,
    getCurrentExercises,
  } = useWorkoutBuilder();

  // Handle returning from exercise selection — restore full state
  useEffect(() => {
    if (route.params?.selectedExerciseIds) {
      const circuitIndex = route.params.circuitIndex ?? 0;

      // Rebuild exercises map: start with persisted data, overlay the newly selected circuit
      let restoredExercises: Record<number, string[]> = { 0: [] };
      if (route.params.exercisesJson) {
        try {
          restoredExercises = JSON.parse(route.params.exercisesJson);
        } catch {}
      }
      restoredExercises[circuitIndex] = route.params.selectedExerciseIds;

      // Restore full workout state from route params
      loadWorkout({
        ...(route.params.workoutName !== undefined && { name: route.params.workoutName }),
        ...(route.params.isSynced !== undefined && { isSynced: route.params.isSynced }),
        exercises: restoredExercises,
        activeCircuitTab: circuitIndex,
        settings: {
          work: route.params.workInterval ?? state.settings.work,
          rest: route.params.restInterval ?? state.settings.rest,
          warmUp: state.settings.warmUp,
          coolDown: state.settings.coolDown,
          circuits: route.params.circuits ?? state.settings.circuits,
          sets: route.params.setsPerCircuit ?? state.settings.sets,
        },
      });
    }
  }, [route.params?.selectedExerciseIds, route.params?.circuitIndex]);

  const handleSelectExercises = useCallback(() => {
    const circuitIndex = getActiveCircuitIndex();
    navigation.navigate('ExerciseSelection', {
      selectedIds: getCurrentExercises(),
      circuitIndex,
      // Pass full state to restore on return
      workoutName: state.name,
      circuits: state.settings.circuits,
      setsPerCircuit: state.settings.sets,
      workInterval: state.settings.work,
      restInterval: state.settings.rest,
      isSynced: state.isSynced,
      exercisesJson: JSON.stringify(state.exercises),
    });
  }, [navigation, state, getActiveCircuitIndex, getCurrentExercises]);

  const handleSavePress = useCallback((startImmediately: boolean) => {
    const exercises = getCurrentExercises();
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Please select at least one exercise.');
      return;
    }
    setPendingStartImmediately(startImmediately);
    setModalName(state.name);
    setShowNameModal(true);
  }, [getCurrentExercises, state.name]);

  const handleModalSave = async () => {
    const trimmedName = modalName.trim();
    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please give your workout a name.');
      return;
    }

    setName(trimmedName);
    setShowNameModal(false);

    try {
      setIsLoading(true);

      // Build circuits array based on sync/customize mode
      const circuitsData = Array.from({ length: state.settings.circuits }, (_, i) => {
        const circuitExercises = !state.isSynced
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
        name: trimmedName,
        circuits: circuitsData,
        intervalSeconds: state.settings.work,
        restSeconds: state.settings.rest,
        sets: state.settings.sets,
      };

      const response = await workoutsApi.takeTheWheel(params);

      if (pendingStartImmediately) {
        navigation.navigate('WorkoutExecution', { workoutId: response.data.id });
      } else {
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

  const handleSyncToggle = useCallback(() => {
    setSynced(!state.isSynced);
  }, [state.isSynced, setSynced]);

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

          {/* Work */}
          <PillSelector
            label="Work"
            options={WORK_OPTIONS}
            currentValue={state.settings.work}
            onChange={(value) => setSetting('work', value)}
          />

          {/* Rest */}
          <PillSelector
            label="Rest"
            options={REST_OPTIONS}
            currentValue={state.settings.rest}
            onChange={(value) => setSetting('rest', value)}
          />

          {/* Warm Up */}
          <PillSelector
            label="Warm Up"
            options={WARMUP_OPTIONS}
            currentValue={state.settings.warmUp}
            onChange={(value) => setSetting('warmUp', value)}
          />

          {/* Cool Down */}
          <PillSelector
            label="Cool Down"
            options={COOLDOWN_OPTIONS}
            currentValue={state.settings.coolDown}
            onChange={(value) => setSetting('coolDown', value)}
          />
        </SettingsAccordion>
      </View>

      {/* Circuit Exercises */}
      <View style={styles.section}>
        <SettingsAccordion
          title="Circuit Exercises"
          isOpen={state.isExercisesExpanded}
          onToggle={toggleExercises}
          summaryText={getExercisesSummary()}
          maxHeight={400}
        >
          {/* Sync toggle (when circuits > 1) */}
          {state.settings.circuits > 1 && (
            <TouchableOpacity
              style={[styles.syncToggle, { backgroundColor: theme.background.elevated }]}
              onPress={handleSyncToggle}
              activeOpacity={0.7}
            >
              <ArrowsRightLeftIcon size={20} color={colors.primary[500]} />
              <View style={styles.syncToggleContent}>
                <Text variant="body" style={[styles.syncToggleTitle, { color: theme.text.primary }]}>
                  Sync all circuits?
                </Text>
              </View>
              <View style={[styles.syncIndicator, state.isSynced && styles.syncIndicatorActive]}>
                <Text variant="caption" style={styles.syncIndicatorText}>
                  {state.isSynced ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Circuit tabs (when not synced and circuits > 1) */}
          {!state.isSynced && state.settings.circuits > 1 && (
            <View style={styles.circuitTabsInSection}>
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
                        C{i + 1}
                      </Text>
                      <Text
                        variant="caption"
                        style={[
                          styles.tabCount,
                          { color: theme.text.secondary },
                          state.activeCircuitTab === i && styles.tabCountActive,
                        ]}
                      >
                        {(state.exercises[i] || []).length}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Exercise picker card */}
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
        </SettingsAccordion>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          variant="secondary"
          fullWidth
          onPress={() => handleSavePress(false)}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
        >
          Save Workout
        </Button>

        <Button
          variant="primary"
          size="large"
          fullWidth
          onPress={() => handleSavePress(true)}
          loading={isLoading}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <PlayIcon size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Save & Start</Text>
          </View>
        </Button>
      </View>

      {/* Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.background.elevated }]}>
            <Text variant="h3" style={[styles.modalTitle, { color: theme.text.primary }]}>
              Name Your Workout
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.background.primary,
                  color: theme.text.primary,
                  borderColor: theme.border.medium,
                },
              ]}
              placeholder="e.g., Morning HIIT"
              placeholderTextColor={theme.text.tertiary}
              value={modalName}
              onChangeText={setModalName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleModalSave}
            />
            <View style={styles.modalButtons}>
              <Button
                variant="secondary"
                onPress={() => setShowNameModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleModalSave}
                loading={isLoading}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  settingsRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[2],
  },
  settingsHalf: {
    flex: 1,
  },
  syncToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    gap: spacing[3],
  },
  syncToggleContent: {
    flex: 1,
  },
  syncToggleTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  syncIndicator: {
    backgroundColor: colors.secondary[300],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  syncIndicatorActive: {
    backgroundColor: colors.primary[500],
  },
  syncIndicatorText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
  circuitTabsInSection: {
    marginVertical: spacing[3],
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
    marginTop: spacing[3],
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing[5],
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    marginBottom: spacing[5],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
});

export default NewWorkoutScreen;
