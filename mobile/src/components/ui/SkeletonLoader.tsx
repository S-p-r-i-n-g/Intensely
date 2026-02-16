/**
 * Skeleton Loader Component (P3 Enhanced)
 * Loading states with shimmer animation
 * Uses Border Medium (#E2E8F0) as recommended by Gemini 3
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors, lightMode } from '../../tokens/colors';
import { borderRadius } from '../../tokens/spacing';
import { spacing } from '../../tokens/spacing';
import { shadows } from '../../tokens/shadows';
import { animations } from '../../tokens/animation';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
  animated?: boolean; // Enable shimmer animation
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius = borderRadius.sm,
  style,
  testID,
  animated = true,
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = animations.shimmer(shimmerValue);
      shimmerAnimation.start();

      return () => {
        shimmerAnimation.stop();
      };
    }
  }, [animated, shimmerValue]);

  const opacity = animated
    ? shimmerValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.6, 0.3],
      })
    : 1;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: customBorderRadius, opacity },
        style,
      ]}
      testID={testID}
    />
  );
};

// Predefined skeleton patterns for common use cases
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <SkeletonLoader width="60%" height={24} style={styles.cardTitle} />
    <SkeletonLoader width="100%" height={16} style={styles.cardLine} />
    <SkeletonLoader width="80%" height={16} style={styles.cardLine} />
  </View>
);

export const SkeletonText: React.FC<{ lines?: number; style?: ViewStyle }> = ({
  lines = 3,
  style,
}) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        width={index === lines - 1 ? '80%' : '100%'}
        height={16}
        style={styles.textLine}
      />
    ))}
  </View>
);

export const SkeletonButton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <SkeletonLoader
    width="100%"
    height={48}
    borderRadius={borderRadius.md}
    style={style}
  />
);

export const SkeletonWorkoutCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.workoutCard, style]}>
    <View style={styles.workoutHeader}>
      <SkeletonLoader width={60} height={60} borderRadius={borderRadius.md} />
      <View style={styles.workoutInfo}>
        <SkeletonLoader width="70%" height={20} style={styles.workoutTitle} />
        <SkeletonLoader width="50%" height={16} />
      </View>
    </View>
    <SkeletonLoader width="100%" height={12} style={styles.workoutProgress} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    // Use Border Medium (#E2E8F0) for Slate-themed skeleton states (Gemini 3 recommendation)
    backgroundColor: lightMode.border.medium,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: lightMode.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.md,
    marginBottom: spacing[4],
  },
  cardTitle: {
    marginBottom: spacing[2],
  },
  cardLine: {
    marginBottom: spacing[2],
  },
  textLine: {
    marginBottom: spacing[2],
  },
  workoutCard: {
    backgroundColor: lightMode.background.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.md,
    marginBottom: spacing[4],
  },
  workoutHeader: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  workoutInfo: {
    flex: 1,
    marginLeft: spacing[3],
    justifyContent: 'center',
  },
  workoutTitle: {
    marginBottom: spacing[2],
  },
  workoutProgress: {
    marginTop: spacing[3],
  },
});

export default SkeletonLoader;
