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
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProgressStackParamList, 'ExerciseProgress'>;
type RoutePropType = RouteProp<ProgressStackParamList, 'ExerciseProgress'>;

const ExerciseProgressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();

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
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{exercise.name}</Text>
        {exercise.targetMuscleGroups && exercise.targetMuscleGroups.length > 0 && (
          <View style={styles.muscleGroupsContainer}>
            {exercise.targetMuscleGroups.map((muscle) => (
              <View key={muscle} style={[styles.muscleTag, { backgroundColor: theme.background.elevated }]}>
                <Text style={[styles.muscleTagText, { color: colors.primary[500] }]}>{muscle}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Personal Record Card */}
      {personalRecord ? (
        <View style={[styles.prCard, { backgroundColor: theme.background.elevated, borderColor: colors.primary[500] }]}>
          <View style={styles.prHeader}>
            <Text style={[styles.prBadge, { color: colors.primary[500] }]}>🏆 Personal Record</Text>
          </View>
          <Text style={[styles.prValue, { color: theme.text.primary }]}>{formatProgressDetails(personalRecord)}</Text>
          <Text style={[styles.prDate, { color: theme.text.secondary }]}>Set on {formatDate(personalRecord.loggedAt)}</Text>
        </View>
      ) : (
        <View style={[styles.noPrCard, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.noPrText, { color: theme.text.primary }]}>No personal record yet</Text>
          <Text style={[styles.noPrSubtext, { color: theme.text.secondary }]}>Log your first entry to set a PR!</Text>
        </View>
      )}

      {/* Log Progress Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.logButton, { backgroundColor: colors.primary[500] }]}
          onPress={() => navigation.navigate('LogProgress', { exerciseId: exercise.id })}
        >
          <Text style={[styles.logButtonText, { color: '#fff' }]}>Log New Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Progress History */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Progress History ({progressEntries.length})
        </Text>

        {progressEntries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>No progress logged yet</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>
              Start tracking your progress to see improvements over time!
            </Text>
          </View>
        ) : (
          progressEntries.map((entry) => (
            <View key={entry.id} style={[styles.entryCard, { backgroundColor: theme.background.secondary }]}>
              <View style={styles.entryHeader}>
                <View style={styles.entryInfo}>
                  <Text style={[styles.entryValue, { color: theme.text.primary }]}>
                    {formatProgressDetails(entry)}
                  </Text>
                  {entry.isPersonalRecord && (
                    <Text style={[styles.entryPRBadge, { color: colors.primary[500] }]}>🏆 PR</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => confirmDelete(entry)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.entryDate, { color: theme.text.secondary }]}>{formatDate(entry.loggedAt)}</Text>
              {entry.notes && (
                <Text style={[styles.entryNotes, { color: theme.text.secondary }]}>Note: {entry.notes}</Text>
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing[5],
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing[3],
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  muscleTag: {
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  muscleTagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  prCard: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[5],
    padding: spacing[6],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  prHeader: {
    marginBottom: spacing[3],
  },
  prBadge: {
    fontSize: 16,
    fontWeight: '600',
  },
  prValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  prDate: {
    fontSize: 14,
  },
  noPrCard: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[5],
    padding: spacing[6],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  noPrText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  noPrSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  logButton: {
    paddingVertical: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing[4],
  },
  emptyCard: {
    borderRadius: borderRadius.md,
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  entryCard: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  entryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  entryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  entryPRBadge: {
    fontSize: 14,
  },
  deleteButton: {
    padding: spacing[1],
  },
  deleteIcon: {
    fontSize: 18,
  },
  entryDate: {
    fontSize: 13,
    marginBottom: spacing[1],
  },
  entryNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: spacing[2],
  },
});

export default ExerciseProgressScreen;
