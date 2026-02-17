import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../theme';
import { Text, Accordion, MultiPillSelector, PillOption } from '../ui';
import { spacing, borderRadius, colors } from '../../tokens';

// Filter interface matching API parameters
export interface ExerciseFilters {
  // Primary categorization
  primaryCategory?: string;
  difficulty?: string;
  primaryMuscles?: string[];
  equipment?: string[];

  // Workout goals (boolean flags)
  cardioIntensive?: boolean;
  strengthFocus?: boolean;
  mobilityFocus?: boolean;
  hictSuitable?: boolean;
  minimalTransition?: boolean;

  // Advanced filters
  movementPattern?: string;
  mechanic?: string;
  smallSpace?: boolean;
  quiet?: boolean;

  // Verification
  isVerified?: boolean;
}

// Filter options constants
const BODY_REGION_OPTIONS: PillOption[] = [
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'lower_body', label: 'Lower Body' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'plyometric', label: 'Plyometric' },
  { value: 'mobility', label: 'Mobility' },
];

const DIFFICULTY_OPTIONS: PillOption[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const MUSCLE_OPTIONS: PillOption[] = [
  { value: 'abdominals', label: 'Abdominals' },
  { value: 'obliques', label: 'Obliques' },
  { value: 'lower back', label: 'Lower Back' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'chest', label: 'Chest' },
  { value: 'lats', label: 'Lats' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'traps', label: 'Traps' },
];

const EQUIPMENT_OPTIONS: PillOption[] = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'pull-up-bar', label: 'Pull-up Bar' },
  { value: 'resistance-band', label: 'Resistance Band' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'medicine-ball', label: 'Medicine Ball' },
  { value: 'jump-rope', label: 'Jump Rope' },
];

const MOVEMENT_PATTERN_OPTIONS: PillOption[] = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'squat', label: 'Squat' },
  { value: 'hinge', label: 'Hinge' },
  { value: 'lunge', label: 'Lunge' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'carry', label: 'Carry' },
];

const MECHANIC_OPTIONS: PillOption[] = [
  { value: 'compound', label: 'Compound' },
  { value: 'isolation', label: 'Isolation' },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: ExerciseFilters;
  onApply: (filters: ExerciseFilters) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
}) => {
  const { theme } = useTheme();

  // Local state for editing filters
  const [localFilters, setLocalFilters] = useState<ExerciseFilters>(filters);

  // Accordion state
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(true);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Update local filters when modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const updateFilter = (key: keyof ExerciseFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'primaryMuscles' | 'equipment', value: string) => {
    const currentArray = (localFilters[key] || []) as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  // Count active filters for display
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.primaryCategory) count++;
    if (localFilters.difficulty) count++;
    if (localFilters.primaryMuscles?.length) count++;
    if (localFilters.equipment?.length) count++;
    if (localFilters.cardioIntensive) count++;
    if (localFilters.strengthFocus) count++;
    if (localFilters.mobilityFocus) count++;
    if (localFilters.hictSuitable) count++;
    if (localFilters.minimalTransition) count++;
    if (localFilters.movementPattern) count++;
    if (localFilters.mechanic) count++;
    if (localFilters.smallSpace) count++;
    if (localFilters.quiet) count++;
    if (localFilters.isVerified) count++;
    return count;
  };

  const getPrimarySummary = () => {
    const parts = [];
    if (localFilters.primaryCategory) {
      const label = BODY_REGION_OPTIONS.find(o => o.value === localFilters.primaryCategory)?.label;
      if (label) parts.push(label);
    }
    if (localFilters.difficulty) {
      const label = DIFFICULTY_OPTIONS.find(o => o.value === localFilters.difficulty)?.label;
      if (label) parts.push(label);
    }
    if (localFilters.primaryMuscles?.length) {
      parts.push(`${localFilters.primaryMuscles.length} muscles`);
    }
    if (localFilters.equipment?.length) {
      parts.push(`${localFilters.equipment.length} equipment`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'No filters';
  };

  const getGoalsSummary = () => {
    const parts = [];
    if (localFilters.cardioIntensive) parts.push('Cardio');
    if (localFilters.strengthFocus) parts.push('Strength');
    if (localFilters.mobilityFocus) parts.push('Mobility');
    if (localFilters.hictSuitable) parts.push('HICT');
    if (localFilters.minimalTransition) parts.push('Minimal Transition');
    return parts.length > 0 ? parts.join(' • ') : 'No filters';
  };

  const getAdvancedSummary = () => {
    const parts = [];
    if (localFilters.movementPattern) {
      const label = MOVEMENT_PATTERN_OPTIONS.find(o => o.value === localFilters.movementPattern)?.label;
      if (label) parts.push(label);
    }
    if (localFilters.mechanic) {
      const label = MECHANIC_OPTIONS.find(o => o.value === localFilters.mechanic)?.label;
      if (label) parts.push(label);
    }
    if (localFilters.smallSpace) parts.push('Small Space');
    if (localFilters.quiet) parts.push('Quiet');
    return parts.length > 0 ? parts.join(' • ') : 'No filters';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border.medium }]}>
          <View>
            <Text style={[styles.title, { color: theme.text.primary }]}>Filter Exercises</Text>
            {getActiveFilterCount() > 0 && (
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                {getActiveFilterCount()} active {getActiveFilterCount() === 1 ? 'filter' : 'filters'}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XMarkIcon size={24} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Primary Categorization Section */}
          <Accordion
            title="Primary Categorization"
            summary={getPrimarySummary()}
            isOpen={isPrimaryOpen}
            onToggle={() => setIsPrimaryOpen(!isPrimaryOpen)}
          >
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text.primary }]}>Body Region</Text>
              <MultiPillSelector
                options={BODY_REGION_OPTIONS}
                selected={localFilters.primaryCategory || ''}
                onToggle={(value) =>
                  updateFilter('primaryCategory', value === localFilters.primaryCategory ? undefined : value)
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text.primary }]}>Difficulty</Text>
              <MultiPillSelector
                options={DIFFICULTY_OPTIONS}
                selected={localFilters.difficulty || ''}
                onToggle={(value) =>
                  updateFilter('difficulty', value === localFilters.difficulty ? undefined : value)
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text.primary }]}>Target Muscles</Text>
              <MultiPillSelector
                options={MUSCLE_OPTIONS}
                selected={localFilters.primaryMuscles || []}
                onToggle={(value) => toggleArrayFilter('primaryMuscles', value)}
                multiSelect
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text.primary }]}>Equipment</Text>
              <MultiPillSelector
                options={EQUIPMENT_OPTIONS}
                selected={localFilters.equipment || []}
                onToggle={(value) => toggleArrayFilter('equipment', value)}
                multiSelect
              />
            </View>
          </Accordion>

          {/* Workout Goals Section */}
          <Accordion
            title="Workout Goals"
            summary={getGoalsSummary()}
            isOpen={isGoalsOpen}
            onToggle={() => setIsGoalsOpen(!isGoalsOpen)}
          >
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>Cardio Intensive</Text>
              <Switch
                value={localFilters.cardioIntensive || false}
                onValueChange={(value) => updateFilter('cardioIntensive', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>Strength Focus</Text>
              <Switch
                value={localFilters.strengthFocus || false}
                onValueChange={(value) => updateFilter('strengthFocus', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>Mobility Focus</Text>
              <Switch
                value={localFilters.mobilityFocus || false}
                onValueChange={(value) => updateFilter('mobilityFocus', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>HICT Suitable</Text>
              <Switch
                value={localFilters.hictSuitable || false}
                onValueChange={(value) => updateFilter('hictSuitable', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>Minimal Transition</Text>
              <Switch
                value={localFilters.minimalTransition || false}
                onValueChange={(value) => updateFilter('minimalTransition', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>
          </Accordion>

          {/* Advanced Section */}
          <Accordion
            title="Advanced"
            summary={getAdvancedSummary()}
            isOpen={isAdvancedOpen}
            onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text.primary }]}>Movement Pattern</Text>
              <MultiPillSelector
                options={MOVEMENT_PATTERN_OPTIONS}
                selected={localFilters.movementPattern || ''}
                onToggle={(value) =>
                  updateFilter('movementPattern', value === localFilters.movementPattern ? undefined : value)
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text.primary }]}>Mechanic</Text>
              <MultiPillSelector
                options={MECHANIC_OPTIONS}
                selected={localFilters.mechanic || ''}
                onToggle={(value) =>
                  updateFilter('mechanic', value === localFilters.mechanic ? undefined : value)
                }
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>Small Space</Text>
              <Switch
                value={localFilters.smallSpace || false}
                onValueChange={(value) => updateFilter('smallSpace', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>Quiet</Text>
              <Switch
                value={localFilters.quiet || false}
                onValueChange={(value) => updateFilter('quiet', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.text.primary }]}>Verified Only</Text>
              <Switch
                value={localFilters.isVerified || false}
                onValueChange={(value) => updateFilter('isVerified', value || undefined)}
                trackColor={{ false: '#CBD5E1', true: colors.primary[500] }}
              />
            </View>
          </Accordion>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.border.medium }]}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton, { borderColor: theme.border.medium }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: theme.text.secondary }]}>Reset All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.applyButton]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[5],
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: spacing[1],
  },
  closeButton: {
    padding: spacing[2],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[5],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing[5],
    gap: spacing[4],
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: colors.primary[500],
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
