import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ExercisesStackParamList } from '../../navigation/types';
import { exercisesApi, favoritesApi } from '../../api';
import type { Exercise } from '../../types/api';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';
import { Text, Button, SkeletonText, SkeletonButton, SkeletonLoader } from '../../components/ui';
import { HeartIcon, PlayCircleIcon, PencilSquareIcon, TrashIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartIconSolid } from 'react-native-heroicons/solid';
import { DIFFICULTY_COLORS, DifficultyLevel } from '../../hooks/useWorkoutBuilder';
import { useAuthStore } from '../../stores/authStore';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList, 'ExerciseDetail'>;
type RoutePropType = RouteProp<ExercisesStackParamList, 'ExerciseDetail'>;

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

const ExerciseDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [route.params.exerciseId]);

  const loadExercise = async () => {
    try {
      setIsLoading(true);
      const response = await exercisesApi.getById(route.params.exerciseId);
      setExercise(response.data);
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
      const response = await favoritesApi.getFavoriteExercises();
      const isFav = response.data.some((fav: any) => fav.exerciseId === exerciseId);
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
        await favoritesApi.removeExercise(exercise.id);
        setIsFavorite(false);
      } else {
        await favoritesApi.addExercise(exercise.id);
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

  const handleEdit = () => {
    if (!exercise) return;
    navigation.navigate('CreateExercise', { exercise });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);

    try {
      setIsLoading(true);
      await exercisesApi.delete(exercise!.id);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      Alert.alert('Error', 'Failed to delete exercise.');
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (isLoading || !exercise) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.skeletonContent}>
          <SkeletonLoader width="70%" height={32} style={{ marginBottom: spacing[2] }} />
          <SkeletonText lines={2} style={{ marginBottom: spacing[4] }} />
          <SkeletonButton style={{ marginBottom: spacing[3] }} />
          <SkeletonText lines={5} />
        </View>
      </View>
    );
  }

  // Get muscles and equipment arrays
  const primaryMuscles = exercise.primaryMuscles || [];
  const secondaryMuscles = exercise.secondaryMuscles || [];
  const allMuscles = [...primaryMuscles, ...secondaryMuscles];
  const equipment = exercise.equipment || ['bodyweight'];
  const instructions = Array.isArray(exercise.instructions) ? exercise.instructions : [];
  const tips = Array.isArray(exercise.tips) ? exercise.tips : [];
  const commonMistakes = Array.isArray(exercise.commonMistakes) ? exercise.commonMistakes : [];

  // Check if current user owns this exercise
  const isOwner = user && exercise.createdBy === user.id;

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Card */}
      <View style={[styles.headerCard, { backgroundColor: theme.background.elevated }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.title, { color: theme.text.primary }]}>{exercise.name}</Text>

            <View style={styles.actionButtons}>
              {/* Edit/Delete Actions for Owner */}
              {isOwner && (
                <>
                  <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
                    <PencilSquareIcon size={24} color={theme.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                    <TrashIcon size={24} color={colors.error[500]} />
                  </TouchableOpacity>
                </>
              )}

              {/* Favorite Button */}
              <TouchableOpacity
                onPress={toggleFavorite}
                disabled={isTogglingFavorite}
                style={styles.favoriteButton}
              >
                {isFavorite ? (
                  <HeartIconSolid size={28} color={colors.primary[500]} />
                ) : (
                  <HeartIcon size={28} color={theme.text.tertiary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(exercise.difficulty) },
              ]}
            >
              <Text style={styles.badgeText}>{capitalize(exercise.difficulty)}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: theme.background.tertiary }]}>
              <Text style={[styles.categoryBadgeText, { color: theme.text.secondary }]}>
                {formatCategory(exercise.primaryCategory || 'full_body')}
              </Text>
            </View>
            {!exercise.isVerified && (
              <View style={[styles.customBadge, { backgroundColor: colors.primary[50] }]}>
                <Text style={[styles.customBadgeText, { color: colors.primary[500] }]}>Custom</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {exercise.description && (
          <Text style={[styles.description, { color: theme.text.secondary }]}>
            {exercise.description}
          </Text>
        )}

        {/* Equipment */}
        <View style={styles.equipmentRow}>
          <Text style={[styles.equipmentLabel, { color: theme.text.tertiary }]}>Equipment:</Text>
          <Text style={[styles.equipmentValue, { color: theme.text.primary }]}>
            {equipment.map((e) => capitalize(e)).join(', ')}
          </Text>
        </View>
      </View>

      {/* Video Button */}
      {exercise.videoUrl && (
        <Button
          variant="ghost"
          onPress={openVideo}
          style={[styles.videoButton, { backgroundColor: theme.background.elevated }]}
          textStyle={styles.videoButtonText}
        >
          Watch Tutorial Video
        </Button>
      )}

      {/* Target Muscles */}
      {allMuscles.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Target Muscles</Text>
          <View style={styles.musclesContainer}>
            {primaryMuscles.map((muscle, idx) => (
              <View key={`primary-${idx}`} style={styles.muscleChipPrimary}>
                <Text style={styles.muscleChipTextPrimary}>{capitalize(muscle)}</Text>
              </View>
            ))}
            {secondaryMuscles.map((muscle, idx) => (
              <View
                key={`secondary-${idx}`}
                style={[styles.muscleChipSecondary, { borderColor: theme.border.medium }]}
              >
                <Text style={[styles.muscleChipTextSecondary, { color: theme.text.secondary }]}>
                  {capitalize(muscle)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Instructions */}
      {instructions.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>How to Perform</Text>
          {instructions.map((instruction, idx) => (
            <View key={idx} style={styles.instructionItem}>
              <View style={[styles.instructionNumber, { backgroundColor: colors.primary[500] }]}>
                <Text style={styles.instructionNumberText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.instructionText, { color: theme.text.secondary }]}>
                {instruction}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Tips</Text>
          {tips.map((tip, idx) => (
            <View key={idx} style={styles.tipItem}>
              <Text style={[styles.tipBullet, { color: colors.success[500] }]}>•</Text>
              <Text style={[styles.tipText, { color: theme.text.secondary }]}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Common Mistakes */}
      {commonMistakes.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.background.elevated }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Common Mistakes</Text>
          {commonMistakes.map((mistake, idx) => (
            <View key={idx} style={styles.mistakeItem}>
              <Text style={[styles.mistakeBullet, { color: colors.error[500] }]}>•</Text>
              <Text style={[styles.mistakeText, { color: theme.text.secondary }]}>{mistake}</Text>
            </View>
          ))}
        </View>
      )}

    </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background.elevated }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Delete Exercise</Text>
            <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>
              Are you sure you want to delete this exercise? This cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Button
                variant="secondary"
                onPress={cancelDelete}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={confirmDelete}
                style={[styles.modalButton, styles.modalButtonDelete]}
              >
                Delete
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: 40,
  },
  skeletonContent: {
    padding: spacing[4],
    paddingTop: spacing[6],
  },
  headerCard: {
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  headerTop: {
    marginBottom: spacing[3],
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing[2],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing[1],
  },
  favoriteButton: {
    padding: spacing[1],
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  customBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing[3],
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentLabel: {
    fontSize: 13,
    marginRight: spacing[1],
  },
  equipmentValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  videoButton: {
    borderRadius: 16,
    marginBottom: spacing[3],
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
  },
  section: {
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  musclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  muscleChipPrimary: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  muscleChipTextPrimary: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  muscleChipSecondary: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  muscleChipTextSecondary: {
    fontSize: 13,
    fontWeight: '500',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    marginTop: 2,
  },
  instructionNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  tipBullet: {
    fontSize: 18,
    marginRight: spacing[2],
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  mistakeItem: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  mistakeBullet: {
    fontSize: 18,
    marginRight: spacing[2],
    marginTop: -2,
  },
  mistakeText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    borderRadius: 16,
    padding: spacing[5],
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing[5],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
  modalButtonDelete: {
    backgroundColor: colors.error[500],
  },
});

export default ExerciseDetailScreen;
