/**
 * Color Tokens
 * Based on Intensely Design System v1.0
 * Reference: /design.md
 */

export const colors = {
  // Primary - Energetic coral/red for action
  primary: {
    50: '#FFE8E8',
    100: '#FFCCCC',
    200: '#FF9999',
    300: '#FF6666',
    400: '#F97066',
    500: '#D92D20', // Main brand color - WCAG AA compliant (4.54:1)
    600: '#B91C1C',
    700: '#990000',
    800: '#660000',
    900: '#330000',
  },

  // Secondary - Cool slate for balance
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Accent - Electric blue for focus states
  accent: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#1D4ED8', // Main accent - WCAG AA compliant (4.79:1)
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Success - Green for completion
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#15803D', // WCAG AA compliant (4.88:1)
    700: '#15803D',
  },

  // Warning - Amber for caution
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    700: '#B45309',
  },

  // Error - Red for errors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#B91C1C', // WCAG AA compliant (5.52:1)
    700: '#B91C1C',
  },
} as const;

// Semantic Colors (Light Mode)
export const lightMode = {
  // Backgrounds
  background: {
    primary: '#F8FAFC',    // Soft white to reduce eye strain
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',   // Pure white for elevated elements (cards, modals)
  },

  // Text
  text: {
    primary: '#0F172A',      // Body text
    secondary: '#475569',    // Supporting text
    tertiary: '#526073',     // Disabled, placeholders - WCAG AA compliant (5.20:1)
    inverse: '#FFFFFF',      // Text on dark backgrounds
  },

  // Borders
  border: {
    light: '#F1F5F9',
    medium: '#E2E8F0',
    strong: '#CBD5E1',
  },

  // Interactive
  interactive: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryPressed: colors.primary[700],
    secondary: colors.secondary[100],
    secondaryHover: colors.secondary[200],
  },
} as const;

// Semantic Colors (Dark Mode)
export const darkMode = {
  // Backgrounds
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
    elevated: '#1E293B', // Cards, modals
  },

  // Text
  text: {
    primary: '#F1F5F9',    // Slightly softer white for reduced eye strain
    secondary: '#CBD5E1',
    tertiary: '#64748B',
    inverse: '#0F172A',
  },

  // Borders
  border: {
    light: '#1E293B',
    medium: '#334155',
    strong: '#475569',
  },

  // Interactive
  interactive: {
    primary: colors.primary[500],
    primaryHover: colors.primary[400],
    primaryPressed: colors.primary[300],
    secondary: colors.secondary[800],
    secondaryHover: colors.secondary[700],
  },
} as const;

// Timer Colors (High Contrast)
export const timerColors = {
  active: '#00FF00',      // Bright green for exercise intervals
  rest: '#FFD700',        // Gold for rest periods
  ready: '#FF6600',       // Orange for get-ready countdown
  paused: '#94A3B8',      // Muted for paused state
  background: '#000000',  // Pure black for timer screen
} as const;

// Gradient Definitions (P3 Enhancement)
// Linear gradients for premium button styling
export const gradients = {
  // Primary gradient: Top-left to bottom-right (Gemini 3 recommendation)
  primary: {
    colors: [colors.primary[400], colors.primary[500]],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Success gradient for completion states
  success: {
    colors: [colors.success[500], colors.success[700]],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Accent gradient for focus states
  accent: {
    colors: [colors.accent[500], colors.accent[700]],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Slate gradient for subtle backgrounds
  slate: {
    colors: [colors.secondary[50], colors.secondary[100]],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// Type exports for TypeScript
export type ColorPalette = typeof colors;
export type LightModeColors = typeof lightMode;
export type DarkModeColors = typeof darkMode;
export type TimerColors = typeof timerColors;
export type Gradients = typeof gradients;
