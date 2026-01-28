import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { exercisesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ExerciseSelection'>;
type RoutePropType = RouteProp<HomeStackParamList, 'ExerciseSelection'>;

interface ExerciseSelectionScreenProps {}

const ExerciseSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(route.params?.selectedIds || []);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    applySearch();
  }, [exercises, searchQuery]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const response = await exercisesApi.getAll();
      setExercises(response.data);
      setFilteredExercises(response.data);
    } catch (error: any) {
      console.error('Failed to load exercises:', error);
      Alert.alert('Error', 'Could not load exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredExercises(exercises);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.description?.toLowerCase().includes(query) ||
        ex.targetMuscleGroups?.some((muscle) => muscle.toLowerCase().includes(query))
    );
    setFilteredExercises(filtered);
  };

  const toggleExercise = (exerciseId: string) => {
    if (selectedIds.includes(exerciseId)) {
      setSelectedIds(selectedIds.filter((id) => id !== exerciseId));
    } else {
      setSelectedIds([...selectedIds, exerciseId]);
    }
  };

  const confirmSelection = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Exercises', 'Please select at least one exercise.');
      return;
    }

    // Check if we came from NewWorkout (has circuitIndex) or TakeTheWheel
    const isFromNewWorkout = route.params?.circuitIndex !== undefined;

    if (isFromNewWorkout) {
      // Navigate back to NewWorkout with selected IDs and full state
      navigation.navigate('NewWorkout', {
        selectedExerciseIds: selectedIds,
        circuitIndex: route.params?.circuitIndex,
        workoutName: route.params?.workoutName,
        circuits: route.params?.circuits,
        setsPerCircuit: route.params?.setsPerCircuit,
        workInterval: route.params?.workInterval,
        restInterval: route.params?.restInterval,
        isSynced: route.params?.isSynced,
        exercisesJson: route.params?.exercisesJson,
      });
    } else {
      // Legacy: Navigate back to TakeTheWheel
      navigation.navigate('TakeTheWheel', {
        selectedExerciseIds: selectedIds,
        workoutName: route.params?.workoutName,
        circuits: route.params?.circuits,
        setsPerCircuit: route.params?.setsPerCircuit,
        workInterval: route.params?.workInterval,
        restInterval: route.params?.restInterval,
      });
    }
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.exerciseCard,
          { backgroundColor: theme.background.secondary, borderColor: theme.border.strong },
          isSelected && {
            backgroundColor: theme.background.elevated,
            borderColor: colors.primary[500],
            borderWidth: 3,
          },
        ]}
        onPress={() => toggleExercise(item.id)}
      >
        <View style={styles.cardContent}>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseName, { color: theme.text.primary }]}>{item.name}</Text>
            {item.targetMuscleGroups && item.targetMuscleGroups.length > 0 && (
              <View style={styles.muscleGroupsContainer}>
                {item.targetMuscleGroups.slice(0, 3).map((muscle) => (
                  <View key={muscle} style={[styles.muscleTag, { backgroundColor: theme.background.tertiary }]}>
                    <Text style={[styles.muscleTagText, { color: theme.text.secondary }]}>{muscle}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={[
            styles.checkbox,
            isSelected
              ? { borderColor: colors.primary[500], backgroundColor: colors.primary[500] }
              : { borderColor: theme.border.strong, backgroundColor: theme.border.medium },
          ]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
          placeholder="Search exercises..."
          placeholderTextColor={theme.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Selection Count */}
      <View style={styles.selectionHeader}>
        <Text style={[styles.selectionText, { color: theme.text.secondary }]}>
          {selectedIds.length} exercise{selectedIds.length !== 1 ? 's' : ''} selected
        </Text>
        {selectedIds.length > 0 && (
          <TouchableOpacity onPress={() => setSelectedIds([])}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Exercises List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No exercises found</Text>
          </View>
        }
      />

      {/* Confirm Button */}
      <View style={[styles.footer, { backgroundColor: theme.background.primary, borderTopColor: theme.border.medium }]}>
        <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
          <Text style={styles.confirmButtonText}>
            Confirm Selection ({selectedIds.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  loadingText: {
    marginTop: spacing[4],
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  searchInput: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: 100,
  },
  exerciseCard: {
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: spacing[3],
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing[2],
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1] + 2,
  },
  muscleTag: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  muscleTagText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: spacing[15],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: spacing[5],
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ExerciseSelectionScreen;
