import { useState, useEffect, useCallback } from 'react';
import { Image } from 'expo-image';

interface UseExerciseAnimationOptions {
  slug: string;
  format?: 'webp' | 'lottie';
  cdnBaseUrl?: string;
  preload?: boolean;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

interface UseExerciseAnimationResult {
  url: string;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

/**
 * Hook for managing exercise animation URLs and loading state
 *
 * @param options - Configuration options
 * @returns Animation URL, loading state, and retry function
 *
 * @example
 * const { url, isLoading, hasError, retry } = useExerciseAnimation({
 *   slug: 'push-up',
 *   format: 'webp',
 *   preload: true,
 * });
 */
export const useExerciseAnimation = ({
  slug,
  format = 'webp',
  cdnBaseUrl = process.env.EXPO_PUBLIC_CDN_BASE_URL || 'https://cdn.intensely.app',
  preload = false,
  onLoad,
  onError,
}: UseExerciseAnimationOptions): UseExerciseAnimationResult => {
  const [isLoading, setIsLoading] = useState(preload);
  const [hasError, setHasError] = useState(false);

  // Construct URL
  const extension = format === 'lottie' ? 'json' : 'webp';
  const url = `${cdnBaseUrl}/animations/${slug}.${extension}`;

  // Preload animation
  useEffect(() => {
    if (preload) {
      setIsLoading(true);
      setHasError(false);

      Image.prefetch(url)
        .then(() => {
          setIsLoading(false);
          onLoad?.();
        })
        .catch((error) => {
          setIsLoading(false);
          setHasError(true);
          onError?.(error);
        });
    }
  }, [url, preload]);

  // Retry function
  const retry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    Image.prefetch(url)
      .then(() => {
        setIsLoading(false);
        onLoad?.();
      })
      .catch((error) => {
        setIsLoading(false);
        setHasError(true);
        onError?.(error);
      });
  }, [url]);

  return {
    url,
    isLoading,
    hasError,
    retry,
  };
};

/**
 * Hook for batch preloading multiple exercise animations
 *
 * @param slugs - Array of exercise slugs to preload
 * @param options - Configuration options
 *
 * @example
 * usePreloadAnimations(['push-up', 'squat', 'lunge'], {
 *   format: 'webp',
 *   onComplete: () => console.log('All preloaded!'),
 * });
 */
export const usePreloadAnimations = (
  slugs: string[],
  options?: {
    format?: 'webp' | 'lottie';
    cdnBaseUrl?: string;
    onProgress?: (loaded: number, total: number) => void;
    onComplete?: () => void;
    onError?: (slug: string, error: any) => void;
  }
) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [failedSlugs, setFailedSlugs] = useState<string[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  const {
    format = 'webp',
    cdnBaseUrl = process.env.EXPO_PUBLIC_CDN_BASE_URL || 'https://cdn.intensely.app',
    onProgress,
    onComplete,
    onError,
  } = options || {};

  useEffect(() => {
    if (slugs.length === 0) return;

    setIsPreloading(true);
    setLoadedCount(0);
    setFailedSlugs([]);

    const extension = format === 'lottie' ? 'json' : 'webp';
    const urls = slugs.map((slug) => `${cdnBaseUrl}/animations/${slug}.${extension}`);

    let loaded = 0;
    const failed: string[] = [];

    const preloadPromises = urls.map((url, index) => {
      return Image.prefetch(url)
        .then(() => {
          loaded++;
          setLoadedCount(loaded);
          onProgress?.(loaded, slugs.length);
        })
        .catch((error) => {
          const slug = slugs[index];
          failed.push(slug);
          setFailedSlugs([...failed]);
          onError?.(slug, error);
        });
    });

    Promise.allSettled(preloadPromises).then(() => {
      setIsPreloading(false);
      onComplete?.();
    });
  }, [slugs, format, cdnBaseUrl]);

  return {
    isPreloading,
    loadedCount,
    total: slugs.length,
    progress: slugs.length > 0 ? loadedCount / slugs.length : 0,
    failedSlugs,
  };
};

/**
 * Hook for managing animation cache
 *
 * Provides functions to clear and manage the animation cache.
 *
 * @example
 * const { clearCache, getCacheSize } = useAnimationCache();
 * await clearCache();
 */
export const useAnimationCache = () => {
  const clearCache = useCallback(async () => {
    try {
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
    } catch (error) {
      console.error('Failed to clear animation cache:', error);
      throw error;
    }
  }, []);

  const clearMemoryCache = useCallback(async () => {
    try {
      await Image.clearMemoryCache();
    } catch (error) {
      console.error('Failed to clear memory cache:', error);
      throw error;
    }
  }, []);

  const clearDiskCache = useCallback(async () => {
    try {
      await Image.clearDiskCache();
    } catch (error) {
      console.error('Failed to clear disk cache:', error);
      throw error;
    }
  }, []);

  return {
    clearCache,
    clearMemoryCache,
    clearDiskCache,
  };
};

/**
 * Hook for auto-preloading user's favorite exercises
 *
 * Automatically preloads animations when favorites change.
 *
 * @param favorites - Array of favorite exercise slugs
 * @param options - Configuration options
 *
 * @example
 * const favorites = useFavorites(); // Your favorites hook
 * useAutoPreloadFavorites(favorites.map(f => f.slug), {
 *   maxPreload: 10,
 *   format: 'webp',
 * });
 */
export const useAutoPreloadFavorites = (
  favorites: string[],
  options?: {
    maxPreload?: number;
    format?: 'webp' | 'lottie';
    enabled?: boolean;
  }
) => {
  const { maxPreload = 20, format = 'webp', enabled = true } = options || {};

  // Limit to maxPreload
  const slugsToPreload = enabled ? favorites.slice(0, maxPreload) : [];

  const result = usePreloadAnimations(slugsToPreload, {
    format,
    onProgress: (loaded, total) => {
      console.log(`Preloaded favorites: ${loaded}/${total}`);
    },
    onComplete: () => {
      console.log('Favorite animations preloaded');
    },
    onError: (slug, error) => {
      console.error(`Failed to preload favorite: ${slug}`, error);
    },
  });

  return result;
};

export default useExerciseAnimation;
