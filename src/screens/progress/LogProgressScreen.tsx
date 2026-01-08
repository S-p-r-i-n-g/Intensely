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

type NavigationProp = NativeStackNavigationProp<ProgressStackParamList, 'LogProgress'>;
type RoutePropType = RouteProp<ProgressStackParamList, 'LogProgress'>;

const LogProgressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log Progress</Text>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Enter the details of your exercise performance. You can log reps, weight, time, or any combination.
          </Text>
        </View>

        {/* Reps Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Repetitions</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            placeholder="Enter number of reps"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
          <Text style={styles.inputHelper}>How many times you performed the exercise</Text>
        </View>

        {/* Weight Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight in pounds"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
          <Text style={styles.inputHelper}>Weight used for the exercise</Text>
        </View>

        {/* Duration Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Duration (seconds)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="Enter duration in seconds"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
          <Text style={styles.inputHelper}>How long you held or performed the exercise</Text>
        </View>

        {/* Notes Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this set..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.inputHelper}>
            How did it feel? Any modifications? Equipment used?
          </Text>
        </View>

        {/* Examples Card */}
        <View style={styles.examplesCard}>
          <Text style={styles.examplesTitle}>Examples:</Text>
          <Text style={styles.exampleItem}>• Push-ups: 20 reps</Text>
          <Text style={styles.exampleItem}>• Bicep curls: 12 reps × 25 lbs</Text>
          <Text style={styles.exampleItem}>• Plank: 60 seconds</Text>
          <Text style={styles.exampleItem}>• Weighted squats: 10 reps × 135 lbs</Text>
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
            <Text style={styles.saveButtonText}>Save Progress</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    color: '#FF6B35',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFF5F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputHelper: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  examplesCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exampleItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
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

export default LogProgressScreen;
