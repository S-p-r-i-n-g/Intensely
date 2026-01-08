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

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList, 'Favorites'>;

const FavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();

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
      style={styles.favoriteCard}
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.exerciseId })}
    >
      <View style={styles.cardContent}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.exercise.name}</Text>
          {item.exercise.description && (
            <Text style={styles.exerciseDescription} numberOfLines={2}>
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptyText}>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
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
  header: {
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  favoriteCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  removeButton: {
    padding: 8,
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
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
