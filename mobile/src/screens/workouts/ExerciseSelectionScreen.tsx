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
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/types';
import { exercisesApi, favoritesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';
import { HeartIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import { FilterChip } from '../../components/exercises';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ExerciseSelection'>;
type RoutePropType = RouteProp<HomeStackParamList, 'ExerciseSelection'>;

interface QuickFilters {
  bodyweightOnly: boolean;
  apartmentFriendly: boolean;
  verifiedOnly: boolean;
}

const ExerciseSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(route.params?.selectedIds || []);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    bodyweightOnly: false,
    apartmentFriendly: false,
    verifiedOnly: false,
  });

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    applyFilters(searchQuery, showFavoritesOnly, quickFilters);
  }, [exercises, favoriteIds, showFavoritesOnly, searchQuery, quickFilters]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const response = await exercisesApi.getAll();
      // Handle both response formats: direct array or nested data
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.exercises || response.data?.data || [];
      setExercises(data);

      // Load favorites (non-critical)
      try {
        const favoritesResponse = await favoritesApi.getFavoriteExercises();
        const favIds = new Set(
          favoritesResponse.data
            .map((fav: any) => fav.exercise_id || fav.exerciseId)
            .filter(Boolean)
        );
        setFavoriteIds(favIds);
      } catch {
        setFavoriteIds(new Set());
      }
    } catch (error: any) {
      console.error('Failed to load exercises:', error);
      Alert.alert('Error', 'Could not load exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (
    text: string,
    favoritesOnly: boolean,
    qf: QuickFilters
  ) => {
    let filtered = exercises;

    // Favorites filter
    if (favoritesOnly) {
      filtered = filtered.filter((ex) => favoriteIds.has(ex.id));
    }

    // Bodyweight Only
    if (qf.bodyweightOnly) {
      filtered = filtered.filter((ex) => {
        const equipment = (ex as any).equipment;
        return !equipment || equipment.length === 0 || equipment.includes('bodyweight');
      });
    }

    // Apartment Friendly (small space + quiet)
    if (qf.apartmentFriendly) {
      filtered = filtered.filter((ex) => {
        const e = ex as any;
        return (e.small_space ?? e.smallSpace) && (e.quiet ?? e.quiet);
      });
    }

    // Verified Only
    if (qf.verifiedOnly) {
      filtered = filtered.filter((ex) => {
        const e = ex as any;
        return e.is_verified ?? e.isVerified ?? true;
      });
    }

    // Search filter
    if (text.trim()) {
      const query = text.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.description?.toLowerCase().includes(query) ||
          (ex as any).primaryMuscles?.some((m: string) => m.toLowerCase().includes(query)) ||
          ex.targetMuscleGroups?.some((muscle) => muscle.toLowerCase().includes(query))
      );
    }

    setFilteredExercises(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, showFavoritesOnly, quickFilters);
  };

  const toggleFavoritesFilter = () => {
    const newValue = !showFavoritesOnly;
    setShowFavoritesOnly(newValue);
    applyFilters(searchQuery, newValue, quickFilters);
  };

  const toggleQuickFilter = (key: keyof QuickFilters) => {
    const newFilters = { ...quickFilters, [key]: !quickFilters[key] };
    setQuickFilters(newFilters);
    applyFilters(searchQuery, showFavoritesOnly, newFilters);
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

    // Navigate back to NewWorkout with selected IDs and full state
    navigation.navigate('NewWorkout', {
      selectedExerciseIds: selectedIds,
      circuitIndex: route.params?.circuitIndex ?? 0,
      workoutName: route.params?.workoutName,
      circuits: route.params?.circuits,
      setsPerCircuit: route.params?.setsPerCircuit,
      workInterval: route.params?.workInterval,
      restInterval: route.params?.restInterval,
      isSynced: route.params?.isSynced,
      exercisesJson: route.params?.exercisesJson,
    });
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

  const favoritesCount = favoriteIds.size;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
          placeholder="Search exercises..."
          placeholderTextColor={theme.text.tertiary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Quick Filter Chips — all in one horizontal scroll row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickFiltersScroll}
        contentContainerStyle={styles.quickFiltersContent}
      >
        <FilterChip
          label="Bodyweight Only"
          active={quickFilters.bodyweightOnly}
          onPress={() => toggleQuickFilter('bodyweightOnly')}
        />
        <FilterChip
          label="Apartment Friendly"
          active={quickFilters.apartmentFriendly}
          onPress={() => toggleQuickFilter('apartmentFriendly')}
        />
        <FilterChip
          label="Verified Only"
          active={quickFilters.verifiedOnly}
          onPress={() => toggleQuickFilter('verifiedOnly')}
        />
        <FilterChip
          label={`Favorites${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`}
          active={showFavoritesOnly}
          onPress={toggleFavoritesFilter}
          icon={showFavoritesOnly
            ? <HeartIconSolid size={16} color="#FFFFFF" />
            : <HeartIcon size={16} color={theme.text.secondary} />
          }
        />
        <View style={{ width: spacing[1] }} />
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={[styles.resultsText, { color: theme.text.secondary }]}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
        </Text>
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
            {showFavoritesOnly ? (
              <>
                <HeartIcon size={48} color={theme.text.tertiary} />
                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Favorites Yet</Text>
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                  Add favorites from the Exercise Library.
                </Text>
              </>
            ) : (
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No exercises found</Text>
            )}
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
  quickFiltersScroll: {
    marginBottom: spacing[2],
  },
  quickFiltersContent: {
    paddingHorizontal: spacing[5],
    paddingVertical: 4,
    gap: spacing[2],
    flexGrow: 0,
    alignItems: 'center',
  },
  resultsRow: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  resultsText: {
    fontSize: 13,
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
    paddingHorizontal: spacing[8],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
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
