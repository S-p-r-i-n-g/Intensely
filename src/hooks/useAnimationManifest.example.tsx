import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {
  useAnimationManifest,
  useExerciseMetadata,
  useAnimationUrl,
} from './useAnimationManifest';
import ExerciseAnimation from '@/components/ExerciseAnimation';

/**
 * Animation Manifest Usage Examples
 *
 * Demonstrates how to use the animation manifest in various scenarios.
 */

// ============================================================================
// Example 1: Basic Manifest Loading
// ============================================================================

export const BasicManifestExample = () => {
  const { manifest, isLoading, error } = useAnimationManifest();

  if (isLoading) {
    return <Text>Loading animation manifest...</Text>;
  }

  if (error) {
    return <Text>Failed to load manifest: {error.message}</Text>;
  }

  if (!manifest) {
    return <Text>No manifest available</Text>;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Animation Manifest</Text>
      <Text>Version: {manifest.version}</Text>
      <Text>Total exercises: {manifest.total_exercises}</Text>
      <Text>WebP animations: {manifest.statistics.webp_count}</Text>
      <Text>Lottie animations: {manifest.statistics.lottie_count}</Text>
      <Text>Total size: {manifest.statistics.total_webp_size_mb.toFixed(1)} MB (WebP)</Text>
      <Text>Generated: {new Date(manifest.generated_at).toLocaleDateString()}</Text>
    </View>
  );
};

// ============================================================================
// Example 2: Check Animation Availability
// ============================================================================

export const AnimationAvailabilityExample = ({ exercise }: { exercise: any }) => {
  const { hasAnimation, getExercise } = useAnimationManifest();

  if (!hasAnimation(exercise.slug)) {
    return (
      <View style={styles.section}>
        <Text>No animation available for {exercise.name}</Text>
      </View>
    );
  }

  const metadata = getExercise(exercise.slug);

  return (
    <View style={styles.section}>
      <ExerciseAnimation slug={exercise.slug} size="compact" />
      <Text>{exercise.name}</Text>
      {metadata?.webp && (
        <Text style={styles.caption}>
          {metadata.webp.frame_count} frames, {metadata.webp.file_size_kb} KB
        </Text>
      )}
    </View>
  );
};

// ============================================================================
// Example 3: Display Metadata in Exercise Detail
// ============================================================================

export const ExerciseDetailWithMetadata = ({ exercise }: { exercise: any }) => {
  const { manifest } = useAnimationManifest();
  const { metadata, hasAnimation, frameCount, cameraAngle } = useExerciseMetadata(
    exercise.slug,
    manifest
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>

      {hasAnimation && (
        <>
          <ExerciseAnimation slug={exercise.slug} size="expanded" />

          <View style={styles.metadataCard}>
            <Text style={styles.metadataTitle}>Animation Info</Text>

            {frameCount && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Frames:</Text>
                <Text style={styles.metadataValue}>{frameCount}</Text>
              </View>
            )}

            {cameraAngle !== undefined && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Camera Angle:</Text>
                <Text style={styles.metadataValue}>{cameraAngle}°</Text>
              </View>
            )}

            {metadata?.webp && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>File Size:</Text>
                <Text style={styles.metadataValue}>
                  {metadata.webp.file_size_kb} KB
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      <Text style={styles.description}>{exercise.description}</Text>
    </View>
  );
};

// ============================================================================
// Example 4: Filter by Movement Pattern
// ============================================================================

export const ExercisesByPatternExample = () => {
  const { manifest } = useAnimationManifest();

  if (!manifest) {
    return <Text>Loading...</Text>;
  }

  // Filter exercises by movement pattern
  const pushExercises = Object.values(manifest.exercises).filter(
    (ex) => ex.movement_pattern === 'push'
  );

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Push Exercises ({pushExercises.length})</Text>
      <FlatList
        data={pushExercises}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <ExerciseAnimation slug={item.slug} size="compact" />
            <Text style={styles.exerciseName}>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.slug}
      />
    </View>
  );
};

// ============================================================================
// Example 5: Show Statistics Dashboard
// ============================================================================

export const StatisticsDashboardExample = () => {
  const { manifest } = useAnimationManifest();

  if (!manifest) {
    return <Text>Loading...</Text>;
  }

  const stats = manifest.statistics;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animation Statistics</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_exercises}</Text>
          <Text style={styles.statLabel}>Total Exercises</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.webp_count}</Text>
          <Text style={styles.statLabel}>WebP Animations</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_frames}</Text>
          <Text style={styles.statLabel}>Total Frames</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {stats.total_webp_size_mb.toFixed(1)} MB
          </Text>
          <Text style={styles.statLabel}>Total Size</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Movement Patterns</Text>
      {Object.entries(stats.movement_patterns)
        .sort(([, a], [, b]) => b - a)
        .map(([pattern, count]) => (
          <View key={pattern} style={styles.patternRow}>
            <Text style={styles.patternName}>{pattern}</Text>
            <Text style={styles.patternCount}>{count}</Text>
          </View>
        ))}
    </View>
  );
};

// ============================================================================
// Example 6: Automatic Format Selection
// ============================================================================

export const AutoFormatSelectionExample = ({ exercise }: { exercise: any }) => {
  const { manifest } = useAnimationManifest();
  const { url, format, isAvailable } = useAnimationUrl(
    exercise.slug,
    'auto', // Automatically choose best format
    manifest
  );

  if (!isAvailable) {
    return <Text>No animation available</Text>;
  }

  return (
    <View style={styles.section}>
      <ExerciseAnimation slug={exercise.slug} size="compact" />
      <Text>{exercise.name}</Text>
      <Text style={styles.caption}>Format: {format?.toUpperCase()}</Text>
    </View>
  );
};

// ============================================================================
// Example 7: Progress Indicator with Frame Count
// ============================================================================

export const AnimationProgressExample = ({ exercise }: { exercise: any }) => {
  const { manifest } = useAnimationManifest();
  const { frameCount } = useExerciseMetadata(exercise.slug, manifest);
  const [currentFrame, setCurrentFrame] = React.useState(0);

  React.useEffect(() => {
    if (!frameCount) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, 1000 / 15); // 15 FPS

    return () => clearInterval(interval);
  }, [frameCount]);

  if (!frameCount) {
    return <Text>Loading...</Text>;
  }

  const progress = (currentFrame / frameCount) * 100;

  return (
    <View style={styles.section}>
      <ExerciseAnimation slug={exercise.slug} size="compact" />
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.caption}>
        Frame {currentFrame + 1} of {frameCount}
      </Text>
    </View>
  );
};

// ============================================================================
// Example 8: Refresh Manifest on Pull-to-Refresh
// ============================================================================

export const RefreshableExerciseListExample = ({ exercises }: { exercises: any[] }) => {
  const { manifest, isLoading, refresh } = useAnimationManifest();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={exercises}
      renderItem={({ item }) => (
        <AnimationAvailabilityExample exercise={item} />
      )}
      keyExtractor={(item) => item.slug}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};

// ============================================================================
// Example 9: Show File Sizes for Download Estimation
// ============================================================================

export const DownloadEstimationExample = ({ exercises }: { exercises: any[] }) => {
  const { manifest } = useAnimationManifest();

  if (!manifest) {
    return <Text>Loading...</Text>;
  }

  const totalSize = exercises.reduce((sum, exercise) => {
    const metadata = manifest.exercises[exercise.slug];
    if (metadata?.webp) {
      return sum + metadata.webp.file_size_bytes;
    }
    return sum;
  }, 0);

  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Download All Animations</Text>
      <Text>Total exercises: {exercises.length}</Text>
      <Text>Total size: {totalSizeMB} MB</Text>
      <TouchableOpacity style={styles.downloadButton}>
        <Text style={styles.downloadButtonText}>Download All</Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// Example 10: Check for Manifest Updates
// ============================================================================

export const ManifestUpdateCheckerExample = () => {
  const { manifest, refresh } = useAnimationManifest();
  const [hasUpdate, setHasUpdate] = React.useState(false);
  const [checking, setChecking] = React.useState(false);

  const checkForUpdates = async () => {
    if (!manifest) return;

    setChecking(true);
    try {
      const { checkForUpdates } = await import('@/types/AnimationManifest');
      const needsUpdate = await checkForUpdates(manifest);
      setHasUpdate(needsUpdate);
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = async () => {
    await refresh();
    setHasUpdate(false);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Manifest Updates</Text>

      {manifest && (
        <Text>Current version: {manifest.version}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={checkForUpdates}
        disabled={checking}
      >
        <Text style={styles.buttonText}>
          {checking ? 'Checking...' : 'Check for Updates'}
        </Text>
      </TouchableOpacity>

      {hasUpdate && (
        <>
          <Text style={styles.updateText}>Update available!</Text>
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update Now</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  caption: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 12,
  },
  metadataCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metadataLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  metadataValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  patternName: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  patternCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  exerciseCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  updateText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default BasicManifestExample;
