/**
 * Typography Tokens
 * Based on Intensely Design System v1.0
 * Reference: /design.md
 */

import { Platform, TextStyle } from 'react-native';

// Font Families
// Note: SF Pro Rounded requires custom font installation
// Fallback to SF Pro Display/Text which are system fonts on iOS
export const fontFamilies = {
  // Cross-platform system fonts with SF Pro Rounded preference
  primary: Platform.select({
    ios: 'SF Pro Rounded', // Falls back to SF Pro Display if not installed
    android: 'Roboto',
    default: 'System',
  }),
  secondary: Platform.select({
    ios: 'SF Pro Rounded', // Falls back to SF Pro Text if not installed
    android: 'Roboto',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
    default: 'monospace',
  }),
} as const;

// Font Sizes
export const fontSize = {
  xs: 12,    // Captions, metadata
  sm: 14,    // Supporting text
  base: 16,  // Body text (default)
  lg: 18,    // Emphasized body
  xl: 20,    // Small headings
  '2xl': 24, // Section headings
  '3xl': 30, // Page titles
  '4xl': 36, // Large titles
  '5xl': 48, // Hero text
  '6xl': 60, // Timer
  '7xl': 72, // Timer primary
  '8xl': 96, // Timer fullscreen
} as const;

// Font Weights
export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const;

// Line Heights
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Typography Styles
export const textStyles: Record<string, TextStyle> = {
  // Headers
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  },

  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * lineHeight.normal,
  },

  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.normal,
  },

  // Body
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.normal,
  },

  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.lg * lineHeight.normal,
  },

  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  },

  // Special
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Timer displays
  timerLarge: {
    fontSize: fontSize['8xl'],
    fontWeight: fontWeight.black,
    lineHeight: fontSize['8xl'] * lineHeight.tight,
    fontFamily: fontFamilies.mono,
  },

  timerMedium: {
    fontSize: fontSize['7xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['7xl'] * lineHeight.tight,
    fontFamily: fontFamilies.mono,
  },

  timerSmall: {
    fontSize: fontSize['6xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['6xl'] * lineHeight.tight,
    fontFamily: fontFamilies.mono,
  },

  // Buttons
  buttonLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },

  buttonMedium: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },

  buttonSmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
} as const;

// Type exports
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;
export type TextStyles = typeof textStyles;
