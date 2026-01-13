# Design System Usage Guide
**Intensely Mobile App**

This guide explains how to use the design system in the React Native mobile app.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Design Tokens](#design-tokens)
3. [Theme Context](#theme-context)
4. [UI Components](#ui-components)
5. [Best Practices](#best-practices)

---

## Getting Started

The design system is fully integrated into the mobile app. All design tokens, themes, and UI components are ready to use.

### Quick Start

```typescript
import { Button, Card, Text } from '../components/ui';
import { useTheme } from '../theme/ThemeContext';
import { colors, spacing } from '../tokens';
```

---

## Design Tokens

Design tokens are located in `/src/tokens/` and provide consistent values for colors, typography, spacing, animations, and icons.

### Colors

```typescript
import { colors, lightMode, darkMode, timerColors } from '../tokens';

// Use predefined color scales
backgroundColor: colors.primary[500],
borderColor: colors.secondary[300],

// Use semantic colors (theme-aware)
import { useTheme } from '../theme/ThemeContext';
const { theme } = useTheme();

backgroundColor: theme.background.primary,
color: theme.text.primary,
```

### Typography

```typescript
import { fontSize, fontWeight, textStyles } from '../tokens';

// Font sizes
fontSize: fontSize.base, // 16
fontSize: fontSize.lg,   // 18
fontSize: fontSize['2xl'], // 24

// Font weights
fontWeight: fontWeight.semibold, // '600'

// Predefined text styles
...textStyles.h1,
...textStyles.body,
...textStyles.buttonMedium,
```

### Spacing

```typescript
import { spacing, layout, borderRadius } from '../tokens';

// Spacing scale (4px base)
padding: spacing[4],     // 16px
margin: spacing[6],      // 24px
gap: spacing[3],         // 12px

// Semantic spacing
padding: layout.cardPadding,           // 16px
marginBottom: layout.sectionGap,       // 24px
paddingHorizontal: layout.screenPadding, // 16px

// Border radius
borderRadius: borderRadius.md,  // 12
borderRadius: borderRadius.lg,  // 16
```

### Animation

```typescript
import { duration, animations } from '../tokens';

// Animation durations
duration: duration.fast,   // 200ms
duration: duration.normal, // 300ms

// Animation helpers
animations.fadeIn(animatedValue);
animations.scaleBounce(animatedValue);
animations.slideUp(animatedValue);
```

### Icons

```typescript
import { icons, iconSizes } from '../tokens';
import { Ionicons } from '@expo/vector-icons';

<Ionicons
  name={icons.play}
  size={iconSizes.md}
  color={colors.primary[500]}
/>
```

---

## Theme Context

The `ThemeProvider` manages light/dark mode across the app.

### Setup

Wrap your app with `ThemeProvider`:

```typescript
// App.tsx
import { ThemeProvider } from './src/theme/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### Using Theme

```typescript
import { useTheme } from '../theme/ThemeContext';

function MyComponent() {
  const { theme, colorScheme, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.background.primary }}>
      <Text style={{ color: theme.text.primary }}>
        Current theme: {colorScheme}
      </Text>
      <Button onPress={toggleTheme}>Toggle Theme</Button>
    </View>
  );
}
```

---

## UI Components

All components are located in `/src/components/ui/` and use the design system tokens.

### Button

```typescript
import { Button } from '../components/ui';

// Primary button (default)
<Button onPress={handlePress}>
  Start Workout
</Button>

// Variants
<Button variant="primary" onPress={handlePress}>Primary</Button>
<Button variant="secondary" onPress={handlePress}>Secondary</Button>
<Button variant="ghost" onPress={handlePress}>Ghost</Button>
<Button variant="large" onPress={handlePress}>Large CTA</Button>

// Sizes
<Button size="small" onPress={handlePress}>Small</Button>
<Button size="medium" onPress={handlePress}>Medium</Button>
<Button size="large" onPress={handlePress}>Large</Button>

// States
<Button loading onPress={handlePress}>Loading</Button>
<Button disabled onPress={handlePress}>Disabled</Button>

// Full width
<Button fullWidth onPress={handlePress}>Full Width</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'large'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean
- `loading`: boolean
- `fullWidth`: boolean
- `onPress`: () => void

### Card

```typescript
import { Card, CardHeader, CardTitle, CardContent, CardActions } from '../components/ui';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Variants
<Card variant="elevated">Elevated card (default)</Card>
<Card variant="outlined">Outlined card</Card>
<Card variant="filled">Filled card</Card>

// Padding
<Card padding="small">Small padding</Card>
<Card padding="medium">Medium padding (default)</Card>
<Card padding="large">Large padding</Card>

// Pressable card
<Card onPress={handlePress}>
  <Text>Tap me</Text>
</Card>

// Structured card
<Card>
  <CardHeader>
    <CardTitle>
      <Text variant="h3">Exercise Name</Text>
    </CardTitle>
  </CardHeader>

  <CardContent>
    <Text>Exercise description goes here</Text>
  </CardContent>

  <CardActions>
    <Button variant="ghost">Cancel</Button>
    <Button>Confirm</Button>
  </CardActions>
</Card>
```

**Props:**
- `variant`: 'elevated' | 'outlined' | 'filled'
- `padding`: 'small' | 'medium' | 'large'
- `onPress`: () => void (optional)

### Text

```typescript
import { Text } from '../components/ui';

// Headings
<Text variant="h1">Page Title</Text>
<Text variant="h2">Section Title</Text>
<Text variant="h3">Subsection Title</Text>

// Body text
<Text variant="body">Default body text</Text>
<Text variant="bodyLarge">Large body text</Text>
<Text variant="bodySmall">Small body text</Text>

// Special
<Text variant="caption">METADATA CAPTION</Text>

// Colors
<Text color="primary">Primary text (default)</Text>
<Text color="secondary">Secondary text</Text>
<Text color="tertiary">Tertiary text</Text>
<Text color="inverse">Inverse text</Text>

// Combined
<Text variant="h2" color="secondary">
  Secondary Heading
</Text>
```

**Props:**
- `variant`: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption'
- `color`: 'primary' | 'secondary' | 'tertiary' | 'inverse'

### Input

```typescript
import { Input } from '../components/ui';

// Basic input
<Input
  placeholder="Enter your name"
  value={name}
  onChangeText={setName}
/>

// With label
<Input
  label="Email Address"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>

// With error
<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  error="Password must be at least 8 characters"
/>

// With helper text
<Input
  label="Username"
  value={username}
  onChangeText={setUsername}
  helperText="Choose a unique username"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `containerStyle`: ViewStyle
- All standard TextInput props

---

## Best Practices

### 1. Always Use Design Tokens

❌ **Don't hardcode values:**
```typescript
<View style={{ padding: 16, borderRadius: 12 }}>
```

✅ **Use tokens:**
```typescript
<View style={{ padding: spacing[4], borderRadius: borderRadius.md }}>
```

### 2. Use Theme Context for Colors

❌ **Don't hardcode theme-dependent colors:**
```typescript
<View style={{ backgroundColor: '#FFFFFF' }}>
```

✅ **Use theme context:**
```typescript
const { theme } = useTheme();
<View style={{ backgroundColor: theme.background.primary }}>
```

### 3. Use UI Components

❌ **Don't create custom buttons:**
```typescript
<TouchableOpacity style={{ backgroundColor: '#FF0000', padding: 12 }}>
  <Text style={{ color: '#FFF' }}>Press me</Text>
</TouchableOpacity>
```

✅ **Use Button component:**
```typescript
<Button variant="primary" onPress={handlePress}>
  Press me
</Button>
```

### 4. Maintain Touch Targets

Always ensure interactive elements meet minimum touch target sizes:

```typescript
import { touchTarget } from '../tokens';

<TouchableOpacity style={{ minHeight: touchTarget.min }}>
```

### 5. Follow Spacing System

Use the 4px spacing scale consistently:

```typescript
// Good spacing
marginBottom: spacing[3],  // 12px
gap: spacing[4],          // 16px
padding: spacing[6],      // 24px

// Avoid arbitrary values
marginBottom: 13,  // Not on the scale
padding: 17,       // Not on the scale
```

### 6. Accessibility

Always provide accessibility props:

```typescript
<Button
  onPress={handlePress}
  accessibilityLabel="Start workout"
  accessibilityHint="Begins your workout session"
>
  Start
</Button>
```

### 7. Typography

Use Text component instead of React Native Text:

```typescript
// Use design system Text
<Text variant="body">Content</Text>

// Not bare React Native Text
<RNText style={{ fontSize: 16 }}>Content</RNText>
```

---

## Example Screen

Here's a complete example using the design system:

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Text, Input } from '../components/ui';
import { useTheme } from '../theme/ThemeContext';
import { spacing, layout } from '../tokens';

export function ExampleScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    // Handle submission
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h1" style={styles.title}>
        Welcome Back
      </Text>

      <Card style={styles.card}>
        <Text variant="h3" style={styles.cardTitle}>
          Sign In
        </Text>

        <Input
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          variant="primary"
          fullWidth
          onPress={handleSubmit}
          style={styles.button}
        >
          Continue
        </Button>

        <Button
          variant="ghost"
          fullWidth
          onPress={() => console.log('Forgot password')}
        >
          Forgot Password?
        </Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
  },
  title: {
    marginBottom: spacing[8],
  },
  card: {
    marginBottom: spacing[6],
  },
  cardTitle: {
    marginBottom: spacing[4],
  },
  button: {
    marginTop: spacing[6],
    marginBottom: spacing[3],
  },
});
```

---

## Reference

- **Full Design System**: See `/design.md` in project root
- **Design Tokens**: `/src/tokens/`
- **Theme Context**: `/src/theme/ThemeContext.tsx`
- **UI Components**: `/src/components/ui/`
- **Gemini CLI Integration**: See `/GEMINI_WORKFLOW.md`

---

**Questions or need help?** Refer to the design system documentation or use Gemini CLI for design assistance!
