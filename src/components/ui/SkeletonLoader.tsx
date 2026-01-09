import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { designTokens } from '../../config/design-tokens';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = designTokens.borderRadius.sm,
  style,
  testID,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
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

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
    // Add shimmer animation here if needed
  },
  card: {
    backgroundColor: designTokens.colors.neutral.surface,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.spacing.md,
    ...designTokens.shadows.sm,
    marginBottom: designTokens.spacing.md,
  },
  cardTitle: {
    marginBottom: designTokens.spacing.sm,
  },
  cardLine: {
    marginBottom: designTokens.spacing.xs,
  },
  textLine: {
    marginBottom: designTokens.spacing.xs,
  },
});

export default SkeletonLoader;
