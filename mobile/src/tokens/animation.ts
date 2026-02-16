/**
 * Animation Tokens
 * Based on Intensely Design System v1.0
 * Reference: /design.md
 */

import { Animated, Easing } from 'react-native';

// Animation Durations (in milliseconds)
export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

// Easing Functions
export const easing = {
  linear: Easing.linear,
  easeIn: Easing.ease,
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: { damping: 15, stiffness: 150 },
} as const;

// Common Animation Configs
export const animationConfig = {
  fade: {
    duration: duration.normal,
    easing: easing.easeOut,
    useNativeDriver: true,
  },

  scale: {
    duration: duration.fast,
    easing: easing.easeInOut,
    useNativeDriver: true,
  },

  slide: {
    duration: duration.normal,
    easing: easing.easeOut,
    useNativeDriver: true,
  },
} as const;

// Animation Helpers
export const animations = {
  /**
   * Fade in animation
   */
  fadeIn: (animatedValue: Animated.Value, customDuration?: number) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: customDuration || duration.normal,
      easing: easing.easeOut,
      useNativeDriver: true,
    });
  },

  /**
   * Fade out animation
   */
  fadeOut: (animatedValue: Animated.Value, customDuration?: number) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: customDuration || duration.normal,
      easing: easing.easeIn,
      useNativeDriver: true,
    });
  },

  /**
   * Scale bounce animation (for button press)
   */
  scaleBounce: (animatedValue: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.95,
        duration: duration.instant,
        easing: easing.easeOut,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);
  },

  /**
   * Slide up animation (for modals)
   */
  slideUp: (animatedValue: Animated.Value, customDuration?: number) => {
    return Animated.spring(animatedValue, {
      toValue: 0,
      damping: 20,
      stiffness: 100,
      useNativeDriver: true,
    });
  },

  /**
   * Slide down animation
   */
  slideDown: (animatedValue: Animated.Value, customDuration?: number) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: customDuration || duration.normal,
      easing: easing.easeIn,
      useNativeDriver: true,
    });
  },

  /**
   * Pulse animation (P3 Enhancement)
   * For paused timer state or attention-grabbing elements
   * Gentle continuous pulse effect
   */
  pulse: (animatedValue: Animated.Value, customDuration?: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.05,
          duration: customDuration || 1000,
          easing: easing.easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: customDuration || 1000,
          easing: easing.easeInOut,
          useNativeDriver: true,
        }),
      ])
    );
  },

  /**
   * Pulse opacity (for breathing effect on paused states)
   */
  pulseOpacity: (animatedValue: Animated.Value, customDuration?: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.6,
          duration: customDuration || 1500,
          easing: easing.easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: customDuration || 1500,
          easing: easing.easeInOut,
          useNativeDriver: true,
        }),
      ])
    );
  },

  /**
   * Shimmer animation (for skeleton loading states)
   */
  shimmer: (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: easing.linear,
        useNativeDriver: true,
      })
    );
  },
} as const;

// Type exports
export type Duration = typeof duration;
export type AnimationConfig = typeof animationConfig;
export type Animations = typeof animations;
