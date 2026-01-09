/**
 * Design Tokens
 * Centralized design system tokens for the Intensely HICT Workout App
 * Based on UX improvement plan recommendations
 */

export const designTokens = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      main: '#FF6B35',
      dark: '#E55A2B',
      light: '#FF8C5A',
      lightest: '#FFF5F2',
    },

    // Semantic Colors
    semantic: {
      success: '#10B981',
      successLight: '#D1FAE5',
      warning: '#F59E0B',
      warningLight: '#FEF3C7',
      error: '#EF4444',
      errorLight: '#FEE2E2',
      info: '#3B82F6',
      infoLight: '#DBEAFE',
    },

    // Neutral Colors
    neutral: {
      background: '#FAFAFA',
      surface: '#FFFFFF',
      surfaceVariant: '#F5F5F5',
      outline: '#E5E5E5',
      outlineVariant: '#CCCCCC',
    },

    // Text Colors
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      disabled: '#D1D5DB',
      inverse: '#FFFFFF',
      onPrimary: '#FFFFFF',
    },

    // Workout State Colors
    workout: {
      work: '#FF6B35',      // Active work interval
      rest: '#10B981',      // Rest interval
      circuitRest: '#3B82F6', // Circuit rest interval
      paused: '#6B7280',    // Paused state
    },
  },

  // Typography
  typography: {
    // Headings
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      letterSpacing: 0,
    },

    // Body Text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 27,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 21,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },

    // Special
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    timer: {
      fontSize: 72,
      fontWeight: '700' as const,
      lineHeight: 86,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
  },

  // Spacing (8px grid system)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999, // Full circle
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Animation Durations (ms)
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Breakpoints (for responsive design)
  breakpoints: {
    sm: 375,
    md: 768,
    lg: 1024,
  },

  // Touch Targets (minimum 44pt for accessibility)
  touchTargets: {
    min: 44,
    recommended: 48,
    comfortable: 56,
  },
};

/**
 * Helper function to get spacing value
 */
export const getSpacing = (multiplier: number = 1): number => {
  return designTokens.spacing.sm * multiplier;
};

/**
 * Helper function to get color with opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Common style presets for quick use
 */
export const commonStyles = {
  // Cards
  card: {
    backgroundColor: designTokens.colors.neutral.surface,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.spacing.md,
    ...designTokens.shadows.md,
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: designTokens.colors.primary.main,
    borderRadius: designTokens.borderRadius.md,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    minHeight: designTokens.touchTargets.recommended,
  },
  buttonSecondary: {
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
    borderRadius: designTokens.borderRadius.md,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    minHeight: designTokens.touchTargets.recommended,
    borderWidth: 1,
    borderColor: designTokens.colors.neutral.outline,
  },

  // Text Inputs
  input: {
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.spacing.md,
    borderWidth: 1,
    borderColor: designTokens.colors.neutral.outline,
    minHeight: designTokens.touchTargets.recommended,
  },

  // Sections
  section: {
    padding: designTokens.spacing.md,
  },
  sectionHeader: {
    marginBottom: designTokens.spacing.md,
  },
};

export default designTokens;
