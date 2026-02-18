# Intensely - Design System
**Version 1.4 | Last Updated: 2026-02-18**

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

### Timer Colors (High Contrast)

```javascript
export const timerColors = {
  active: '#00FF00',      // Bright green for exercise intervals
  rest: '#FFD700',        // Gold for rest periods
  ready: '#FF6600',       // Orange for get-ready countdown
  paused: '#94A3B8',      // Muted for paused state
  background: '#000000',  // Pure black for timer screen
};
```

---

## 2. Typography

### Font Families

```javascript
// tokens/typography.js
export const fontFamilies = {
  ios: {
    primary: 'SF Pro Display',
    secondary: 'SF Pro Text',
    mono: 'SF Mono',
  },
  android: {
    primary: 'Roboto',
    secondary: 'Roboto',
    mono: 'Roboto Mono',
  },
};
```

### Type Scale

```javascript
export const fontSize = {
  xs: 12,    // Captions, metadata
  sm: 14,    // Supporting text
  base: 16,  // Body text (default)
  lg: 18,    // Emphasized body
  xl: 20,    // Small headings
  '2xl': 24, // Section headings
  '3xl': 30, // Page titles
  '4xl': 36, // Large titles
  '6xl': 60, // Timer
  '7xl': 72, // Timer primary
  '8xl': 96, // Timer fullscreen
};
```

---

## 3. Spacing System

4px base scale for consistent rhythm and alignment.

```javascript
export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48, 16: 64,
};
```

---

## 4. Component Library

### Buttons

```javascript
// components/Button.styles.js
export const buttonStyles = {
  primary: {
    container: {
      backgroundColor: colors.primary[500],
      borderRadius: 12,
      minHeight: 48, 
    },
    text: { color: '#FFFFFF' },
  },
};
```

---

## 5. Layout & Grid

- **Screen Layout**: `padding: layout.screenPadding` (16px).
- **Grid System**: Two-column layout with `gap: spacing[3]` (12px).

---

## 6. Motion & Animation

- **Transitions**: 300ms ease-out for screens.
- **Interactions**: 100ms scale bounce for buttons.

---

## 7. Iconography

- **Library**: `@expo/vector-icons` (Ionicons).
- **Sizes**: 16px (xs), 24px (md), 32px (lg).

---

## 8. State Feedback

- **Loading**: Use `ActivityIndicator` with `colors.primary[500]`.
- **Empty States**: High-contrast title with secondary supportive text.

---

## 9. Accessibility Baseline

- **Contrast**: Minimum 4.5:1 ratio for all text.
- **Touch Targets**: Minimum 44x44pt (iOS HIG).

---

## 10. Workout-Specific Design Patterns

### Workout Mode Screen
- Immersive fullscreen timer with black background.
- Bold exercise names (36px+) and primary action buttons within thumb zones.

---

## 11. Summary & Metric Components (Universal Design)

### Metric Chips
Used in collapsed cards to show workout parameters at a glance.

- **Visual Principles**: High-contrast, monochromatic design. Categorization is handled by grouping, never by color-coded borders alone.
- **Structure**: Rounded rectangles with `borderWidth: 1` using `theme.border.strong`.
- **Background**: Uses `theme.background.tertiary`.
- **Typography Hierarchy**:
  - **Value**: Bold (Weight 700) and `text.primary` color.
  - **Label**: Regular (Weight 400) and `text.secondary` color.
- **Grouping**: Clusters (e.g., Structure vs. Timing) are separated by `spacing[4]` and vertical dividers.

---

## 12. Accessibility Guidelines

### Universal Design Rules
- **Color Blindness**: Avoid red-green color coding for critical status. Use explicit text labels and distinct grouping.
- **Contrast**: Maintain a minimum **4.5:1 ratio** for all text, including inactive states (e.g., unselected tabs).
- **Touch Targets**: Minimum **44x44pt** (iOS HIG) and recommended **48x48pt**.

---

## 13. Difficulty Inference Engine

### Purpose
Automatically infer workout difficulty based on volume, intensity, and exercise selection to provide consistent user feedback across all screens.

### Formula

```
Final Score = Volume Score × Intensity Multiplier × Exercise Multiplier
```

#### Components

1. **Volume Score**: Measures workout load
   ```
   Volume Score = (Total Exercises × Circuits × Sets) / 10
   ```

2. **Intensity Multiplier**: Measures work-to-rest ratio
   ```
   Intensity Multiplier = Work Interval / Rest Interval
   ```
   - Higher ratio = harder workout (less rest relative to work)

3. **Exercise Multiplier**: Average inherent difficulty of selected exercises
   ```
   Exercise Multiplier = Average of exercise difficulty values (1-3 scale)
   ```
   - Beginner exercises = 1
   - Intermediate exercises = 2
   - Advanced exercises = 3
   - Default (no exercises): 1.5

### Difficulty Categories & Colors

| Level        | Score Range | Color Token    | Hex       |
|--------------|-------------|----------------|-----------|
| Beginner     | < 5         | success.500    | #15803D   |
| Intermediate | 5 - 12      | accent.500     | #1D4ED8   |
| Advanced     | > 12        | primary.500    | #D92D20   |

### Implementation Notes
- Display difficulty badge with **both label and color** (Universal Design compliance)
- Update in real-time as user modifies workout settings
- Persist calculated difficulty when saving workout
- Use consistent colors across Builder, Preview, and List screens

---

## 14. Cross-Platform UI/UX Compliance

This project has a **dual-platform architecture**. Unless a task explicitly restricts scope to one platform, all UI/UX changes must be assessed and applied to both:

| Codebase | Platform | Stack |
|----------|----------|-------|
| `mobile/src/` | iOS & Android | React Native / Expo |
| `src/` | Web browser | React Web |

Rules in this section are delineated by platform where they differ, and marked **Both** where they are identical requirements.

---

### Rule 1 — Design System Enforcement: No Raw Primitives *(Both)*

Every piece of rendered text and every interactive element must use a component from the codebase's `components/ui/` directory. Raw primitives — whether HTML or React Native — are banned from screen and component files.

**Mobile (`mobile/src/`):**
```typescript
// ❌ Never
import { Text, TouchableOpacity } from 'react-native';

// ✅ Always
import { Text, Button } from '../../components/ui';
```

**Web (`src/`):**
```tsx
// ❌ Never
<button onClick={fn}><p>Press me</p></button>

// ✅ Always
import { Text, Button } from '../../components/ui';
<Button variant="primary" onPress={fn}>Press me</Button>
```

**Why:** Raw primitives bypass the design system's theme binding, dark-mode colour roles, and accessibility role annotations. Every raw primitive is a future contrast or UX regression waiting to be filed.

---

### Rule 2 — Accessibility & Touch Targets: Spacing for Motion *(Both)*

All interactive elements must meet a minimum touch target of **44×44px/pt**. In screens used during physical activity, interactive controls must be separated by a minimum gap equivalent to `spacing[5]` (20px). High-risk/destructive actions adjacent to a primary action require `spacing[6]` (24px).

**Mobile tokens:**
```typescript
import { spacing, touchTarget } from '../../tokens';
style={{ minHeight: touchTarget.min }}        // 44pt
style={{ minHeight: touchTarget.recommended }} // 48pt — primary CTAs
```

**Web CSS:**
```css
.button { min-height: 44px; min-width: 44px; }
.controls { display: flex; gap: 20px; }      /* spacing[5] equivalent */
.high-risk-row { gap: 24px; }               /* spacing[6] equivalent */
```

| Value | Mobile token | Web equivalent | Context |
|-------|-------------|----------------|---------|
| 12px | `spacing[3]` | `gap: 0.75rem` | Static UI |
| 16px | `spacing[4]` | `gap: 1rem` | Standard interactive |
| 20px | `spacing[5]` | `gap: 1.25rem` | **Active-workout controls minimum** |
| 24px | `spacing[6]` | `gap: 1.5rem` | High-risk adjacent actions |

---

### Rule 3 — Typography & Font Scaling

**Mobile (`mobile/src/`):** Any `Text` element with a rendered size ≥ 48px must include `maxFontSizeMultiplier` to prevent iOS Dynamic Type and Android font-scale settings from overflowing display-scale numbers.

| Rendered size | Required prop |
|---------------|---------------|
| < 48px | Not required |
| 48–72px | `maxFontSizeMultiplier={1.3}` |
| > 72px | `maxFontSizeMultiplier={1.2}` |

```typescript
// 96px workout timer:
<Text style={styles.timerText} maxFontSizeMultiplier={1.2}>
  {formatTime(timeRemaining)}
</Text>
```

**Web (`src/`):** All font sizes must use `rem` units (not `px`) so that browser zoom and user font-size preferences are respected. Display-scale text (timers, hero numbers) must use `clamp()` to remain readable without breaking the layout at 200% browser zoom.

```css
/* ❌ Fixed — breaks at browser zoom */
.timer { font-size: 96px; }

/* ✅ Fluid — scales with user preferences */
.timer { font-size: clamp(3rem, 10vw, 6rem); }
```

---

### Rule 4 — Safe Area & Responsive Layout

**Mobile (`mobile/src/`):** `SafeAreaView` must always come from `react-native-safe-area-context` (not the built-in `react-native` version) to correctly handle Dynamic Island, punch-hole cameras, and Android gesture-navigation bars.

```typescript
// ✅ Mobile only
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Web (`src/`):** Use CSS Flexbox and Grid for all layouts. Apply `@media` queries for breakpoint-responsive behaviour. Never hardcode pixel widths for containers — use `max-width` with `width: 100%` or grid `fr` units instead.

```css
/* ❌ Hardcoded — breaks on small screens */
.modal { width: 400px; }

/* ✅ Responsive */
.modal { width: min(90vw, 400px); }
```

---

### Rule 5 — Responsive Viewports

**Mobile (`mobile/src/`):** Never read layout dimensions at module scope via `Dimensions.get('window')`. Use the `useWindowDimensions()` hook inside the component so that values update on rotation and split-screen.

```typescript
// ✅ Mobile
import { useWindowDimensions } from 'react-native';
const { width } = useWindowDimensions();
```

**Web (`src/`):** Never hardcode viewport-derived pixel values in JavaScript. Use CSS `vw`/`vh` units, `@media` queries, or the `ResizeObserver` API for element-level responsive behaviour. Avoid `window.innerWidth` in render logic.

```css
/* ✅ Web — let CSS handle the viewport */
.drawer { width: 75vw; max-width: 320px; }
```

---

### Parity Checklist

Any compliance rule applied to one platform's screen must be evaluated for parity on the other. Minimum requirements for each `WorkoutExecutionScreen`:

| Requirement | Mobile (`mobile/src/`) | Web (`src/`) |
|-------------|----------------------|-------------|
| Design system `Text` | ✅ | ✅ |
| Design system `Button` | ✅ | ✅ |
| `SkeletonLoader` for fetch state | ✅ | ✅ |
| Oversized text scaling guard | `maxFontSizeMultiplier={1.2}` | `clamp()` / `rem` units |
| Safe area handling | `react-native-safe-area-context` | CSS `env(safe-area-inset-*)` |
| Responsive layout | `useWindowDimensions()` | CSS Flexbox / `@media` |
| Control row gap | `gap: spacing[5]` (20px) | `gap: 1.25rem` |
| Profile in drawer | ✅ | ✅ |
