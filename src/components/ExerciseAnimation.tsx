import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

interface ExerciseAnimationProps {
  slug: string;
  size?: 'compact' | 'expanded';
  cdnBaseUrl?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

/**
 * ExerciseAnimation Component
 *
 * Displays animated WebP exercise demonstrations from CDN.
 *
 * @param slug - Exercise slug (e.g., "push-up", "bodyweight-squat")
 * @param size - Display size: 'compact' (120px) or 'expanded' (240px)
 * @param cdnBaseUrl - CDN base URL (defaults to env var or hardcoded)
 * @param onLoadStart - Callback when loading starts
 * @param onLoadEnd - Callback when loading completes
 * @param onError - Callback when loading fails
 *
 * @example
 * <ExerciseAnimation slug="push-up" size="expanded" />
 */
export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  slug,
  size = 'compact',
  cdnBaseUrl = process.env.EXPO_PUBLIC_CDN_BASE_URL || 'https://cdn.intensely.app',
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Construct CDN URL
  const animationUrl = `${cdnBaseUrl}/animations/${slug}.webp`;

  // Size configuration
  const dimensions = size === 'compact' ? 120 : 240;

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
    console.error(`Failed to load animation for ${slug}:`, error);
  };

  return (
    <View style={[styles.container, { width: dimensions, height: dimensions }]}>
      {/* Loading skeleton */}
      {isLoading && (
        <View style={[styles.skeleton, { width: dimensions, height: dimensions }]}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}

      {/* Error state */}
      {hasError && (
        <View style={[styles.errorState, { width: dimensions, height: dimensions }]}>
          <View style={styles.errorIcon}>
            <View style={styles.errorIconBar} />
            <View style={[styles.errorIconBar, styles.errorIconBarRotated]} />
          </View>
        </View>
      )}

      {/* Animated WebP */}
      {!hasError && (
        <Image
          source={{ uri: animationUrl }}
          style={[styles.animation, { width: dimensions, height: dimensions }]}
          contentFit="contain"
          transition={200}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          cachePolicy="memory-disk"
          priority="normal"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  animation: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorState: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconBar: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#EF4444',
    borderRadius: 1,
  },
  errorIconBarRotated: {
    transform: [{ rotate: '90deg' }],
  },
});

export default ExerciseAnimation;
