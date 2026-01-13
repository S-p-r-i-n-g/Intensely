import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExercisesStackParamList } from '../../navigation/types';
import { favoritesApi } from '../../api';
import type { FavoriteExercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList, 'Favorites'>;

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [favorites, setFavorites] = useState<FavoriteExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use useFocusEffect to reload favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await favoritesApi.getAll();
      setFavorites(response.data);
    } catch (error: any) {
      console.error('Failed to load favorites:', error);
      Alert.alert('Error', 'Could not load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      await favoritesApi.remove(favoriteId);
      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
    } catch (error: any) {
      console.error('Failed to remove favorite:', error);
      Alert.alert('Error', 'Could not remove favorite.');
    }
  };

  const confirmRemove = (favorite: FavoriteExercise) => {
    Alert.alert(
      'Remove Favorite',
      `Remove "${favorite.exercise.name}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFavorite(favorite.id),
        },
      ]
    );
  };

  const renderFavoriteCard = ({ item }: { item: FavoriteExercise }) => (
    <TouchableOpacity
      style={[styles.favoriteCard, { backgroundColor: theme.background.secondary }]}
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.exerciseId })}
    >
      <View style={styles.cardContent}>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, { color: theme.text.primary }]}>{item.exercise.name}</Text>
          {item.exercise.description && (
            <Text style={[styles.exerciseDescription, { color: theme.text.secondary }]} numberOfLines={2}>
              {item.exercise.description}
            </Text>
          )}
          {item.exercise.targetMuscleGroups && item.exercise.targetMuscleGroups.length > 0 && (
            <View style={styles.muscleGroupsContainer}>
              {item.exercise.targetMuscleGroups.slice(0, 3).map((muscle) => (
                <View key={muscle} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>{muscle}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            confirmRemove(item);
          }}
        >
          <Text style={styles.removeIcon}>❤️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background.primary }]}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Favorites Yet</Text>
        <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
          Tap the heart icon on any exercise to add it to your favorites.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('ExercisesList')}
        >
          <Text style={styles.browseButtonText}>Browse Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>My Favorites</Text>
        <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
          {favorites.length} exercise{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
  header: {
    padding: spacing.lg,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  favoriteCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  removeButton: {
    padding: spacing.xs,
  },
  removeIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  browseButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
