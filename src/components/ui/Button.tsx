import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { designTokens } from '../../config/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'icon';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? designTokens.colors.text.onPrimary : designTokens.colors.primary.main}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primary: {
    backgroundColor: designTokens.colors.primary.main,
    ...designTokens.shadows.sm,
  },
  secondary: {
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
    borderWidth: 1,
    borderColor: designTokens.colors.neutral.outline,
  },
  text: {
    backgroundColor: 'transparent',
  },
  icon: {
    backgroundColor: 'transparent',
    minWidth: designTokens.touchTargets.recommended,
    minHeight: designTokens.touchTargets.recommended,
  },
  // Sizes
  smallSize: {
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    minHeight: designTokens.touchTargets.min,
  },
  mediumSize: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    minHeight: designTokens.touchTargets.recommended,
  },
  largeSize: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.xl,
    minHeight: designTokens.touchTargets.comfortable,
  },
  // Text styles
  baseText: {
    ...designTokens.typography.button,
    textAlign: 'center',
  },
  primaryText: {
    color: designTokens.colors.text.onPrimary,
  },
  secondaryText: {
    color: designTokens.colors.text.primary,
  },
  textText: {
    color: designTokens.colors.primary.main,
  },
  iconText: {
    color: designTokens.colors.text.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
