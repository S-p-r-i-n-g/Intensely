/**
 * Input Component
 * Text input component using design system tokens
 * Based on Intensely Design System v1.0
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { spacing, borderRadius, fontSize, touchTarget } from '../../tokens';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from './Text';
import { colors } from '../../tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.background.secondary,
      borderColor: error ? colors.error[500] : isFocused ? colors.primary[500] : theme.border.medium,
      color: theme.text.primary,
    },
    error && styles.inputError,
    isFocused && styles.inputFocused,
    style,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="bodySmall" color="secondary" style={styles.label}>
          {label}
        </Text>
      )}

      <TextInput
        style={inputStyle}
        placeholderTextColor={theme.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />

      {error && (
        <Text variant="bodySmall" style={styles.errorText}>
          {error}
        </Text>
      )}

      {!error && helperText && (
        <Text variant="bodySmall" color="tertiary" style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: spacing[2],
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: fontSize.base,
    minHeight: touchTarget.recommended,
  },
  inputFocused: {
    borderWidth: 2,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    color: colors.error[500],
    marginTop: spacing[1],
  },
  helperText: {
    marginTop: spacing[1],
  },
});

export default Input;
