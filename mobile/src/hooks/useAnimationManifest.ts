import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AnimationManifest,
  ExerciseAnimationMetadata,
  loadManifest,
  checkForUpdates,
  getExerciseAnimation,
  getPreferredFormat,
} from '@/types/AnimationManifest';

const MANIFEST_CACHE_KEY = '@intensely/animation_manifest';
const MANIFEST_CACHE_TIMESTAMP_KEY = '@intensely/animation_manifest_timestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface UseAnimationManifestResult {
  manifest: AnimationManifest | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getExercise: (slug: string) => ExerciseAnimationMetadata | undefined;
  hasAnimation: (slug: string) => boolean;
}

/**
 * Hook for loading and accessing the animation manifest
 *
 * Features:
 * - Loads manifest from CDN
 * - Caches manifest locally (24h)
 * - Auto-checks for updates
 * - Provides helper functions
 *
 * @param autoLoad - Automatically load manifest on mount (default: true)
 * @param checkUpdates - Check for updates on mount (default: true)
 * @param cdnBaseUrl - CDN base URL (optional)
 *
 * @example
 * const { manifest, getExercise, hasAnimation } = useAnimationManifest();
 *
 * const exerciseMeta = getExercise('push-up');
 * if (exerciseMeta?.webp) {
 *   console.log(`Frame count: ${exerciseMeta.webp.frame_count}`);
 * }
 */
export const useAnimationManifest = (
  autoLoad: boolean = true,
  checkUpdates: boolean = true,
  cdnBaseUrl?: string
): UseAnimationManifestResult => {
  const [manifest, setManifest] = useState<AnimationManifest | null>(null);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<Error | null>(null);

  // Load manifest from cache
  const loadFromCache = useCallback(async (): Promise<AnimationManifest | null> => {
    try {
      const cached = await AsyncStorage.getItem(MANIFEST_CACHE_KEY);
      const timestamp = await AsyncStorage.getItem(MANIFEST_CACHE_TIMESTAMP_KEY);

      if (!cached || !timestamp) {
        return null;
      }

      // Check if cache is expired
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();

      if (now - cacheTime > CACHE_DURATION_MS) {
        console.log('Manifest cache expired');
        return null;
      }

      const parsed: AnimationManifest = JSON.parse(cached);
      console.log(`Loaded manifest from cache (${parsed.total_exercises} exercises)`);
      return parsed;
    } catch (error) {
      console.error('Failed to load manifest from cache:', error);
      return null;
    }
  }, []);

  // Save manifest to cache
  const saveToCache = useCallback(async (manifest: AnimationManifest): Promise<void> => {
    try {
      await AsyncStorage.setItem(MANIFEST_CACHE_KEY, JSON.stringify(manifest));
      await AsyncStorage.setItem(MANIFEST_CACHE_TIMESTAMP_KEY, Date.now().toString());
      console.log('Saved manifest to cache');
    } catch (error) {
      console.error('Failed to save manifest to cache:', error);
    }
  }, []);

  // Load manifest from CDN
  const loadFromCDN = useCallback(async (): Promise<AnimationManifest> => {
    console.log('Loading manifest from CDN...');
    const manifest = await loadManifest(cdnBaseUrl);
    console.log(`Loaded manifest from CDN (${manifest.total_exercises} exercises)`);
    return manifest;
  }, [cdnBaseUrl]);

  // Main load function
  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await loadFromCache();

      if (cached) {
        setManifest(cached);

        // Optionally check for updates in background
        if (checkUpdates) {
          checkForUpdates(cached, cdnBaseUrl)
            .then((needsUpdate) => {
              if (needsUpdate) {
                console.log('Manifest update available, refreshing...');
                loadFromCDN()
                  .then((updated) => {
                    setManifest(updated);
                    saveToCache(updated);
                  })
                  .catch((error) => {
                    console.error('Failed to refresh manifest:', error);
                    // Keep using cached version
                  });
              }
            })
            .catch((error) => {
              console.error('Failed to check for updates:', error);
            });
        }
      } else {
        // No cache, load from CDN
        const manifest = await loadFromCDN();
        setManifest(manifest);
        saveToCache(manifest);
      }
    } catch (error) {
      console.error('Failed to load manifest:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromCache, loadFromCDN, saveToCache, checkUpdates, cdnBaseUrl]);

  // Refresh (force reload from CDN)
  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const manifest = await loadFromCDN();
      setManifest(manifest);
      await saveToCache(manifest);
    } catch (error) {
      console.error('Failed to refresh manifest:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromCDN, saveToCache]);

  // Helper: Get exercise metadata
  const getExercise = useCallback(
    (slug: string): ExerciseAnimationMetadata | undefined => {
      if (!manifest) return undefined;
      return getExerciseAnimation(manifest, slug);
    },
    [manifest]
  );

  // Helper: Check if exercise has animation
  const hasAnimation = useCallback(
    (slug: string): boolean => {
      const exercise = getExercise(slug);
      return !!(exercise?.webp || exercise?.lottie);
    },
    [getExercise]
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad]);

  return {
    manifest,
    isLoading,
    error,
    refresh,
    getExercise,
    hasAnimation,
  };
};

/**
 * Hook for getting animation metadata for a specific exercise
 *
 * @param slug - Exercise slug
 * @param manifest - Animation manifest (from useAnimationManifest)
 *
 * @example
 * const { manifest } = useAnimationManifest();
 * const { metadata, hasAnimation, preferredFormat } = useExerciseMetadata('push-up', manifest);
 *
 * if (hasAnimation) {
 *   console.log(`Use ${preferredFormat} format`);
 * }
 */
export const useExerciseMetadata = (
  slug: string,
  manifest: AnimationManifest | null
) => {
  const metadata = manifest ? getExerciseAnimation(manifest, slug) : undefined;
  const hasAnimation = !!(metadata?.webp || metadata?.lottie);
  const preferredFormat = metadata ? getPreferredFormat(metadata) : null;

  return {
    metadata,
    hasAnimation,
    preferredFormat,
    hasWebP: !!metadata?.webp,
    hasLottie: !!metadata?.lottie,
    frameCount: metadata?.webp?.frame_count,
    cameraAngle: metadata?.camera_angle,
    movementPattern: metadata?.movement_pattern,
  };
};

/**
 * Hook for getting animation URL with format preference
 *
 * @param slug - Exercise slug
 * @param format - Preferred format ('auto', 'webp', or 'lottie')
 * @param manifest - Animation manifest
 *
 * @example
 * const { manifest } = useAnimationManifest();
 * const { url, format, isAvailable } = useAnimationUrl('push-up', 'auto', manifest);
 *
 * if (isAvailable) {
 *   <Image source={{ uri: url }} />
 * }
 */
export const useAnimationUrl = (
  slug: string,
  format: 'auto' | 'webp' | 'lottie' = 'auto',
  manifest: AnimationManifest | null
) => {
  const metadata = manifest ? getExerciseAnimation(manifest, slug) : undefined;

  if (!metadata) {
    return {
      url: null,
      format: null,
      isAvailable: false,
    };
  }

  let selectedFormat: 'webp' | 'lottie' | null = null;
  let url: string | null = null;

  if (format === 'auto') {
    selectedFormat = getPreferredFormat(metadata);
  } else if (format === 'webp' && metadata.webp) {
    selectedFormat = 'webp';
  } else if (format === 'lottie' && metadata.lottie) {
    selectedFormat = 'lottie';
  }

  if (selectedFormat === 'webp' && metadata.webp) {
    url = metadata.webp.url || null;
  } else if (selectedFormat === 'lottie' && metadata.lottie) {
    url = metadata.lottie.url || null;
  }

  return {
    url,
    format: selectedFormat,
    isAvailable: !!url,
  };
};

export default useAnimationManifest;
