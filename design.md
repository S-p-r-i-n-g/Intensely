# Intensely - Design System
**Version 1.2 | Last Updated: 2026-01-27**

## Design Philosophy

**Intensely** embodies a minimalist, high-performance design approach that prioritizes:
- **Zero Friction**: Users should reach their workout in seconds, not minutes.
- **Clarity During Motion**: High contrast, large text, and clear CTAs for active workouts.
- **Progressive Disclosure**: Simple by default, powerful when needed.
- **Mobile-First**: Optimized for thumb zones, one-handed use, and outdoor readability.
- **Universal Accessibility**: Design for everyone. Information must never be conveyed by color alone (essential for color-blind users).

---

## 1. Color System (Accessibility Optimized)

### Primary Palette

```javascript
// src/tokens/colors.ts
export const colors = {
  // Primary - Energetic red for action
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

  // Error - Red for errors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#B91C1C', // WCAG AA compliant (5.52:1)
    700: '#B91C1C',
  },
};
```

### Semantic Colors (Light Mode)

```javascript
export const lightMode = {
  background: {
    primary: '#F8FAFC',    // Soft white to reduce eye strain
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',   // Pure white for elevated elements
  },

  text: {
    primary: '#0F172A',      // Body text (15.98:1 contrast)
    secondary: '#475569',    // Supporting text (6.25:1 contrast)
    tertiary: '#526073',     // Placeholders - WCAG AA compliant (5.20:1)
    inverse: '#FFFFFF',      // Text on dark backgrounds
  },

  border: {
    light: '#F1F5F9',
    medium: '#E2E8F0',
    strong: '#CBD5E1',
  },
};
```

### Gradients (Premium Elements)

Linear gradients are used for primary CTAs and success states to provide depth.
- **Primary**: `#F97066` → `#D92D20` (Top-left to bottom-right)
- **Success**: `#15803D` → `#15803D` (Tonal variation)
- **Accent**: `#1D4ED8` → `#1D4ED8` (Tonal variation)

---

## 2. Typography

### Type Scale & Hierarchy

- **H1 (36px, Bold)**: Main page titles.
- **H2 (30px, Bold)**: Section headers.
- **H3 (24px, Semibold)**: Card titles.
- **Body (16px, Regular)**: Default content.
- **Caption (12px, Regular)**: Metadata, uppercase with 0.5 letter spacing.

---

## 3. Spacing System

4px base scale for consistent rhythm and alignment.

```javascript
export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48, 16: 64,
};
```

---

## 11. Summary & Metric Components (Universal Design)

### Metric Chips
Used in collapsed cards (Settings, Circuit Exercises) to show workout parameters without requiring expansion.

- **Visual Principles**: High-contrast, monochromatic design. Categorization is handled by grouping, never by color alone.
- **Structure**: Rounded rectangles with `borderWidth: 1` using `theme.border.strong`.
- **Background**: Uses `theme.background.tertiary` to create a subtle inset effect.
- **Typography Hierarchy**:
  - **Value**: Bold (Weight 700) and primary text color.
  - **Label**: Regular (Weight 400) and secondary text color.
- **Grouping**: Logical clusters (e.g., Structure vs. Timing) are separated by `spacing[4]` and vertical dividers to avoid confusion for color-blind users.

### Example Layout
`[ 3 CIRCUITS ] [ 3 SETS ]`  |  `[ 30s WORK ] [ 60s REST ]`

---

## 12. Accessibility Guidelines

### Universal Design Rules
- **Color Blindness**: Avoid red-green color coding for critical status or categorization. Use explicit text labels and distinct grouping.
- **Contrast**: Maintain a minimum **4.5:1 ratio** for all text, including inactive states (e.g., unselected tabs).
- **Touch Targets**: Minimum **44x44pt** (iOS HIG) and recommended **48x48pt** for primary actions.
- **Motion**: Support "Reduce Motion" system settings by using `useNativeDriver` and controlled animation durations.
