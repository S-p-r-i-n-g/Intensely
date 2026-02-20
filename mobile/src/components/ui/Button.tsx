/**
 * Button Component (P3 Enhanced with Gradients)
 * Premium gradient buttons using LinearGradient
 * Based on Gemini 3 Flash Preview recommendations
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, textStyles, touchTarget, gradients } from '../../tokens';
import { shadows } from '../../tokens/shadows';
import { useTheme } from '../../theme/ThemeContext';

export type ButtonVariant =
  | 'primary'
  | 'primaryGradient'  // P3: Premium gradient
  | 'secondary'
  | 'ghost'
  | 'large'
  | 'largeGradient'    // P3: Large with gradient
  | 'success'
  | 'successGradient'  // P3: Success with gradient
  | 'accent'
  | 'accentGradient';  // P3: Accent with gradient

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
  accessibilityLabel?: string;
  accessibilityHint?: string;
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
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  // Determine if this is a gradient variant
  const isGradient = variant.includes('Gradient');
  const baseVariant = variant.replace('Gradient', '') as 'primary' | 'large' | 'success' | 'accent';

  // Get gradient config based on variant
  const getGradientConfig = () => {
    if (variant === 'primaryGradient' || variant === 'largeGradient') {
      return gradients.primary;
    }
    if (variant === 'successGradient') {
      return gradients.success;
    }
    if (variant === 'accentGradient') {
      return gradients.accent;
    }
    return null;
  };

  const gradientConfig = getGradientConfig();

  const containerStyle = [
    styles.base,
    !isGradient && variant === 'primary' && styles.primary,
    !isGradient && variant === 'secondary' && styles.secondary,
    !isGradient && variant === 'ghost' && styles.ghost,
    !isGradient && variant === 'large' && styles.large,
    !isGradient && variant === 'success' && styles.success,
    !isGradient && variant === 'accent' && styles.accent,
    isGradient && baseVariant === 'large' && styles.largeGradient,
    isGradient && baseVariant !== 'large' && styles.gradientBase,
    !isGradient && styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyleList = [
    styles.baseText,
    (variant === 'primary' ||
     variant === 'primaryGradient' ||
     variant === 'large' ||
     variant === 'largeGradient' ||
     variant === 'success' ||
     variant === 'successGradient' ||
     variant === 'accent' ||
     variant === 'accentGradient') && { color: theme.text.inverse },
    variant === 'secondary' && { color: theme.text.primary },
    variant === 'ghost' && { color: colors.primary[500] },
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? colors.primary[500] : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text style={textStyleList}>{children}</Text>
      )}
    </>
  );

  // Render gradient button
  if (isGradient && gradientConfig) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        testID={testID}
        style={[containerStyle, (disabled || loading) && styles.disabled]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        <LinearGradient
          colors={gradientConfig.colors}
          start={gradientConfig.start}
          end={gradientConfig.end}
          style={styles.gradientInner}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Render solid color button
  return (
    <TouchableOpacity
      style={[containerStyle, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden', // Important for gradient clipping
  },
  fullWidth: {
    width: '100%',
  },

  // Gradient base styles
  gradientBase: {
    minHeight: touchTarget.min,
    ...shadows.md,
  },
  largeGradient: {
    borderRadius: borderRadius.lg,
    minHeight: 56,
    ...shadows.lg,
  },
  gradientInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: touchTarget.min,
  },

  // Solid color variants
  primary: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: touchTarget.min,
    ...shadows.md,
  },
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderWidth: 2,
    borderColor: colors.secondary[300],
    minHeight: touchTarget.min,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: touchTarget.min,
  },
  large: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.lg,
    minHeight: 56,
    ...shadows.lg,
  },
  success: {
    backgroundColor: colors.success[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: touchTarget.min,
    ...shadows.md,
  },
  accent: {
    backgroundColor: colors.accent[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: touchTarget.min,
    ...shadows.md,
  },

  // Sizes
  smallSize: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: touchTarget.min,
  },
  mediumSize: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: touchTarget.recommended,
  },
  largeSize: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    minHeight: 56,
  },

  // Text styles
  baseText: {
    ...textStyles.buttonMedium,
    textAlign: 'center',
  },
  smallText: {
    ...textStyles.buttonSmall,
  },
  mediumText: {
    ...textStyles.buttonMedium,
  },
  largeText: {
    ...textStyles.buttonLarge,
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
