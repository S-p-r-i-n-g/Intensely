import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProgressStackParamList } from '../../navigation/types';
import { progressApi, exercisesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProgressStackParamList, 'LogProgress'>;
type RoutePropType = RouteProp<ProgressStackParamList, 'LogProgress'>;

const LogProgressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadExercise();
  }, [route.params.exerciseId]);

  const loadExercise = async () => {
    try {
      setIsLoading(true);
      const response = await exercisesApi.getById(route.params.exerciseId);
      setExercise(response.data);
    } catch (error: any) {
      console.error('Failed to load exercise:', error);
      Alert.alert('Error', 'Could not load exercise details.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!reps && !weight && !duration) {
      Alert.alert('Missing Data', 'Please enter at least one metric (reps, weight, or duration).');
      return;
    }

    try {
      setIsSaving(true);

      const data = {
        exerciseId: route.params.exerciseId,
        reps: reps ? parseInt(reps, 10) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        durationSeconds: duration ? parseInt(duration, 10) : undefined,
        notes: notes.trim() || undefined,
      };

      await progressApi.log(data);

      Alert.alert('Success', 'Progress logged successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to log progress:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not log progress. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !exercise) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Log Progress</Text>
          <Text style={[styles.exerciseName, { color: colors.primary[500] }]}>{exercise.name}</Text>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.infoText, { color: theme.text.secondary }]}>
            💡 Enter the details of your exercise performance. You can log reps, weight, time, or any combination.
          </Text>
        </View>

        {/* Reps Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text.primary }]}>Repetitions</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
            value={reps}
            onChangeText={setReps}
            placeholder="Enter number of reps"
            placeholderTextColor={theme.text.tertiary}
            keyboardType="number-pad"
          />
          <Text style={[styles.inputHelper, { color: theme.text.tertiary }]}>How many times you performed the exercise</Text>
        </View>

        {/* Weight Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text.primary }]}>Weight (lbs)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight in pounds"
            placeholderTextColor={theme.text.tertiary}
            keyboardType="decimal-pad"
          />
          <Text style={[styles.inputHelper, { color: theme.text.tertiary }]}>Weight used for the exercise</Text>
        </View>

        {/* Duration Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text.primary }]}>Duration (seconds)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="Enter duration in seconds"
            placeholderTextColor={theme.text.tertiary}
            keyboardType="number-pad"
          />
          <Text style={[styles.inputHelper, { color: theme.text.tertiary }]}>How long you held or performed the exercise</Text>
        </View>

        {/* Notes Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text.primary }]}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this set..."
            placeholderTextColor={theme.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.inputHelper, { color: theme.text.tertiary }]}>
            How did it feel? Any modifications? Equipment used?
          </Text>
        </View>

        {/* Examples Card */}
        <View style={[styles.examplesCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.examplesTitle, { color: theme.text.primary }]}>Examples:</Text>
          <Text style={[styles.exampleItem, { color: theme.text.secondary }]}>• Push-ups: 20 reps</Text>
          <Text style={[styles.exampleItem, { color: theme.text.secondary }]}>• Bicep curls: 12 reps × 25 lbs</Text>
          <Text style={[styles.exampleItem, { color: theme.text.secondary }]}>• Plank: 60 seconds</Text>
          <Text style={[styles.exampleItem, { color: theme.text.secondary }]}>• Weighted squats: 10 reps × 135 lbs</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary[500] }, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.saveButtonText, { color: '#fff' }]}>Save Progress</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  header: {
    paddingTop: 30,
    marginBottom: spacing[5],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: spacing[6],
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  input: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: spacing[3],
  },
  inputHelper: {
    fontSize: 12,
    marginTop: 6,
  },
  examplesCard: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  exampleItem: {
    fontSize: 13,
    marginBottom: spacing[1],
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LogProgressScreen;
