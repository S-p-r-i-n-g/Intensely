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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExercisesStackParamList } from '../../navigation/types';
import { exercisesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList, 'ExercisesList'>;

const ExercisesListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const muscleGroups = [
    'chest',
    'back',
    'shoulders',
    'arms',
    'legs',
    'core',
    'glutes',
    'cardio',
  ];

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exercises, searchQuery, selectedDifficulty, selectedMuscleGroup]);

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

  const applyFilters = () => {
    let filtered = [...exercises];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.description?.toLowerCase().includes(query) ||
          ex.primaryMuscles?.some((muscle) => muscle.toLowerCase().includes(query)) ||
          ex.secondaryMuscles?.some((muscle) => muscle.toLowerCase().includes(query))
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    // Muscle group filter
    if (selectedMuscleGroup) {
      filtered = filtered.filter((ex) =>
        ex.primaryMuscles?.some(
          (muscle) => muscle.toLowerCase() === selectedMuscleGroup.toLowerCase()
        ) ||
        ex.secondaryMuscles?.some(
          (muscle) => muscle.toLowerCase() === selectedMuscleGroup.toLowerCase()
        )
      );
    }

    setFilteredExercises(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty(null);
    setSelectedMuscleGroup(null);
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[styles.exerciseCard, { backgroundColor: theme.background.secondary }]}
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
    >
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseName, { color: theme.text.primary }]}>{item.name}</Text>
        {item.difficulty && (
          <View
            style={[
              styles.difficultyBadge,
              item.difficulty === 'beginner' && styles.difficultyBeginner,
              item.difficulty === 'intermediate' && styles.difficultyIntermediate,
              item.difficulty === 'advanced' && styles.difficultyAdvanced,
            ]}
          >
            <Text style={styles.difficultyText}>
              {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={[styles.exerciseDescription, { color: theme.text.secondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {(item.primaryMuscles || item.secondaryMuscles) && (
        <View style={styles.muscleGroupsContainer}>
          {[...(item.primaryMuscles || []), ...(item.secondaryMuscles || [])]
            .slice(0, 3)
            .map((muscle, index) => (
              <View key={`${muscle}-${index}`} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          {[...(item.primaryMuscles || []), ...(item.secondaryMuscles || [])].length > 3 && (
            <Text style={[styles.moreText, { color: theme.text.tertiary }]}>
              +{[...(item.primaryMuscles || []), ...(item.secondaryMuscles || [])].length - 3}
            </Text>
          )}
        </View>
      )}

      <View style={styles.exerciseFooter}>
        <Text style={[styles.equipmentText, { color: theme.text.secondary }]}>
          {item.equipment && item.equipment.length > 0
            ? item.equipment.join(', ')
            : 'No equipment'}
        </Text>
        {item.videoUrl && <Text style={styles.videoIndicator}>📹 Video</Text>}
      </View>
    </TouchableOpacity>
  );

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
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={[styles.filterButtonText, { color: theme.text.primary }]}>
            {showFilters ? '✕' : '⚙️'} Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={[styles.filtersSection, { borderBottomColor: theme.border.medium }]}>
          {/* Difficulty Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.text.primary }]}>Difficulty</Text>
            <View style={styles.filterOptions}>
              {difficulties.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.filterChip,
                    { backgroundColor: selectedDifficulty === diff ? colors.primary[500] : colors.primary[50] },
                  ]}
                  onPress={() =>
                    setSelectedDifficulty(selectedDifficulty === diff ? null : diff)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedDifficulty === diff ? '#FFFFFF' : colors.primary[500] },
                    ]}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Muscle Group Filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: theme.text.primary }]}>Muscle Group</Text>
            <View style={styles.filterOptions}>
              {muscleGroups.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.filterChip,
                    { backgroundColor: selectedMuscleGroup === muscle ? colors.primary[500] : colors.primary[50] },
                  ]}
                  onPress={() =>
                    setSelectedMuscleGroup(selectedMuscleGroup === muscle ? null : muscle)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedMuscleGroup === muscle ? '#FFFFFF' : colors.primary[500] },
                    ]}
                  >
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Clear Filters Button */}
          {(selectedDifficulty || selectedMuscleGroup || searchQuery) && (
            <TouchableOpacity style={[styles.clearButton, { backgroundColor: theme.background.secondary }]} onPress={clearFilters}>
              <Text style={[styles.clearButtonText, { color: theme.text.secondary }]}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsText, { color: theme.text.secondary }]}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.favoritesLink}>❤️ Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Exercises List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>No exercises found</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>Try adjusting your filters</Text>
          </View>
        }
      />
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
    marginTop: spacing.md,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  filterButton: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  filterGroup: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoritesLink: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  exerciseCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  exerciseName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  difficultyBeginner: {
    backgroundColor: '#4CAF50',
  },
  difficultyIntermediate: {
    backgroundColor: '#FF9800',
  },
  difficultyAdvanced: {
    backgroundColor: '#F44336',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: 6,
  },
  muscleTag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  muscleTagText: {
    fontSize: 11,
    color: colors.primary[500],
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  moreText: {
    fontSize: 11,
    alignSelf: 'center',
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  videoIndicator: {
    fontSize: 12,
    color: colors.primary[500],
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default ExercisesListScreen;
