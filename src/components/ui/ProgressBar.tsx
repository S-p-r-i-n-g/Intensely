import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { designTokens } from '../../config/design-tokens';

export type ProgressBarVariant = 'linear' | 'circular';
export type ProgressBarColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface ProgressBarProps {
  progress: number; // 0-1
  variant?: ProgressBarVariant;
  color?: ProgressBarColor;
  showLabel?: boolean;
  height?: number;
  style?: ViewStyle;
  testID?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  height = 8,
  style,
  testID,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(clampedProgress * 100);

  if (variant === 'circular') {
    // For now, we'll implement linear. Circular can be added later with SVG
    return <LinearProgressBar progress={clampedProgress} color={color} showLabel={showLabel} height={height} style={style} testID={testID} />;
  }

  return <LinearProgressBar progress={clampedProgress} color={color} showLabel={showLabel} height={height} style={style} testID={testID} />;
};

const LinearProgressBar: React.FC<{
  progress: number;
  color: ProgressBarColor;
  showLabel: boolean;
  height: number;
  style?: ViewStyle;
  testID?: string;
}> = ({ progress, color, showLabel, height, style, testID }) => {
  const colorMap = {
    primary: designTokens.colors.primary.main,
    success: designTokens.colors.semantic.success,
    warning: designTokens.colors.semantic.warning,
    error: designTokens.colors.semantic.error,
    info: designTokens.colors.semantic.info,
  };

  return (
    <View style={[styles.container, { height }, style]} testID={testID}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              height,
              backgroundColor: colorMap[color],
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  track: {
    flex: 1,
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
    borderRadius: designTokens.borderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: designTokens.borderRadius.round,
  },
  label: {
    ...designTokens.typography.caption,
    color: designTokens.colors.text.secondary,
    minWidth: 40,
    textAlign: 'right',
  },
});

export default ProgressBar;
