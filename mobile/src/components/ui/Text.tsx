/**
 * Text Component
 * Styled text component using design system typography
 * Based on Intensely Design System v1.0
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { textStyles as designTextStyles } from '../../tokens';
import { useTheme } from '../../theme/ThemeContext';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'buttonLarge'
  | 'buttonMedium'
  | 'buttonSmall';

export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const textColor = {
    primary: theme.text.primary,
    secondary: theme.text.secondary,
    tertiary: theme.text.tertiary,
    inverse: theme.text.inverse,
  }[color];

  const textStyle = [
    designTextStyles[variant],
    { color: textColor },
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

export default Text;
