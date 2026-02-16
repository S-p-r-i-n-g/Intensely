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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { useWorkoutBuilder, DifficultyResult } from '../../hooks/useWorkoutBuilder';
import { useAuthStore } from '../../stores';
import { workoutsApi, exercisesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { Text, Button, PillSelector, Stepper } from '../../components/ui';
import { SettingsAccordion } from '../../components/workout/SettingsAccordion';
import { useTheme } from '../../theme';
import { spacing, colors, borderRadius } from '../../tokens';
import { PlayIcon, ArrowsRightLeftIcon, ChevronRightIcon, PencilIcon } from 'react-native-heroicons/outline';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'NewWorkout'>;
type RoutePropType = RouteProp<HomeStackParamList, 'NewWorkout'>;

// Timing options
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

// Map exercise difficulty string to numeric value (1-3 scale per design.md v1.3)
const difficultyToNumber = (difficulty: string): number => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 1;
    case 'intermediate':
      return 2;
    case 'advanced':
      return 3;
    default:
      return 2; // Default to intermediate
  }
};

const MetricChip = ({ value, label, theme }: { value: string; label: string; theme: any }) => (
  <View style={[styles.chip, { backgroundColor: theme.background.tertiary, borderColor: theme.border.strong }]}>
    <Text variant="caption" style={[styles.chipValue, { color: theme.text.primary }]}>
      {value}
    </Text>
    <Text variant="caption" style={[styles.chipLabel, { color: theme.text.secondary }]}>
      {label}
    </Text>
  </View>
);

const NewWorkoutScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();
  const { profile } = useAuthStore();
  const preferences = profile?.preferences;

  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [pendingStartImmediately, setPendingStartImmediately] = useState(false);
  const [exerciseMetadata, setExerciseMetadata] = useState<Map<string, { name: string; difficulty: number }>>(new Map());

  // Edit mode detection
  const isEditMode = !!route.params?.workoutId;

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
    getSettingsGroups,
    getExercisesMetrics,
    getExerciseGroups,
    getEstimatedDuration,
    getActiveCircuitIndex,
    getCurrentExercises,
    getDifficulty,
  } = useWorkoutBuilder({
    settings: {
      work: preferences?.defaultIntervalSeconds ?? 30,
      rest: preferences?.defaultRestSeconds ?? 60,
      circuits: preferences?.defaultCircuits ?? 3,
      sets: preferences?.defaultSets ?? 3,
      warmUp: preferences?.defaultWarmUpSeconds ?? 0,
      coolDown: preferences?.defaultCoolDownSeconds ?? 0,
    },
  });

  // Hydrate workout state when editing an existing workout
  useEffect(() => {
    if (!isEditMode || route.params?.selectedExerciseIds) return; // Skip if returning from exercise selection

    const hydrateWorkout = async () => {
      try {
        setIsHydrating(true);
        const response = await workoutsApi.getById(route.params!.workoutId!);
        const workout = (response as any).data;

        if (!workout) return;

        // Build exercises map from workout circuits
        const exercisesMap: Record<number, string[]> = {};
        const allSame = workout.circuits?.every(
          (c: any) => JSON.stringify(c.exercises.map((e: any) => e.exerciseId)) ===
                      JSON.stringify(workout.circuits[0]?.exercises.map((e: any) => e.exerciseId))
        );

        workout.circuits?.forEach((circuit: any, index: number) => {
          exercisesMap[index] = circuit.exercises.map((ex: any) => ex.exerciseId);
        });

        loadWorkout({
          name: workout.name,
          isSynced: allSame,
          exercises: exercisesMap,
          settings: {
            work: workout.intervalSeconds || 30,
            rest: workout.restSeconds || 60,
            circuits: workout.totalCircuits || 3,
            sets: workout.setsPerCircuit || 3,
            warmUp: 0,
            coolDown: 0,
          },
        });
      } catch (error) {
        console.error('Failed to load workout for editing:', error);
        Alert.alert('Error', 'Could not load workout. Please try again.');
        navigation.goBack();
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateWorkout();
  }, [isEditMode, route.params?.workoutId]);

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

  // Fetch exercise metadata (names and difficulty) for IDs not in cache
  useEffect(() => {
    const allIds = new Set<string>();
    Object.values(state.exercises).forEach((ids) => {
      ids.forEach((id) => allIds.add(id));
    });

    const missingIds = Array.from(allIds).filter((id) => !exerciseMetadata.has(id));
    if (missingIds.length === 0) return;

    const fetchExerciseMetadata = async () => {
      try {
        const response = await exercisesApi.getAll({ limit: 500 });
        // Handle both response formats: direct array or nested data
        const data = (response as any).data || {};
        const exercises = Array.isArray(data)
          ? data
          : data.exercises || data.data || [];
        const newMetadata = new Map(exerciseMetadata);
        exercises.forEach((ex: Exercise) => {
          if (missingIds.includes(ex.id)) {
            newMetadata.set(ex.id, {
              name: ex.name,
              difficulty: difficultyToNumber(ex.difficulty || 'intermediate'),
            });
          }
        });
        setExerciseMetadata(newMetadata);
      } catch (error) {
        console.error('Failed to fetch exercise metadata:', error);
      }
    };

    fetchExerciseMetadata();
  }, [state.exercises]);

  // Helper to get exercise name from cache
  const getExerciseName = useCallback((id: string) => {
    return exerciseMetadata.get(id)?.name || 'Loading...';
  }, [exerciseMetadata]);

  // Calculate average exercise difficulty (1-3 scale) for the difficulty formula
  const getAvgExerciseDifficulty = useCallback((): number => {
    const allIds = new Set<string>();
    Object.values(state.exercises).forEach((ids) => {
      ids.forEach((id) => allIds.add(id));
    });
    const difficulties = Array.from(allIds)
      .map((id) => exerciseMetadata.get(id)?.difficulty)
      .filter((d): d is number => d !== undefined);

    if (difficulties.length === 0) return 1.5; // Default per design.md v1.3
    return difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
  }, [state.exercises, exerciseMetadata]);

  // Format exercise names with truncation
  const formatExerciseNames = useCallback((exerciseIds: string[], maxDisplay = 3) => {
    if (exerciseIds.length === 0) return 'No exercises';
    const names = exerciseIds.slice(0, maxDisplay).map((id) => getExerciseName(id));
    const remaining = exerciseIds.length - maxDisplay;
    if (remaining > 0) {
      return `${names.join(', ')} +${remaining} more`;
    }
    return names.join(', ');
  }, [getExerciseName]);

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

  // Core save logic extracted for reuse
  const performSave = useCallback(async (workoutName: string, startImmediately: boolean) => {
    const trimmedName = workoutName.trim();
    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please give your workout a name.');
      return;
    }

    setName(trimmedName);

    try {
      setIsLoading(true);

      // If editing, delete the old workout first (app's established update pattern)
      if (isEditMode && route.params?.workoutId) {
        await workoutsApi.delete(route.params.workoutId);
      }

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

      // Calculate difficulty level to send to backend
      const difficulty = getDifficulty(getAvgExerciseDifficulty());

      const params = {
        name: trimmedName,
        circuits: circuitsData,
        intervalSeconds: state.settings.work,
        restSeconds: state.settings.rest,
        sets: state.settings.sets,
        difficulty: difficulty.level,
      };

      const response = await workoutsApi.create(params);
      const newWorkoutId = (response as any).data?.id || (response as any).id;

      if (startImmediately) {
        navigation.navigate('WorkoutExecution', { workoutId: newWorkoutId });
      } else if (isEditMode) {
        // Navigate back to preview with the new workout ID
        // @ts-ignore - navigating across stacks
        navigation.navigate('Workouts', {
          screen: 'WorkoutPreview',
          params: { workoutId: newWorkoutId },
        });
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
  }, [isEditMode, route.params?.workoutId, state, setName, getDifficulty, getAvgExerciseDifficulty, navigation]);

  const handleSavePress = useCallback((startImmediately: boolean) => {
    const exercises = getCurrentExercises();
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Please select at least one exercise.');
      return;
    }

    if (isEditMode) {
      // In edit mode, save directly using existing name
      performSave(state.name, startImmediately);
    } else {
      // In create mode, show name modal first
      setPendingStartImmediately(startImmediately);
      setModalName(state.name);
      setShowNameModal(true);
    }
  }, [getCurrentExercises, state.name, isEditMode, performSave]);

  const handleModalSave = async () => {
    setShowNameModal(false);
    await performSave(modalName, pendingStartImmediately);
  };

  const handleSyncToggle = useCallback(() => {
    setSynced(!state.isSynced);
  }, [state.isSynced, setSynced]);

  // Show loading state when hydrating workout for editing
  if (isHydrating) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text variant="body" style={{ color: theme.text.secondary, marginTop: spacing[4] }}>
          Loading workout...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        {isEditMode ? (
          <TouchableOpacity
            onPress={() => {
              setModalName(state.name);
              setShowNameModal(true);
            }}
            style={styles.editableHeader}
          >
            <Text variant="h1" style={{ color: theme.text.primary }}>
              {state.name}
            </Text>
            <PencilIcon size={22} color={colors.primary[500]} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : (
          <Text variant="h1" style={{ color: theme.text.primary }}>
            New Workout
          </Text>
        )}
        {getEstimatedDuration() > 0 && (() => {
          const difficulty = getDifficulty(getAvgExerciseDifficulty());
          return (
            <View style={styles.headerMeta}>
              <Text variant="body" style={{ color: theme.text.secondary }}>
                Est. {getEstimatedDuration()} min
              </Text>
              <View style={[styles.headerDot, { backgroundColor: theme.text.tertiary }]} />
              <Text variant="body" style={[styles.difficultyText, { color: difficulty.color }]}>
                {difficulty.label}
              </Text>
            </View>
          );
        })()}
      </View>

      {/* Settings Accordion */}
      <View style={styles.section}>
        <SettingsAccordion
          isOpen={state.isSettingsExpanded}
          onToggle={toggleSettings}
          summary={(() => {
            const groups = getSettingsGroups();
            return (
              <View style={styles.chipGroupRow}>
                <View style={styles.chipGroup}>
                  {groups.structure.map((m) => (
                    <MetricChip key={m.label} value={m.value} label={m.label} theme={theme} />
                  ))}
                </View>
                <View style={[styles.chipDivider, { backgroundColor: theme.border.strong }]} />
                <View style={styles.chipGroup}>
                  {groups.timing.map((m) => (
                    <MetricChip key={m.label} value={m.value} label={m.label} theme={theme} />
                  ))}
                </View>
              </View>
            );
          })()}
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
          summary={(() => {
            const groups = getExerciseGroups();
            const totalExercises = groups.reduce((sum, g) => sum + g.exerciseIds.length, 0);
            if (totalExercises === 0) {
              return (
                <Text variant="bodySmall" style={{ color: theme.text.tertiary }}>
                  No exercises selected
                </Text>
              );
            }
            return (
              <View style={styles.summaryExerciseList}>
                {groups.map((group) => (
                  <View key={group.label} style={styles.summaryGroup}>
                    {groups.length > 1 && (
                      <Text variant="caption" style={[styles.summaryLabel, { color: theme.text.secondary }]}>
                        {group.label}:
                      </Text>
                    )}
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.text.primary, flex: 1 }}
                      numberOfLines={1}
                    >
                      {formatExerciseNames(group.exerciseIds, 2)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })()}
          maxHeight={600}
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
                          { color: colors.secondary[300] },
                          state.activeCircuitTab === i && styles.tabTextActive,
                        ]}
                      >
                        C{i + 1}
                      </Text>
                      <Text
                        variant="caption"
                        style={[
                          styles.tabCount,
                          { color: colors.secondary[300] },
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

          {/* Exercise list (expanded view) */}
          {getCurrentExercises().length > 0 && (
            <View style={styles.exerciseListContainer}>
              {getCurrentExercises().map((exerciseId, index) => (
                <View
                  key={exerciseId}
                  style={[
                    styles.exerciseListItem,
                    index < getCurrentExercises().length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border.medium,
                    },
                  ]}
                >
                  <Text style={[styles.exerciseListNumber, { color: theme.text.tertiary }]}>
                    {index + 1}.
                  </Text>
                  <Text style={[styles.exerciseListName, { color: theme.text.primary }]}>
                    {getExerciseName(exerciseId)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Exercise picker */}
          <TouchableOpacity
            style={[
              styles.exerciseButton,
              { backgroundColor: theme.background.elevated, borderColor: theme.border.strong },
            ]}
            onPress={handleSelectExercises}
            activeOpacity={0.7}
          >
            <View style={styles.exerciseButtonContent}>
              {getCurrentExercises().length > 0 ? (
                <>
                  <PencilIcon size={18} color={colors.primary[500]} />
                  <Text style={{ color: colors.primary[500], fontWeight: '600' }}>
                    Edit Exercises
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ color: theme.text.secondary }}>
                    Select Exercises
                  </Text>
                  <ChevronRightIcon size={20} color={theme.text.secondary} />
                </>
              )}
            </View>
          </TouchableOpacity>
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
          style={[styles.saveButton, styles.pillButton]}
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
          style={styles.pillButton}
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
              {isEditMode ? 'Rename Workout' : 'Name Your Workout'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: spacing[10],
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingTop: 24,
    marginBottom: 32,
  },
  editableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing[2],
  },
  difficultyText: {
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  chipGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chipDivider: {
    width: 1,
    height: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  chipValue: {
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  chipLabel: {
    fontWeight: '400',
    fontSize: 10,
    textTransform: 'uppercase',
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
  summaryExerciseList: {
    gap: spacing[1],
  },
  summaryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  summaryLabel: {
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  exerciseListContainer: {
    marginBottom: spacing[3],
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  exerciseListNumber: {
    fontSize: 12,
    fontWeight: '500',
    width: 20,
  },
  exerciseListName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  exerciseButton: {
    marginTop: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  exerciseButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  buttonContainer: {
    padding: spacing[5],
    paddingTop: spacing[6],
    gap: spacing[3],
  },
  saveButton: {
    marginBottom: spacing[1],
  },
  pillButton: {
    borderRadius: 100,
    paddingVertical: 18,
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
