import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { Text } from '../../components/ui';
import { exercisesApi } from '../../api';
import { spacing, borderRadius, colors } from '../../tokens';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';

// Category options matching database taxonomy
const CATEGORY_OPTIONS = [
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'lower_body', label: 'Lower Body' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'plyometric', label: 'Plyometric' },
  { value: 'mobility', label: 'Mobility' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// Muscle options from actual database taxonomy
const MUSCLE_OPTIONS = [
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

const EQUIPMENT_OPTIONS = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'pull-up-bar', label: 'Pull-up Bar' },
  { value: 'resistance-band', label: 'Resistance Band' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'kettlebell', label: 'Kettlebell' },
];

// Accordion component
const Accordion = ({
  title,
  summary,
  isOpen,
  onToggle,
  children,
  theme,
}: {
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  theme: any;
}) => (
  <View style={[styles.accordion, { backgroundColor: theme.background.elevated }]}>
    <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
      <View>
        <Text style={[styles.accordionTitle, { color: theme.text.primary }]}>{title}</Text>
        {!isOpen && (
          <Text style={[styles.accordionSummary, { color: theme.text.secondary }]}>{summary}</Text>
        )}
      </View>
      {isOpen ? (
        <ChevronUpIcon size={20} color={theme.text.secondary} />
      ) : (
        <ChevronDownIcon size={20} color={theme.text.secondary} />
      )}
    </TouchableOpacity>
    {isOpen && <View style={styles.accordionContent}>{children}</View>}
  </View>
);

// Multi-select pill component
const PillSelector = ({
  options,
  selected,
  onToggle,
  multiSelect = false,
  theme,
}: {
  options: { value: string; label: string }[];
  selected: string | string[];
  onToggle: (value: string) => void;
  multiSelect?: boolean;
  theme: any;
}) => {
  const isSelected = (value: string) =>
    multiSelect ? (selected as string[]).includes(value) : selected === value;

  return (
    <View style={styles.pillContainer}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.pill,
            { borderColor: theme.border.medium, backgroundColor: theme.background.primary },
            isSelected(opt.value) && styles.pillActive,
          ]}
          onPress={() => onToggle(opt.value)}
        >
          <Text
            style={[
              styles.pillText,
              { color: theme.text.secondary },
              isSelected(opt.value) && styles.pillTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CreateExerciseScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('full_body');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [primaryMuscles, setPrimaryMuscles] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>(['bodyweight']);
  const [isLoading, setIsLoading] = useState(false);

  // Accordion state
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isAttributesOpen, setIsAttributesOpen] = useState(true);

  const toggleMuscle = (muscle: string) => {
    if (primaryMuscles.includes(muscle)) {
      setPrimaryMuscles(primaryMuscles.filter((m) => m !== muscle));
    } else {
      setPrimaryMuscles([...primaryMuscles, muscle]);
    }
  };

  const toggleEquipment = (eq: string) => {
    if (equipment.includes(eq)) {
      // Don't allow removing all equipment
      if (equipment.length > 1) {
        setEquipment(equipment.filter((e) => e !== eq));
      }
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter an exercise name.');
      return;
    }
    if (primaryMuscles.length === 0) {
      Alert.alert('Required', 'Please select at least one target muscle.');
      return;
    }

    try {
      setIsLoading(true);
      await exercisesApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        primaryCategory: category,
        difficulty,
        primaryMuscles,
        equipment,
        instructions: [],
      });

      // Navigate back immediately - list will refresh via useFocusEffect
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to create exercise:', error);
      const message = error.response?.data?.message || 'Failed to create exercise. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const detailsSummary = name || 'Name and description';
  const attributesSummary = `${CATEGORY_OPTIONS.find((c) => c.value === category)?.label} • ${
    DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label
  }`;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Basic Details */}
        <Accordion
          title="Basic Details"
          summary={detailsSummary}
          isOpen={isDetailsOpen}
          onToggle={() => setIsDetailsOpen(!isDetailsOpen)}
          theme={theme}
        >
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.primary,
                  color: theme.text.primary,
                  borderColor: theme.border.medium,
                },
              ]}
              placeholder="e.g. Burpee Pull-up"
              placeholderTextColor={theme.text.tertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.background.primary,
                  color: theme.text.primary,
                  borderColor: theme.border.medium,
                },
              ]}
              placeholder="Briefly describe the movement..."
              placeholderTextColor={theme.text.tertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </Accordion>

        {/* Attributes */}
        <Accordion
          title="Attributes"
          summary={attributesSummary}
          isOpen={isAttributesOpen}
          onToggle={() => setIsAttributesOpen(!isAttributesOpen)}
          theme={theme}
        >
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Category *</Text>
            <PillSelector
              options={CATEGORY_OPTIONS}
              selected={category}
              onToggle={setCategory}
              theme={theme}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Difficulty *</Text>
            <PillSelector
              options={DIFFICULTY_OPTIONS}
              selected={difficulty}
              onToggle={setDifficulty}
              theme={theme}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Target Muscles *</Text>
            <PillSelector
              options={MUSCLE_OPTIONS}
              selected={primaryMuscles}
              onToggle={toggleMuscle}
              multiSelect
              theme={theme}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Equipment</Text>
            <PillSelector
              options={EQUIPMENT_OPTIONS}
              selected={equipment}
              onToggle={toggleEquipment}
              multiSelect
              theme={theme}
            />
          </View>
        </Accordion>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Exercise'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: 100,
  },
  accordion: {
    borderRadius: 16,
    marginBottom: spacing[3],
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  accordionSummary: {
    fontSize: 13,
    marginTop: 2,
  },
  accordionContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  formGroup: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  pill: {
    borderWidth: 1,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 100,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateExerciseScreen;
