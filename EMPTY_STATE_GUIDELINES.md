# Empty State Design Guidelines (P3 Enhancement)

## Overview
Based on Gemini 3 Flash Preview recommendations, empty states should use Secondary 400-500 range for illustrations to avoid competing with Primary Red CTAs.

## Color Usage

### Illustration Colors (Non-Competitive)
```typescript
// Use Secondary (Slate) colors for illustrations
illustrationColor: colors.secondary[400] // #94A3B8
illustrationSecondary: colors.secondary[500] // #64748B
```

**Why**: Slate tones recede visually, allowing the Primary Red "Start" or "Create" buttons to command attention.

### Text Colors
```typescript
// Empty state titles
titleColor: theme.text.primary // #0F172A (high contrast)

// Empty state descriptions
descriptionColor: theme.text.secondary // #475569 (supportive)
```

## Empty State Patterns

### 1. No Workouts Created
```typescript
<View style={styles.emptyContainer}>
  {/* Illustration using Slate colors */}
  <DumbbellIllustration color={colors.secondary[400]} />

  <Text variant="h3" color="primary">
    No Workouts Yet
  </Text>

  <Text variant="body" color="secondary" style={styles.description}>
    Create your first HICT workout to get started
  </Text>

  {/* Primary CTA stands out */}
  <Button variant="primary" onPress={handleCreate}>
    Create Workout
  </Button>
</View>
```

### 2. No Exercise History
```typescript
<View style={styles.emptyContainer}>
  <ChartIllustration color={colors.secondary[500]} />

  <Text variant="h3" color="primary">
    Start Your Journey
  </Text>

  <Text variant="body" color="secondary">
    Complete your first workout to see your progress here
  </Text>
</View>
```

### 3. Search No Results
```typescript
<View style={styles.emptyContainer}>
  <SearchIllustration color={colors.secondary[400]} />

  <Text variant="h3" color="primary">
    No Matches Found
  </Text>

  <Text variant="body" color="secondary">
    Try adjusting your search terms
  </Text>
</View>
```

## Illustration Guidelines

### Visual Hierarchy
1. **Illustrations**: Secondary 400-500 (recedes)
2. **Title Text**: Text Primary (strong)
3. **Description**: Text Secondary (supportive)
4. **CTA Button**: Primary Red (dominant)

### Size Recommendations
```typescript
illustration: {
  width: 120,
  height: 120,
  marginBottom: spacing[6], // 24px
}

title: {
  marginBottom: spacing[3], // 12px
  textAlign: 'center',
}

description: {
  marginBottom: spacing[6], // 24px
  textAlign: 'center',
  paddingHorizontal: spacing[8], // 32px
}
```

### Spacing
```typescript
const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6], // 24px
  },
});
```

## Icon Usage

### Ionicons with Slate Colors
```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons
  name="barbell-outline"
  size={80}
  color={colors.secondary[400]} // Slate tone
/>
```

### Custom Illustrations
If using custom SVG illustrations:
- Primary shape fill: `colors.secondary[400]`
- Secondary accents: `colors.secondary[500]`
- Avoid using Primary Red in illustrations
- Keep illustrations simple and clean

## Accessibility

### Screen Reader Support
```typescript
<View
  style={styles.emptyContainer}
  accessible={true}
  accessibilityLabel="No workouts found. Create your first workout to get started."
  accessibilityRole="text"
>
  {/* Content */}
</View>
```

### Touch Targets
Ensure CTA buttons meet minimum 48px touch target:
```typescript
<Button
  variant="primary"
  onPress={handleCreate}
  style={{ minHeight: touchTargets.recommended }} // 48px
>
  Create Workout
</Button>
```

## Dark Mode Considerations

In dark mode, illustrations should use lighter Slate tones:
```typescript
const illustrationColor = colorScheme === 'dark'
  ? colors.secondary[600] // Lighter in dark mode
  : colors.secondary[400]; // Standard in light mode
```

## Examples by Context

### Workout Library (Empty)
- **Illustration**: Dumbbell icon in Slate 400
- **Title**: "Build Your Arsenal"
- **Description**: "Create custom workouts tailored to your goals"
- **CTA**: "Create First Workout" (Primary Red)

### Exercise History (Empty)
- **Illustration**: Chart icon in Slate 500
- **Title**: "Track Your Progress"
- **Description**: "Complete workouts to see your stats and achievements"
- **CTA**: None (passive state)

### Favorites (Empty)
- **Illustration**: Heart icon in Slate 400
- **Title**: "No Favorites Yet"
- **Description**: "Tap the heart icon on any workout to add it here"
- **CTA**: "Browse Workouts" (Secondary button)

## Best Practices

✅ **DO:**
- Use Slate (Secondary 400-500) for all illustrations
- Keep illustrations simple and recognizable
- Center-align empty state content
- Use clear, encouraging copy
- Provide actionable CTAs when appropriate

❌ **DON'T:**
- Use Primary Red in illustrations (competes with CTAs)
- Use complex, multi-color illustrations
- Leave users without guidance
- Use error colors for non-error empty states
- Overwhelm with too many actions

## Testing Checklist

- [ ] Illustration uses Secondary 400-500 range
- [ ] Title is clear and concise
- [ ] Description provides helpful context
- [ ] CTA button (if present) uses Primary Red
- [ ] Spacing follows design system
- [ ] Accessible labels provided
- [ ] Touch targets meet 48px minimum
- [ ] Works in both light and dark modes
- [ ] Screen reader announces content correctly

---

**Reference**: Based on Gemini 3 Flash Preview P3 recommendations for Intensely Design System v1.1
