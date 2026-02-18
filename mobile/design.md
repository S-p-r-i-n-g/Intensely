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

## 14. Mobile-Native Compliance & Architecture

These are **hard rules**. No exceptions without explicit sign-off. They exist to prevent a class of bugs — layout explosions, dark-mode blindness, notch clipping, mis-taps during movement — that are expensive to fix after the fact.

---

### Rule 1 — Design System Enforcement: No Raw Primitives

**Mandate:** Every piece of rendered text and every interactive element must use a component from `src/components/ui/`. Raw React Native primitives are banned from screen and component files.

| ❌ Banned | ✅ Required |
|-----------|------------|
| `import { Text } from 'react-native'` | `import { Text } from '../../components/ui'` |
| `import { TouchableOpacity } from 'react-native'` | `import { Button } from '../../components/ui'` |

**Why:** Raw primitives bypass the design system's theme binding, accessibility props (`accessibilityRole="button"`), and touch-target enforcement. Every use of a raw primitive is a future dark-mode or contrast bug waiting to be filed.

**Pattern:**
```typescript
// ❌ Never
import { Text, TouchableOpacity } from 'react-native';
<TouchableOpacity onPress={fn}>
  <Text style={{ color: '#000' }}>Press me</Text>
</TouchableOpacity>

// ✅ Always
import { Text, Button } from '../../components/ui';
<Button variant="primary" onPress={fn}>Press me</Button>
```

---

### Rule 2 — Accessibility & Touch Targets: Spacing for Motion

**Mandate:** All interactive elements must meet a minimum touch target of **44×44pt** (iOS HIG / WCAG AAA). In screens that are used during physical activity (any workout execution screen), interactive controls must be separated by a minimum gap of **`spacing[5]` (20px)**, with high-risk destructive actions (Quit, Delete) requiring **`spacing[6]` (24px)**.

```typescript
import { spacing, touchTarget } from '../../tokens';

// Minimum touch target — enforced by ui/Button automatically.
// If building a custom tappable, enforce manually:
style={{ minHeight: touchTarget.min }}    // 44pt
style={{ minHeight: touchTarget.recommended }} // 48pt — preferred for primary CTAs

// Control row gap during active workout (prevents mis-taps while moving):
<View style={{ flexDirection: 'row', gap: spacing[5] }}>  // 20px minimum
  <Button variant="secondary" style={{ flex: 1 }}>← Previous</Button>
  <Button variant="primary"   style={{ flex: 1.5 }}>⏸ Pause</Button>
  <Button variant="secondary" style={{ flex: 1 }}>Skip →</Button>
</View>
```

**Reference spacing values:**

| Token | Value | Use case |
|-------|-------|----------|
| `spacing[3]` | 12px | Static UI, no risk of mis-tap |
| `spacing[4]` | 16px | Standard interactive lists |
| `spacing[5]` | 20px | **Minimum for active-workout controls** |
| `spacing[6]` | 24px | High-risk actions adjacent to safe actions |

---

### Rule 3 — Typography & Font Scaling: Cap Oversized Text

**Mandate:** Any `Text` element with an effective rendered size **≥ 48px** must include `maxFontSizeMultiplier={1.2}`. This prevents iOS/Android Dynamic Type from expanding display-scale text (timers, hero numbers) into elements that overflow their containers or obscure adjacent UI.

```typescript
import { Text } from '../../components/ui';

// Timer, score, or any display-scale number:
<Text
  style={styles.timerText}          // fontSize: 96
  maxFontSizeMultiplier={1.2}        // cap at 115px — never larger
>
  {formatTime(timeRemaining)}
</Text>

// Standard body text — no cap needed; the system handles it gracefully:
<Text variant="body" color="secondary">
  {exercise.instructions}
</Text>
```

**Threshold table:**

| Rendered size | `maxFontSizeMultiplier` |
|---------------|------------------------|
| < 48px | Not required |
| 48–72px | `1.3` |
| > 72px | `1.2` |

---

### Rule 4 — Safe Area & Layout: Use `react-native-safe-area-context`

**Mandate:** `SafeAreaView` must **always** be imported from `react-native-safe-area-context`. The built-in `SafeAreaView` from `react-native` does not correctly handle dynamic islands, punch-hole cameras, or Android gesture-navigation bars on modern OS versions.

```typescript
// ❌ Never
import { SafeAreaView } from 'react-native';

// ✅ Always
import { SafeAreaView } from 'react-native-safe-area-context';
```

`react-native-safe-area-context` is already installed as a peer dependency of React Navigation and requires no additional setup.

---

### Rule 5 — Responsive Viewports: `useWindowDimensions` over `Dimensions.get`

**Mandate:** Never read the window dimensions at module scope via `Dimensions.get('window')`. Dimensions must be read inside the component using the `useWindowDimensions()` hook so that the value reactively updates on rotation, split-screen, and foldable transitions.

```typescript
// ❌ Never — stale value, captured once at import time:
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

// ✅ Always — live value, re-renders component on change:
import { useWindowDimensions } from 'react-native';

function MyComponent() {
  const { width, height } = useWindowDimensions();
  // ...
}
```

**Corollary:** `Dimensions` from `react-native` may still be used for one-time setup values outside of components (e.g., in `StyleSheet.create` constants that are intentionally fixed). The restriction applies specifically to layout calculations used in render output.
