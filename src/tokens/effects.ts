/**
 * Effects System (P3 Enhancement)
 * Haptic feedback and interaction effects
 * Based on Gemini 3 Flash Preview recommendations
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback patterns for different interactions
 * Uses Expo Haptics for cross-platform support
 */
export const haptics = {
  /**
   * Light tap feedback for button presses
   */
  light: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium impact for confirmations
   */
  medium: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy impact for timer state changes (Gemini 3 recommendation)
   * Trigger when timer turns to Primary Red in last 5 seconds
   */
  heavy: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success notification feedback
   */
  success: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning notification feedback
   */
  warning: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error notification feedback
   */
  error: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Selection change feedback (for scrolling or swiping)
   */
  selection: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.selectionAsync();
    }
  },

  /**
   * Timer countdown thump (P3 Enhancement)
   * Heavy haptic for last 5 seconds countdown
   * Syncs with Primary Red color change
   */
  timerThump: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },
};

/**
 * Haptic feedback patterns for workout timer
 */
export const workoutHaptics = {
  /**
   * Exercise start
   */
  exerciseStart: () => {
    haptics.medium();
  },

  /**
   * Rest period start
   */
  restStart: () => {
    haptics.light();
  },

  /**
   * Countdown warning (last 5 seconds)
   * Use with color change to Primary Red
   */
  countdownWarning: () => {
    haptics.timerThump();
  },

  /**
   * Workout complete
   */
  workoutComplete: () => {
    haptics.success();
  },

  /**
   * Workout paused
   */
  workoutPaused: () => {
    haptics.light();
  },

  /**
   * Workout resumed
   */
  workoutResumed: () => {
    haptics.medium();
  },
};

// Type exports
export type Haptics = typeof haptics;
export type WorkoutHaptics = typeof workoutHaptics;
