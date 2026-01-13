# Screen Migration Guide
**Intensely Mobile App - Design System Integration**

This guide outlines the process for migrating existing screens to use the new design system.

## Migration Status

### ✅ Completed (3/24)
- **App.tsx** - ThemeProvider added
- **HomeScreen** - Fully migrated to design system
- **WelcomeScreen** - Fully migrated to design system

### 🔄 Remaining Screens (21/24)

#### Auth Screens (2/3 remaining)
- [ ] `src/screens/auth/LoginScreen.tsx`
- [ ] `src/screens/auth/SignUpScreen.tsx`

#### Exercise Screens (4/4 remaining)
- [ ] `src/screens/exercises/ExerciseDetailScreen.tsx`
- [ ] `src/screens/exercises/ExercisesListScreen.tsx`
- [ ] `src/screens/exercises/ExercisesScreen.tsx`
- [ ] `src/screens/exercises/FavoritesScreen.tsx`

#### Profile Screens (5/5 remaining)
- [ ] `src/screens/profile/EditProfileScreen.tsx`
- [ ] `src/screens/profile/PreferencesScreen.tsx`
- [ ] `src/screens/profile/ProfileMainScreen.tsx`
- [ ] `src/screens/profile/ProfileScreen.tsx`
- [ ] `src/screens/profile/SettingsScreen.tsx`

#### Progress Screens (4/4 remaining)
- [ ] `src/screens/progress/ExerciseProgressScreen.tsx`
- [ ] `src/screens/progress/LogProgressScreen.tsx`
- [ ] `src/screens/progress/ProgressOverviewScreen.tsx`
- [ ] `src/screens/progress/ProgressScreen.tsx`

#### Workout Screens (9/9 remaining)
- [ ] `src/screens/workouts/ExerciseSelectionScreen.tsx`
- [ ] `src/screens/workouts/JumpRightInScreen.tsx`
- [ ] `src/screens/workouts/LetUsCurateScreen.tsx`
- [ ] `src/screens/workouts/TakeTheWheelScreen.tsx`
- [ ] `src/screens/workouts/WorkoutCompleteScreen.tsx`
- [ ] `src/screens/workouts/WorkoutExecutionScreen.tsx`
- [ ] `src/screens/workouts/WorkoutFlowSelectionScreen.tsx`
- [ ] `src/screens/workouts/WorkoutPreviewScreen.tsx`
- [ ] `src/screens/workouts/WorkoutsScreen.tsx`

---

## Migration Steps

### 1. Update Imports

**Before:**
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { designTokens } from '../../config/design-tokens';
```

**After:**
```typescript
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing, borderRadius, colors } from '../../tokens';
```

### 2. Add Theme Hook

**Add to component:**
```typescript
const MyScreen = () => {
  const { theme } = useTheme();
  // ... rest of component
```

### 3. Replace React Native Components

**Text Components:**
```typescript
// Before
<Text style={styles.title}>Hello</Text>

// After
<Text variant="h1">Hello</Text>
<Text variant="body" color="secondary">Subtitle</Text>
```

**Button Components:**
```typescript
// Before
<TouchableOpacity style={styles.button} onPress={handlePress}>
  <Text style={styles.buttonText}>Press Me</Text>
</TouchableOpacity>

// After
<Button variant="primary" onPress={handlePress}>
  Press Me
</Button>
```

**Card Components:**
```typescript
// Before
<View style={styles.card}>
  <Text>Content</Text>
</View>

// After
<Card variant="elevated" padding="medium">
  <Text>Content</Text>
</Card>
```

### 4. Update Styles with Design Tokens

**Before:**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
});
```

**After:**
```typescript
const styles = StyleSheet.create({
  container: {
    // Use theme for colors
    padding: spacing[4],
    borderRadius: borderRadius.md,
  },
  title: {
    // Typography handled by Text component
    // Only add custom spacing/positioning
    marginBottom: spacing[2],
  },
});
```

### 5. Add Theme-Aware Backgrounds

**Pattern:**
```typescript
<View style={[styles.container, { backgroundColor: theme.background.primary }]}>
```

### 6. Replace designTokens References

**Find & Replace:**
- `designTokens.spacing.md` → `spacing[4]`
- `designTokens.spacing.lg` → `spacing[6]`
- `designTokens.borderRadius.md` → `borderRadius.md`
- `designTokens.colors.primary.main` → `colors.primary[500]`
- `designTokens.colors.text.primary` → `theme.text.primary`
- `designTokens.typography.h1` → Use `<Text variant="h1">`

---

## Quick Reference

### Spacing Conversion
| Old designTokens | New tokens |
|-----------------|------------|
| `spacing.sm` (8px) | `spacing[2]` |
| `spacing.md` (16px) | `spacing[4]` |
| `spacing.lg` (24px) | `spacing[6]` |
| `spacing.xl` (32px) | `spacing[8]` |

### Text Variants
| Use Case | Variant |
|----------|---------|
| Page title | `h1` |
| Section title | `h2` |
| Card title | `h3` |
| Body text | `body` |
| Small text | `bodySmall` |
| Captions | `caption` |

### Button Variants
| Use Case | Variant |
|----------|---------|
| Primary action | `primary` |
| Secondary action | `secondary` |
| Minimal action | `ghost` |
| Hero CTA | `large` |

### Theme Colors
Access via `useTheme()`:
- `theme.background.primary` - Main background
- `theme.background.elevated` - Cards, modals
- `theme.text.primary` - Main text
- `theme.text.secondary` - Supporting text
- `theme.border.medium` - Borders

---

## Example: Complete Screen Migration

### Before
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { designTokens } from '../../config/design-tokens';

const MyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Get started</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.neutral.background,
    padding: designTokens.spacing.md,
  },
  title: {
    ...designTokens.typography.h1,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  subtitle: {
    ...designTokens.typography.bodyMedium,
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.lg,
  },
  button: {
    backgroundColor: designTokens.colors.primary.main,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
  },
  buttonText: {
    color: designTokens.colors.text.onPrimary,
    ...designTokens.typography.button,
  },
});
```

### After
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from '../../components/ui';
import { useTheme } from '../../theme';
import { spacing } from '../../tokens';

const MyScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text variant="h1" style={styles.title}>
        Welcome
      </Text>
      <Text variant="body" color="secondary" style={styles.subtitle}>
        Get started
      </Text>

      <Button variant="primary">
        Continue
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[6],
  },
});
```

---

## Benefits of Migration

✅ **Automatic dark mode support**
✅ **Consistent spacing across all screens**
✅ **Typography variants for better hierarchy**
✅ **Reduced code - no need to define text styles**
✅ **Theme-aware colors**
✅ **Accessibility built-in (touch targets, contrast)**
✅ **Follows design.md specifications**

---

## Testing Checklist

After migrating a screen:
- [ ] Screen renders without errors
- [ ] Theme changes work (light/dark mode)
- [ ] Spacing looks consistent
- [ ] Text hierarchy is clear
- [ ] Buttons meet minimum touch targets (44px)
- [ ] Colors use theme-aware values
- [ ] All interactive elements are accessible

---

## Next Steps

1. **Migrate screens by priority:**
   - Auth screens (user-facing, important)
   - Workout screens (core functionality)
   - Profile screens
   - Exercise screens
   - Progress screens

2. **Test each screen** after migration

3. **Update this document** as you complete screens

4. **Review design.md** for component-specific guidelines

---

**Need help?** See:
- `/DESIGN_SYSTEM_USAGE.md` - Complete design system guide
- `/design.md` - Full design specifications
- `/src/components/ui/` - Component implementations
