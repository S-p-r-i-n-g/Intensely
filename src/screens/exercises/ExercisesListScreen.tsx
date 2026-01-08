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

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList, 'ExercisesList'>;

const ExercisesListScreen = () => {
  const navigation = useNavigation<NavigationProp>();

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
          ex.targetMuscleGroups?.some((muscle) => muscle.toLowerCase().includes(query))
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    // Muscle group filter
    if (selectedMuscleGroup) {
      filtered = filtered.filter((ex) =>
        ex.targetMuscleGroups?.some(
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
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{item.name}</Text>
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
        <Text style={styles.exerciseDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.targetMuscleGroups && item.targetMuscleGroups.length > 0 && (
        <View style={styles.muscleGroupsContainer}>
          {item.targetMuscleGroups.slice(0, 3).map((muscle) => (
            <View key={muscle} style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{muscle}</Text>
            </View>
          ))}
          {item.targetMuscleGroups.length > 3 && (
            <Text style={styles.moreText}>+{item.targetMuscleGroups.length - 3}</Text>
          )}
        </View>
      )}

      <View style={styles.exerciseFooter}>
        <Text style={styles.equipmentText}>
          {item.equipmentRequired || 'No equipment'}
        </Text>
        {item.videoUrl && <Text style={styles.videoIndicator}>📹 Video</Text>}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? '✕' : '⚙️'} Filters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersSection}>
          {/* Difficulty Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Difficulty</Text>
            <View style={styles.filterOptions}>
              {difficulties.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === diff && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedDifficulty(selectedDifficulty === diff ? null : diff)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDifficulty === diff && styles.filterChipTextActive,
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
            <Text style={styles.filterLabel}>Muscle Group</Text>
            <View style={styles.filterOptions}>
              {muscleGroups.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.filterChip,
                    selectedMuscleGroup === muscle && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedMuscleGroup(selectedMuscleGroup === muscle ? null : muscle)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedMuscleGroup === muscle && styles.filterChipTextActive,
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
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
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
            <Text style={styles.emptyText}>No exercises found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  favoritesLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exerciseCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    color: '#fff',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  muscleTag: {
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  muscleTagText: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  moreText: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  videoIndicator: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default ExercisesListScreen;
