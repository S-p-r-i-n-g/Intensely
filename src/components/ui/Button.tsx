import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, textStyles, touchTarget } from '../../tokens';
import { useTheme } from '../../theme/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'large';
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
  const { theme } = useTheme();

  const buttonStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    variant === 'large' && styles.large,
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyleList = [
    styles.baseText,
    variant === 'primary' && { color: theme.text.inverse },
    variant === 'secondary' && { color: theme.text.primary },
    variant === 'ghost' && { color: colors.primary[500] },
    variant === 'large' && { color: theme.text.inverse },
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
          color={variant === 'primary' || variant === 'large' ? '#FFFFFF' : colors.primary[500]}
          size="small"
        />
      ) : (
        <Text style={textStyleList}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  // Variants
  primary: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    minHeight: touchTarget.min,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
