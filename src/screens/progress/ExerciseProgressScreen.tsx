import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProgressStackParamList } from '../../navigation/types';
import { progressApi, exercisesApi } from '../../api';
import type { ProgressEntry, Exercise } from '../../types/api';

type NavigationProp = NativeStackNavigationProp<ProgressStackParamList, 'ExerciseProgress'>;
type RoutePropType = RouteProp<ProgressStackParamList, 'ExerciseProgress'>;

const ExerciseProgressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [personalRecord, setPersonalRecord] = useState<ProgressEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadExerciseProgress();
    }, [route.params.exerciseId])
  );

  const loadExerciseProgress = async () => {
    try {
      setIsLoading(true);

      // Load exercise details
      const exerciseResponse = await exercisesApi.getById(route.params.exerciseId);
      setExercise(exerciseResponse.data);

      // Load progress entries for this exercise
      const progressResponse = await progressApi.getByExercise(route.params.exerciseId);
      const entries = progressResponse.data;
      setProgressEntries(entries);

      // Find personal record
      const pr = entries.find((entry) => entry.isPersonalRecord);
      setPersonalRecord(pr || null);
    } catch (error: any) {
      console.error('Failed to load exercise progress:', error);
      Alert.alert('Error', 'Could not load exercise progress.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      await progressApi.delete(entryId);
      setProgressEntries(progressEntries.filter((entry) => entry.id !== entryId));
      Alert.alert('Success', 'Progress entry deleted.');

      // Reload to refresh PR status
      loadExerciseProgress();
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      Alert.alert('Error', 'Could not delete entry.');
    }
  };

  const confirmDelete = (entry: ProgressEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this progress entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry(entry.id),
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatProgressDetails = (entry: ProgressEntry): string => {
    const parts = [];
    if (entry.reps) parts.push(`${entry.reps} reps`);
    if (entry.weight) parts.push(`${entry.weight} lbs`);
    if (entry.durationSeconds) parts.push(`${entry.durationSeconds}s`);
    return parts.join(' × ');
  };

  if (isLoading || !exercise) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
        {exercise.targetMuscleGroups && exercise.targetMuscleGroups.length > 0 && (
          <View style={styles.muscleGroupsContainer}>
            {exercise.targetMuscleGroups.map((muscle) => (
              <View key={muscle} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Personal Record Card */}
      {personalRecord ? (
        <View style={styles.prCard}>
          <View style={styles.prHeader}>
            <Text style={styles.prBadge}>🏆 Personal Record</Text>
          </View>
          <Text style={styles.prValue}>{formatProgressDetails(personalRecord)}</Text>
          <Text style={styles.prDate}>Set on {formatDate(personalRecord.loggedAt)}</Text>
        </View>
      ) : (
        <View style={styles.noPrCard}>
          <Text style={styles.noPrText}>No personal record yet</Text>
          <Text style={styles.noPrSubtext}>Log your first entry to set a PR!</Text>
        </View>
      )}

      {/* Log Progress Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.logButton}
          onPress={() => navigation.navigate('LogProgress', { exerciseId: exercise.id })}
        >
          <Text style={styles.logButtonText}>Log New Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Progress History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Progress History ({progressEntries.length})
        </Text>

        {progressEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No progress logged yet</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your progress to see improvements over time!
            </Text>
          </View>
        ) : (
          progressEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryValue}>
                    {formatProgressDetails(entry)}
                  </Text>
                  {entry.isPersonalRecord && (
                    <Text style={styles.entryPRBadge}>🏆 PR</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => confirmDelete(entry)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.entryDate}>{formatDate(entry.loggedAt)}</Text>
              {entry.notes && (
                <Text style={styles.entryNotes}>Note: {entry.notes}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  muscleTagText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  prCard: {
    backgroundColor: '#FFF5F2',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  prHeader: {
    marginBottom: 12,
  },
  prBadge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  prValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  prDate: {
    fontSize: 14,
    color: '#666',
  },
  noPrCard: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  noPrText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noPrSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  logButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  entryPRBadge: {
    fontSize: 14,
    color: '#FF6B35',
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  entryDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default ExerciseProgressScreen;
