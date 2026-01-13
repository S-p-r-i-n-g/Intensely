/**
 * Shadow System (P3 Enhancement)
 * Dynamic Slate-based shadows instead of pure black
 * Based on Gemini 3 Flash Preview recommendations
 */

import { Platform } from 'react-native';
import { colors } from './colors';

/**
 * Convert hex color to rgba for shadow opacity
 */
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Dynamic shadow system using Slate 900 (#0F172A) with opacity
 * Provides organic, theme-aware shadows instead of harsh black
 */
export const shadows = {
  // Small shadow for subtle elevation
  sm: Platform.select({
    ios: {
      shadowColor: colors.secondary[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),

  // Medium shadow for cards
  md: Platform.select({
    ios: {
      shadowColor: colors.secondary[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),

  // Large shadow for modals and elevated content
  lg: Platform.select({
    ios: {
      shadowColor: colors.secondary[900],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  }),

  // Extra large shadow for floating action buttons
  xl: Platform.select({
    ios: {
      shadowColor: colors.secondary[900],
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
  }),

  // Neumorphic shadow (soft, double shadow effect)
  neu: Platform.select({
    ios: {
      shadowColor: colors.secondary[900],
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 40,
    },
    android: {
      elevation: 3,
    },
  }),
} as const;

/**
 * Custom shadow generator with configurable Slate opacity
 */
export const createSlateShadow = (
  offsetY: number,
  opacity: number,
  radius: number,
  elevation?: number
) => {
  return Platform.select({
    ios: {
      shadowColor: colors.secondary[900],
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: elevation || Math.round(offsetY / 2),
    },
  });
};

// Type exports
export type Shadows = typeof shadows;
