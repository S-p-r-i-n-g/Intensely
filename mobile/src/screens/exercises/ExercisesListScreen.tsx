import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExercisesStackParamList } from '../../navigation/types';
import { exercisesApi, favoritesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';
import { Text } from '../../components/ui';
import { MagnifyingGlassIcon, PlusIcon, HeartIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import { DIFFICULTY_COLORS, DifficultyLevel } from '../../hooks/useWorkoutBuilder';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList, 'ExercisesList'>;

// Helper to get difficulty color
const getDifficultyColor = (level?: string): string => {
  const normalizedLevel = (level?.toLowerCase() || 'intermediate') as DifficultyLevel;
  return DIFFICULTY_COLORS[normalizedLevel] || DIFFICULTY_COLORS.intermediate;
};

// Helper to capitalize
const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Format category for display
const formatCategory = (category: string) => {
  return category
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
};

const ExercisesListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const loadData = async () => {
    try {
      // Load exercises - this is the critical data
      const exercisesResponse = await exercisesApi.getAll();

      // Handle both response formats: direct array or nested data
      const data = Array.isArray(exercisesResponse.data)
        ? exercisesResponse.data
        : exercisesResponse.data?.exercises || exercisesResponse.data?.data || [];
      setExercises(data);

      // Try to load favorites, but don't fail if backend is unavailable
      try {
        const favoritesResponse = await favoritesApi.getFavoriteExercises();
        const favIds = new Set(favoritesResponse.data.map((fav) => fav.exerciseId));
        setFavoriteIds(favIds);
      } catch (favError) {
        console.warn('Failed to load favorites (backend unavailable):', favError);
        // Continue without favorites - this is not critical
        setFavoriteIds(new Set());
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload when screen gains focus (e.g., after creating an exercise)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Apply filters whenever exercises, search, or favorites filter changes
  useEffect(() => {
    applyFilters(searchQuery, showFavoritesOnly);
  }, [exercises, favoriteIds, showFavoritesOnly, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const applyFilters = (text: string, favoritesOnly: boolean) => {
    let filtered = exercises;

    // Apply favorites filter
    if (favoritesOnly) {
      filtered = filtered.filter((ex) => favoriteIds.has(ex.id));
    }

    // Apply search filter
    if (text.trim()) {
      const query = text.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.primaryCategory?.toLowerCase().includes(query) ||
          ex.primaryMuscles?.some((m) => m.toLowerCase().includes(query))
      );
    }

    setFilteredExercises(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(text, showFavoritesOnly);
  };

  const toggleFavoritesFilter = () => {
    const newValue = !showFavoritesOnly;
    setShowFavoritesOnly(newValue);
    applyFilters(searchQuery, newValue);
  };

  const toggleFavorite = async (exerciseId: string) => {
    const isFavorite = favoriteIds.has(exerciseId);

    // Optimistic update
    const newFavoriteIds = new Set(favoriteIds);
    if (isFavorite) {
      newFavoriteIds.delete(exerciseId);
    } else {
      newFavoriteIds.add(exerciseId);
    }
    setFavoriteIds(newFavoriteIds);

    try {
      if (isFavorite) {
        await favoritesApi.removeExercise(exerciseId);
      } else {
        await favoritesApi.addExercise(exerciseId);
      }
    } catch (error) {
      // Revert on error (backend unavailable)
      console.warn('Failed to toggle favorite (backend unavailable):', error);
      setFavoriteIds(favoriteIds);
    }
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => {
    const isFavorite = favoriteIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.background.elevated }]}
        onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
        activeOpacity={0.7}
      >
        {/* Header: Name + Heart + Difficulty Badge */}
        <View style={styles.cardHeader}>
          <Text style={[styles.cardName, { color: theme.text.primary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isFavorite ? (
                <HeartIconSolid size={20} color={colors.primary[500]} />
              ) : (
                <HeartIcon size={20} color={theme.text.tertiary} />
              )}
            </TouchableOpacity>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{capitalize(item.difficulty)}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text
          style={[styles.cardDescription, { color: theme.text.secondary }]}
          numberOfLines={2}
        >
          {item.description || 'No description available.'}
        </Text>

        {/* Tags: Category • Equipment */}
        <View style={styles.tagsRow}>
          <Text style={[styles.tag, { color: theme.text.tertiary }]}>
            {formatCategory(item.primaryCategory || 'full_body')}
          </Text>
          <Text style={[styles.tagDot, { color: theme.text.tertiary }]}>•</Text>
          <Text style={[styles.tag, { color: theme.text.tertiary }]}>
            {item.equipment && item.equipment.length > 0
              ? capitalize(item.equipment[0])
              : 'Bodyweight'}
          </Text>
          {!item.isVerified && (
            <>
              <Text style={[styles.tagDot, { color: theme.text.tertiary }]}>•</Text>
              <Text style={[styles.customTag, { color: colors.primary[500] }]}>Custom</Text>
            </>
          )}
        </View>

        {/* Muscles */}
        {item.primaryMuscles && item.primaryMuscles.length > 0 && (
          <View style={styles.musclesRow}>
            {item.primaryMuscles.slice(0, 3).map((muscle, idx) => (
              <View key={`${muscle}-${idx}`} style={styles.muscleChip}>
                <Text style={styles.muscleChipText}>{capitalize(muscle)}</Text>
              </View>
            ))}
            {item.primaryMuscles.length > 3 && (
              <Text style={[styles.moreText, { color: theme.text.tertiary }]}>
                +{item.primaryMuscles.length - 3}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const favoritesCount = favoriteIds.size;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1" style={{ color: theme.text.primary }}>
          Exercises
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.background.secondary }]}>
          <MagnifyingGlassIcon size={20} color={theme.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder="Search exercises..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor: showFavoritesOnly ? colors.primary[500] : theme.background.secondary,
              borderColor: showFavoritesOnly ? colors.primary[500] : theme.border.medium,
            },
          ]}
          onPress={toggleFavoritesFilter}
        >
          {showFavoritesOnly ? (
            <HeartIconSolid size={16} color="#FFFFFF" />
          ) : (
            <HeartIcon size={16} color={theme.text.secondary} />
          )}
          <Text
            style={[
              styles.filterChipText,
              { color: showFavoritesOnly ? '#FFFFFF' : theme.text.secondary },
            ]}
          >
            Favorites{favoritesCount > 0 ? ` (${favoritesCount})` : ''}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.resultsText, { color: theme.text.secondary }]}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {showFavoritesOnly ? (
              <>
                <HeartIcon size={48} color={theme.text.tertiary} />
                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                  No Favorites Yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
                  Tap the heart icon on any exercise to add it to your favorites.
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                  No Exercises Found
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
                  Try adjusting your search or create a new exercise.
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + spacing[6] }]}
        onPress={() => navigation.navigate('CreateExercise')}
      >
        <PlusIcon size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  searchRow: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    height: 48,
    borderRadius: 100,
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  cardName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing[2],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  heartButton: {
    padding: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing[2],
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  tag: {
    fontSize: 12,
  },
  tagDot: {
    fontSize: 12,
    marginHorizontal: spacing[1],
  },
  customTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing[1],
  },
  muscleChip: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  muscleChipText: {
    fontSize: 11,
    color: colors.primary[600],
    fontWeight: '500',
  },
  moreText: {
    fontSize: 11,
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing[10],
    paddingHorizontal: spacing[8],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default ExercisesListScreen;
