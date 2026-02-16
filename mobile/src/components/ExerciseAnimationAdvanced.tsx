import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';

// Optional: Lottie support (install: npm install lottie-react-native)
let LottieView: any = null;
try {
  LottieView = require('lottie-react-native').default;
} catch (e) {
  // Lottie not installed, will fall back to WebP
}

type AnimationFormat = 'webp' | 'lottie' | 'auto';
type AnimationSize = 'compact' | 'medium' | 'expanded';

interface ExerciseAnimationAdvancedProps {
  slug: string;
  size?: AnimationSize;
  format?: AnimationFormat;
  cdnBaseUrl?: string;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  showLabel?: boolean;
  label?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

/**
 * ExerciseAnimationAdvanced Component
 *
 * Advanced exercise animation with WebP and Lottie support.
 *
 * Features:
 * - Auto-detects best format (WebP or Lottie)
 * - Multiple size presets
 * - Playback controls (speed, loop)
 * - Optional exercise label
 * - Loading skeleton
 * - Error handling with fallback
 *
 * @param slug - Exercise slug (e.g., "push-up")
 * @param size - Display size: 'compact' (100px), 'medium' (160px), or 'expanded' (240px)
 * @param format - Animation format: 'webp', 'lottie', or 'auto' (default)
 * @param cdnBaseUrl - CDN base URL
 * @param autoPlay - Auto-play animation (default: true)
 * @param loop - Loop animation (default: true)
 * @param speed - Playback speed multiplier (default: 1.0)
 * @param showLabel - Show exercise label below animation
 * @param label - Custom label text (uses slug if not provided)
 * @param onLoadStart - Callback when loading starts
 * @param onLoadEnd - Callback when loading completes
 * @param onError - Callback when loading fails
 *
 * @example
 * <ExerciseAnimationAdvanced
 *   slug="push-up"
 *   size="expanded"
 *   format="auto"
 *   showLabel
 * />
 */
export const ExerciseAnimationAdvanced: React.FC<ExerciseAnimationAdvancedProps> = ({
  slug,
  size = 'medium',
  format = 'auto',
  cdnBaseUrl = process.env.EXPO_PUBLIC_CDN_BASE_URL || 'https://cdn.intensely.app',
  autoPlay = true,
  loop = true,
  speed = 1.0,
  showLabel = false,
  label,
  onLoadStart,
  onLoadEnd,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'webp' | 'lottie' | null>(null);

  // Size configuration
  const sizeConfig = {
    compact: 100,
    medium: 160,
    expanded: 240,
  };
  const dimensions = sizeConfig[size];

  // Determine format to use
  const getFormat = (): 'webp' | 'lottie' => {
    if (format === 'lottie' && LottieView) return 'lottie';
    if (format === 'webp') return 'webp';
    // Auto: prefer Lottie if available (smaller files), fallback to WebP
    return LottieView ? 'lottie' : 'webp';
  };

  const currentFormat = activeFormat || getFormat();

  // Construct URLs
  const webpUrl = `${cdnBaseUrl}/animations/${slug}.webp`;
  const lottieUrl = `${cdnBaseUrl}/animations/${slug}.json`;

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    setActiveFormat(currentFormat);
    onLoadEnd?.();
  };

  const handleError = (error: any) => {
    console.error(`Failed to load ${currentFormat} animation for ${slug}:`, error);

    // Try fallback format
    if (currentFormat === 'lottie' && format === 'auto') {
      console.log('Falling back to WebP...');
      setActiveFormat('webp');
      setHasError(false);
    } else if (currentFormat === 'webp' && format === 'auto' && LottieView) {
      console.log('Falling back to Lottie...');
      setActiveFormat('lottie');
      setHasError(false);
    } else {
      setIsLoading(false);
      setHasError(true);
      onError?.(error);
    }
  };

  // Format label
  const displayLabel = label || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <View style={styles.wrapper}>
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
            <Text style={styles.errorText}>Failed to load</Text>
          </View>
        )}

        {/* Render based on format */}
        {!hasError && (
          <>
            {currentFormat === 'webp' && (
              <Image
                source={{ uri: webpUrl }}
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

            {currentFormat === 'lottie' && LottieView && (
              <LottieView
                source={{ uri: lottieUrl }}
                style={[styles.animation, { width: dimensions, height: dimensions }]}
                autoPlay={autoPlay}
                loop={loop}
                speed={speed}
                onAnimationFinish={handleLoad}
                onError={handleError}
              />
            )}
          </>
        )}
      </View>

      {/* Optional label */}
      {showLabel && (
        <Text style={styles.label} numberOfLines={2}>
          {displayLabel}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
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
    marginBottom: 4,
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
  errorText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default ExerciseAnimationAdvanced;
