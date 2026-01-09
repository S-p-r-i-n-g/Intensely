import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { designTokens } from '../../config/design-tokens';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  onPress,
  style,
  testID,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`${padding}Padding`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: designTokens.borderRadius.md,
  },
  elevated: {
    backgroundColor: designTokens.colors.neutral.surface,
    ...designTokens.shadows.md,
  },
  outlined: {
    backgroundColor: designTokens.colors.neutral.surface,
    borderWidth: 1,
    borderColor: designTokens.colors.neutral.outline,
  },
  filled: {
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
  },
  smallPadding: {
    padding: designTokens.spacing.sm,
  },
  mediumPadding: {
    padding: designTokens.spacing.md,
  },
  largePadding: {
    padding: designTokens.spacing.lg,
  },
});

// Card sub-components for structured content
export const CardHeader: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardTitle: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.title, style]}>{children}</View>
);

export const CardContent: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.content, style]}>{children}</View>
);

export const CardActions: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.actions, style]}>{children}</View>
);

const subComponentStyles = StyleSheet.create({
  header: {
    marginBottom: designTokens.spacing.md,
  },
  title: {
    marginBottom: designTokens.spacing.sm,
  },
  content: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
});

export default Card;
