import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExercisesStackParamList } from '../../navigation/types';
import { exercisesApi, favoritesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList, 'ExerciseDetail'>;
type RoutePropType = RouteProp<ExercisesStackParamList, 'ExerciseDetail'>;

const ExerciseDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [route.params.exerciseId]);

  const loadExercise = async () => {
    try {
      setIsLoading(true);
      const response = await exercisesApi.getById(route.params.exerciseId);
      setExercise(response.data);

      // Check if exercise is favorited
      checkIfFavorite(response.data.id);
    } catch (error: any) {
      console.error('Failed to load exercise:', error);
      Alert.alert('Error', 'Could not load exercise details.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorite = async (exerciseId: string) => {
    try {
      const response = await favoritesApi.getAll();
      const isFav = response.data.some((fav) => fav.exerciseId === exerciseId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!exercise) return;

    try {
      setIsTogglingFavorite(true);

      if (isFavorite) {
        // Find the favorite ID and remove it
        const favoritesResponse = await favoritesApi.getAll();
        const favorite = favoritesResponse.data.find((fav) => fav.exerciseId === exercise.id);
        if (favorite) {
          await favoritesApi.remove(favorite.id);
        }
        setIsFavorite(false);
      } else {
        await favoritesApi.add(exercise.id);
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Could not update favorite status.');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const openVideo = () => {
    if (exercise?.videoUrl) {
      Linking.openURL(exercise.videoUrl).catch((err) => {
        console.error('Failed to open video:', err);
        Alert.alert('Error', 'Could not open video.');
      });
    }
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{exercise.name}</Text>
          <TouchableOpacity
            onPress={toggleFavorite}
            disabled={isTogglingFavorite}
            style={styles.favoriteButton}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Difficulty Badge */}
        {exercise.difficulty && (
          <View
            style={[
              styles.difficultyBadge,
              exercise.difficulty === 'beginner' && styles.difficultyBeginner,
              exercise.difficulty === 'intermediate' && styles.difficultyIntermediate,
              exercise.difficulty === 'advanced' && styles.difficultyAdvanced,
            ]}
          >
            <Text style={styles.difficultyText}>
              {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Video Section */}
      {exercise.videoUrl && (
        <TouchableOpacity style={styles.videoSection} onPress={openVideo}>
          <Text style={styles.videoIcon}>📹</Text>
          <Text style={styles.videoText}>Watch Tutorial Video</Text>
          <Text style={styles.videoArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Description */}
      {exercise.description && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Description</Text>
          <Text style={[styles.descriptionText, { color: theme.text.secondary }]}>{exercise.description}</Text>
        </View>
      )}

      {/* Target Muscle Groups */}
      {exercise.targetMuscleGroups && exercise.targetMuscleGroups.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Target Muscle Groups</Text>
          <View style={styles.muscleGroupsContainer}>
            {exercise.targetMuscleGroups.map((muscle) => (
              <View key={muscle} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Instructions */}
      {exercise.instructions && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>How to Perform</Text>
          <Text style={[styles.instructionsText, { color: theme.text.primary }]}>{exercise.instructions}</Text>
        </View>
      )}

      {/* Equipment */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Equipment Required</Text>
        <Text style={[styles.equipmentText, { color: theme.text.secondary }]}>
          {exercise.equipmentRequired || 'No equipment needed'}
        </Text>
      </View>

      {/* Tips */}
      {exercise.tips && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>💡 Tips</Text>
          <Text style={[styles.tipsText, { color: theme.text.secondary }]}>{exercise.tips}</Text>
        </View>
      )}

      {/* Common Mistakes */}
      {exercise.commonMistakes && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>⚠️ Common Mistakes</Text>
          <Text style={[styles.mistakesText, { color: theme.text.secondary }]}>{exercise.commonMistakes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.viewProgressButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => {
            // @ts-ignore - Navigate to different stack
            navigation.navigate('Progress', {
              screen: 'ExerciseProgress',
              params: { exerciseId: exercise.id },
            });
          }}
        >
          <Text style={[styles.viewProgressButtonText, { color: theme.text.primary }]}>View Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logProgressButton}
          onPress={() => {
            // @ts-ignore - Navigate to different stack
            navigation.navigate('Progress', {
              screen: 'LogProgress',
              params: { exerciseId: exercise.id },
            });
          }}
        >
          <Text style={styles.logProgressButtonText}>Log Progress</Text>
        </TouchableOpacity>
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
    padding: spacing.lg,
    paddingTop: 30,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  favoriteIcon: {
    fontSize: 32,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  videoIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  videoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
  },
  videoArrow: {
    fontSize: 18,
    color: colors.primary[500],
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  muscleTag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  muscleTagText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  equipmentText: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  tipsText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  mistakesText: {
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    gap: spacing.sm,
  },
  viewProgressButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  viewProgressButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logProgressButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  logProgressButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ExerciseDetailScreen;
