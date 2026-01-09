import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { designTokens } from '../../config/design-tokens';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
  style?: ViewStyle;
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  style,
  testID,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyle} testID={testID}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: designTokens.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  // Variants
  primary: {
    backgroundColor: designTokens.colors.primary.main,
  },
  success: {
    backgroundColor: designTokens.colors.semantic.success,
  },
  warning: {
    backgroundColor: designTokens.colors.semantic.warning,
  },
  error: {
    backgroundColor: designTokens.colors.semantic.error,
  },
  info: {
    backgroundColor: designTokens.colors.semantic.info,
  },
  neutral: {
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
  },
  // Sizes
  smallSize: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: 2,
    minHeight: 20,
  },
  mediumSize: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    minHeight: 24,
  },
  // Text
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: designTokens.colors.text.onPrimary,
  },
  successText: {
    color: designTokens.colors.text.onPrimary,
  },
  warningText: {
    color: designTokens.colors.text.onPrimary,
  },
  errorText: {
    color: designTokens.colors.text.onPrimary,
  },
  infoText: {
    color: designTokens.colors.text.onPrimary,
  },
  neutralText: {
    color: designTokens.colors.text.primary,
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
});

export default Badge;
