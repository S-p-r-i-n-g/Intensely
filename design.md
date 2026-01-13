# Intensely - Design System
**Version 1.0 | Last Updated: 2026-01-12**

## Design Philosophy

**Intensely** embodies a minimalist, high-performance design approach that prioritizes:
- **Zero Friction**: Users should reach their workout in seconds, not minutes
- **Clarity During Motion**: High contrast, large text, and clear CTAs for active workouts
- **Progressive Disclosure**: Simple by default, powerful when needed
- **Mobile-First**: Optimized for thumb zones, one-handed use, and outdoor readability
- **Motivating, Not Overwhelming**: Clean interfaces that inspire action

---

## 1. Color System

### Primary Palette

```javascript
// tokens/colors.js
export const colors = {
  // Primary - Energetic coral/red for action
  primary: {
    50: '#FFE8E8',
    100: '#FFCCCC',
    200: '#FF9999',
    300: '#FF6666',
    400: '#FF3333',
    500: '#FF0000', // Main brand color
    600: '#CC0000',
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
    500: '#3B82F6', // Main accent
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Success - Green for completion
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
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
    500: '#EF4444',
    700: '#B91C1C',
  },
};
```

### Semantic Colors (Light Mode)

```javascript
export const lightMode = {
  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF', // Cards, modals
  },

  // Text
  text: {
    primary: '#0F172A',      // Body text
    secondary: '#475569',    // Supporting text
    tertiary: '#94A3B8',     // Disabled, placeholders
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
};
```

### Semantic Colors (Dark Mode)

```javascript
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
    primary: '#F8FAFC',
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
  // iOS defaults
  ios: {
    primary: 'SF Pro Display',
    secondary: 'SF Pro Text',
    mono: 'SF Mono',
  },

  // Android defaults
  android: {
    primary: 'Roboto',
    secondary: 'Roboto',
    mono: 'Roboto Mono',
  },

  // Cross-platform system fonts
  system: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
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
  '5xl': 48, // Hero text
  '6xl': 60, // Extra large (timer)
  '7xl': 72, // Timer primary
  '8xl': 96, // Timer fullscreen
};

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};
```

### Typography Components

```javascript
// Example React Native styles
export const textStyles = {
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
    fontFamily: Platform.select({ ios: 'SF Mono', android: 'Roboto Mono' }),
  },

  timerMedium: {
    fontSize: fontSize['7xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['7xl'] * lineHeight.tight,
    fontFamily: Platform.select({ ios: 'SF Mono', android: 'Roboto Mono' }),
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
};
```

---

## 3. Spacing System

4px base scale for consistent rhythm and alignment.

```javascript
// tokens/spacing.js
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
};

// Semantic spacing
export const layout = {
  screenPadding: spacing[4],      // 16px edges
  sectionGap: spacing[6],         // 24px between sections
  cardPadding: spacing[4],        // 16px card inner padding
  cardGap: spacing[3],            // 12px between cards
  buttonPaddingY: spacing[3],     // 12px top/bottom
  buttonPaddingX: spacing[6],     // 24px left/right
  inputPaddingY: spacing[3],      // 12px top/bottom
  inputPaddingX: spacing[4],      // 16px left/right
};
```

---

## 4. Component Library

### Buttons

```javascript
// components/Button.styles.js
export const buttonStyles = {
  // Primary Button (Call to Action)
  primary: {
    container: {
      backgroundColor: colors.primary[500],
      paddingVertical: layout.buttonPaddingY,
      paddingHorizontal: layout.buttonPaddingX,
      borderRadius: 12,
      minHeight: 48, // Accessibility touch target
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      ...textStyles.buttonMedium,
      color: '#FFFFFF',
    },
    // States
    pressed: {
      backgroundColor: colors.primary[700],
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      backgroundColor: colors.secondary[200],
      opacity: 0.5,
    },
  },

  // Secondary Button
  secondary: {
    container: {
      backgroundColor: 'transparent',
      paddingVertical: layout.buttonPaddingY,
      paddingHorizontal: layout.buttonPaddingX,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.secondary[300],
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      ...textStyles.buttonMedium,
      color: colors.secondary[700],
    },
  },

  // Ghost Button (Minimal)
  ghost: {
    container: {
      backgroundColor: 'transparent',
      paddingVertical: layout.buttonPaddingY,
      paddingHorizontal: layout.buttonPaddingX,
      borderRadius: 12,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      ...textStyles.buttonMedium,
      color: colors.primary[500],
    },
  },

  // Large Button (Start Workout)
  large: {
    container: {
      backgroundColor: colors.primary[500],
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[8],
      borderRadius: 16,
      minHeight: 56,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    text: {
      ...textStyles.buttonLarge,
      color: '#FFFFFF',
    },
  },
};
```

### Cards

```javascript
// components/Card.styles.js
export const cardStyles = {
  // Standard Card
  default: {
    backgroundColor: lightMode.background.elevated,
    borderRadius: 16,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Exercise Card (browsing)
  exercise: {
    backgroundColor: lightMode.background.elevated,
    borderRadius: 12,
    padding: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },

  // Workout Card (library)
  workout: {
    backgroundColor: lightMode.background.elevated,
    borderRadius: 16,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },

  // Active/Selected Card
  active: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    shadowColor: colors.primary[500],
    shadowOpacity: 0.2,
  },
};
```

### Inputs

```javascript
// components/Input.styles.js
export const inputStyles = {
  container: {
    width: '100%',
  },

  label: {
    ...textStyles.bodySmall,
    color: lightMode.text.secondary,
    marginBottom: spacing[2],
    fontWeight: fontWeight.medium,
  },

  input: {
    backgroundColor: lightMode.background.secondary,
    borderWidth: 1,
    borderColor: lightMode.border.medium,
    borderRadius: 12,
    paddingVertical: layout.inputPaddingY,
    paddingHorizontal: layout.inputPaddingX,
    fontSize: fontSize.base,
    color: lightMode.text.primary,
    minHeight: 48,
  },

  // States
  focused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  error: {
    borderColor: colors.error[500],
    borderWidth: 2,
  },

  disabled: {
    backgroundColor: lightMode.background.tertiary,
    opacity: 0.6,
  },

  errorText: {
    ...textStyles.bodySmall,
    color: colors.error[500],
    marginTop: spacing[1],
  },
};
```

### Modals

```javascript
// components/Modal.styles.js
export const modalStyles = {
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Bottom sheet style
  },

  container: {
    backgroundColor: lightMode.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing[6],
    maxHeight: '90%',
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: lightMode.border.strong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing[4],
  },

  title: {
    ...textStyles.h3,
    color: lightMode.text.primary,
    marginBottom: spacing[4],
  },

  content: {
    marginBottom: spacing[6],
  },

  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'flex-end',
  },
};
```

### Timer Display

```javascript
// components/Timer.styles.js
export const timerStyles = {
  // Full screen timer
  fullscreen: {
    container: {
      flex: 1,
      backgroundColor: timerColors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
    },

    countdown: {
      ...textStyles.timerLarge,
      color: timerColors.active,
      textAlign: 'center',
    },

    label: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.medium,
      color: lightMode.text.secondary,
      marginTop: spacing[4],
      textAlign: 'center',
    },

    exercise: {
      fontSize: fontSize['3xl'],
      fontWeight: fontWeight.bold,
      color: '#FFFFFF',
      marginBottom: spacing[8],
      textAlign: 'center',
    },
  },

  // Compact timer
  compact: {
    container: {
      backgroundColor: colors.secondary[900],
      borderRadius: 16,
      padding: spacing[4],
      alignItems: 'center',
    },

    countdown: {
      ...textStyles.timerMedium,
      color: timerColors.active,
    },

    label: {
      fontSize: fontSize.sm,
      color: lightMode.text.tertiary,
      marginTop: spacing[1],
    },
  },
};
```

### Exercise Cards (Workout View)

```javascript
// components/ExerciseCard.styles.js
export const exerciseCardStyles = {
  container: {
    backgroundColor: lightMode.background.elevated,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: colors.secondary[100],
  },

  content: {
    padding: spacing[4],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },

  title: {
    ...textStyles.h3,
    flex: 1,
    color: lightMode.text.primary,
  },

  difficulty: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 8,
    backgroundColor: colors.accent[100],
  },

  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.accent[700],
    textTransform: 'uppercase',
  },

  metadata: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[2],
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },

  metaText: {
    ...textStyles.bodySmall,
    color: lightMode.text.secondary,
  },
};
```

---

## 5. Layout & Grid

### Screen Layout

```javascript
// layout/Screen.styles.js
export const screenLayout = {
  container: {
    flex: 1,
    backgroundColor: lightMode.background.primary,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    padding: layout.screenPadding,
    paddingBottom: spacing[24], // Extra bottom padding
  },

  header: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[12], // Account for status bar
    paddingBottom: spacing[4],
  },

  section: {
    marginBottom: layout.sectionGap,
  },

  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing[4],
  },
};
```

### Grid System

```javascript
// layout/Grid.styles.js
export const gridLayout = {
  // Two column grid (exercise cards)
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    justifyContent: 'space-between',
  },

  twoColumnItem: {
    width: `calc(50% - ${spacing[3] / 2}px)`,
  },

  // List layout
  list: {
    gap: spacing[3],
  },

  listItem: {
    width: '100%',
  },
};
```

### Safe Areas

```javascript
// Use react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

export const safeAreaStyles = {
  container: {
    flex: 1,
    edges: ['top', 'left', 'right'], // Exclude bottom for floating buttons
  },
};
```

---

## 6. Motion & Animation

### Animation Timing

```javascript
// tokens/animation.js
export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
};

export const easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: { damping: 15, stiffness: 150 },
};
```

### Common Animations

```javascript
// animations/common.js
import { Animated } from 'react-native';

// Fade in
export const fadeIn = (animatedValue, duration = 300) => {
  Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    useNativeDriver: true,
  }).start();
};

// Scale bounce (button press)
export const scaleBounce = (animatedValue) => {
  Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start();
};

// Slide up (modal)
export const slideUp = (animatedValue, duration = 300) => {
  Animated.spring(animatedValue, {
    toValue: 0,
    damping: 20,
    stiffness: 100,
    useNativeDriver: true,
  }).start();
};
```

### Transitions

- **Screen Transitions**: 300ms ease-out
- **Button Press**: 100ms scale to 0.98
- **Modal Open**: 300ms slide up with spring
- **Card Hover/Press**: 200ms elevation change
- **Timer Countdown**: 1000ms linear (per second)
- **Timer Flash**: 200ms fade for transition warnings

---

## 7. Iconography

### Icon System

- **Library**: Use `@expo/vector-icons` (includes Ionicons, MaterialIcons, Feather)
- **Style**: Outline style for consistency
- **Sizes**: 16px (small), 20px (medium), 24px (large), 32px (xlarge)
- **Colors**: Inherit from parent or use semantic colors

```javascript
// tokens/icons.js
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

// Common icons
export const icons = {
  play: 'play-circle-outline',
  pause: 'pause-circle-outline',
  stop: 'stop-circle-outline',
  skip: 'play-skip-forward-outline',
  back: 'play-skip-back-outline',
  checkmark: 'checkmark-circle',
  close: 'close',
  add: 'add-circle-outline',
  remove: 'remove-circle-outline',
  search: 'search-outline',
  filter: 'filter-outline',
  settings: 'settings-outline',
  user: 'person-outline',
  timer: 'timer-outline',
  calendar: 'calendar-outline',
  list: 'list-outline',
  grid: 'grid-outline',
};
```

---

## 8. State Feedback

### Loading States

```javascript
// components/Loading.styles.js
export const loadingStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },

  spinner: {
    // Use ActivityIndicator from React Native
    size: 'large',
    color: colors.primary[500],
  },

  text: {
    ...textStyles.body,
    color: lightMode.text.secondary,
    marginTop: spacing[4],
  },
};
```

### Empty States

```javascript
// components/EmptyState.styles.js
export const emptyStateStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },

  icon: {
    width: 80,
    height: 80,
    marginBottom: spacing[4],
    opacity: 0.4,
  },

  title: {
    ...textStyles.h3,
    color: lightMode.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  message: {
    ...textStyles.body,
    color: lightMode.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },

  action: {
    // Use primary button
  },
};
```

### Error States

```javascript
// components/ErrorState.styles.js
export const errorStateStyles = {
  container: {
    backgroundColor: colors.error[50],
    borderRadius: 12,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },

  icon: {
    color: colors.error[500],
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.error[700],
    marginBottom: spacing[1],
  },

  message: {
    ...textStyles.bodySmall,
    color: colors.error[600],
  },
};
```

### Success States

```javascript
// components/SuccessState.styles.js
export const successStateStyles = {
  toast: {
    backgroundColor: colors.success[500],
    borderRadius: 12,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  icon: {
    color: '#FFFFFF',
  },

  message: {
    ...textStyles.body,
    color: '#FFFFFF',
    fontWeight: fontWeight.medium,
  },
};
```

---

## 9. Accessibility

### Touch Targets

- **Minimum**: 44x44 points (iOS HIG, WCAG AAA)
- **Recommended**: 48x48 points for primary actions
- **Spacing**: 8px minimum between interactive elements

### Contrast Ratios

- **Normal Text**: 4.5:1 minimum (WCAG AA)
- **Large Text (18pt+)**: 3:1 minimum
- **UI Components**: 3:1 minimum
- **Timer Display**: 7:1+ for maximum readability

### Text Sizing

- **Support Dynamic Type**: Use `allowFontScaling={true}`
- **Maximum Scale**: 200% (accessibility settings)
- **Minimum Text**: 12px (avoid smaller)

### Screen Reader Support

```javascript
// Example accessible button
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Start workout"
  accessibilityRole="button"
  accessibilityState={{ disabled: false }}
  accessibilityHint="Begins your workout session"
>
  <Text>Start</Text>
</TouchableOpacity>
```

---

## 10. Workout-Specific Design Patterns

### Workout Mode Screen

```javascript
// screens/WorkoutMode.styles.js
export const workoutModeStyles = {
  // Full screen immersive
  container: {
    flex: 1,
    backgroundColor: timerColors.background,
  },

  // Top info bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
  },

  circuitInfo: {
    ...textStyles.body,
    color: lightMode.text.tertiary,
  },

  // Main timer area
  timerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },

  // Exercise demo
  exerciseDemo: {
    width: '100%',
    height: 250,
    marginBottom: spacing[6],
    borderRadius: 16,
    overflow: 'hidden',
  },

  exerciseName: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing[4],
  },

  // Progress indicators
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.secondary[800],
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },

  // Control buttons
  controls: {
    flexDirection: 'row',
    gap: spacing[6],
    justifyContent: 'center',
    paddingBottom: spacing[8],
  },

  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
};
```

### Workout Builder Interface

```javascript
// screens/WorkoutBuilder.styles.js
export const workoutBuilderStyles = {
  // Drag area
  dropZone: {
    backgroundColor: lightMode.background.secondary,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: lightMode.border.medium,
    borderRadius: 12,
    padding: spacing[6],
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropZoneActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },

  // Circuit container
  circuit: {
    backgroundColor: lightMode.background.elevated,
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: colors.accent[500],
  },

  circuitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  circuitTitle: {
    ...textStyles.h3,
  },

  // Exercise slot
  exerciseSlot: {
    backgroundColor: lightMode.background.secondary,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[2],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  exerciseSlotEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: lightMode.border.medium,
    opacity: 0.6,
  },
};
```

---

## 11. Implementation Guidelines

### Theme Context

```javascript
// context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme || 'light');

  const theme = colorScheme === 'dark' ? darkMode : lightMode;

  const toggleTheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### Design Tokens Export

```javascript
// tokens/index.js
export { colors, lightMode, darkMode, timerColors } from './colors';
export { fontSize, fontWeight, lineHeight, textStyles } from './typography';
export { spacing, layout } from './spacing';
export { duration, easing } from './animation';
export { iconSizes, icons } from './icons';
```

### File Structure

```
mobile/
├── src/
│   ├── tokens/
│   │   ├── index.js
│   │   ├── colors.js
│   │   ├── typography.js
│   │   ├── spacing.js
│   │   ├── animation.js
│   │   └── icons.js
│   ├── styles/
│   │   ├── components/
│   │   │   ├── Button.styles.js
│   │   │   ├── Card.styles.js
│   │   │   ├── Input.styles.js
│   │   │   └── ...
│   │   ├── screens/
│   │   │   ├── WorkoutMode.styles.js
│   │   │   └── ...
│   │   └── layout/
│   │       ├── Screen.styles.js
│   │       └── Grid.styles.js
│   └── context/
│       └── ThemeContext.js
```

---

## 12. Design Checklist

When implementing new features, ensure:

- [ ] Touch targets are minimum 44x44 points
- [ ] Text contrast meets WCAG AA standards (4.5:1)
- [ ] Loading states are implemented
- [ ] Error states are handled gracefully
- [ ] Empty states are designed
- [ ] Animations use native driver where possible
- [ ] Colors reference design tokens
- [ ] Typography uses defined text styles
- [ ] Spacing uses 4px scale
- [ ] Dark mode variant exists
- [ ] Accessibility labels are provided
- [ ] Component is responsive to different screen sizes

---

## 13. Future Enhancements

### Phase 2 Design
- Advanced theming (custom colors)
- Haptic feedback patterns
- Sound design guidelines
- Illustration system
- Premium UI features

### Metrics
- Track user interactions
- A/B test button styles
- Monitor completion rates by design variant

---

**End of Design System v1.0**

*For questions or design discussions, refer to this document when implementing UI components. All designs should prioritize clarity, accessibility, and the core philosophy: getting users to their workout with zero friction.*
