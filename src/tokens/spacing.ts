/**
 * Spacing Tokens
 * Based on Intensely Design System v1.0
 * 4px base scale for consistent rhythm and alignment
 * Reference: /design.md
 */

// Base Spacing Scale (4px base)
export const spacing = {
  0: 0,
  1: 4,    // 0.25rem
  2: 8,    // 0.5rem
  3: 12,   // 0.75rem
  4: 16,   // 1rem (base)
  5: 20,   // 1.25rem
  6: 24,   // 1.5rem
  8: 32,   // 2rem
  10: 40,  // 2.5rem
  12: 48,  // 3rem
  16: 64,  // 4rem
  20: 80,  // 5rem
  24: 96,  // 6rem
} as const;

// Semantic Spacing
export const layout = {
  screenPadding: spacing[4],      // 16px edges
  screenPaddingHorizontal: spacing[4],
  screenPaddingVertical: spacing[4],
  sectionGap: spacing[6],         // 24px between sections
  cardPadding: spacing[4],        // 16px card inner padding
  cardGap: spacing[3],            // 12px between cards
  buttonPaddingY: spacing[3],     // 12px top/bottom
  buttonPaddingX: spacing[6],     // 24px left/right
  inputPaddingY: spacing[3],      // 12px top/bottom
  inputPaddingX: spacing[4],      // 16px left/right
  iconGap: spacing[2],            // 8px gap for icon + text
  listItemGap: spacing[3],        // 12px between list items
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Minimum Touch Target (Accessibility)
export const touchTarget = {
  min: 44,    // Minimum for iOS HIG / WCAG AAA
  recommended: 48, // Recommended for primary actions
} as const;

// Type exports
export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type BorderRadius = typeof borderRadius;
export type TouchTarget = typeof touchTarget;
