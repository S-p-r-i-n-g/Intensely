# Intensely - UX Guide

Comprehensive UX guidelines and implementation reference for the Intensely HICT Workout App.

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Component Specifications](#component-specifications)
6. [Screen Wireframes](#screen-wireframes)
7. [Implementation Checklist](#implementation-checklist)
8. [Accessibility Guidelines](#accessibility-guidelines)

---

## Design Philosophy

**Core Principles:**
- **Zero Friction**: Users should reach their workout in seconds
- **Clarity During Motion**: High contrast, large text for active workouts
- **Progressive Disclosure**: Simple by default, powerful when needed
- **Mobile-First**: Optimized for thumb zones and one-handed use
- **Motivating, Not Overwhelming**: Clean interfaces that inspire action

---

## Color System

### Primary Palette
```javascript
primary: {
  main: '#FF6B35',      // Energetic orange - main CTAs
  dark: '#E55A2B',      // Pressed states
  light: '#FF8C5A',     // Highlights
  lightest: '#FFF5F0',  // Subtle backgrounds
}
```

### Semantic Colors
```javascript
semantic: {
  success: '#10B981',   // Completed workouts, achievements
  warning: '#F59E0B',   // Important notices
  error: '#EF4444',     // Errors, critical actions
  info: '#3B82F6',      // Informational messages
}
```

### Workout States
```javascript
workout: {
  work: '#FF6B35',      // Work interval (orange)
  rest: '#10B981',      // Rest interval (green)
  circuitRest: '#3B82F6', // Circuit rest (blue)
  paused: '#6B7280',    // Paused state (gray)
}
```

### Neutral Palette
```javascript
neutral: {
  background: '#FAFAFA',     // App background
  surface: '#FFFFFF',        // Cards, elevated surfaces
  surfaceVariant: '#F5F5F5', // Subtle cards
  outline: '#E5E5E5',        // Borders
  textPrimary: '#1F2937',    // Main text
  textSecondary: '#6B7280',  // Secondary text
  textTertiary: '#9CA3AF',   // Hints, captions
}
```

---

## Typography

### Headlines
| Style | Size | Weight | Use Case |
|-------|------|--------|----------|
| H1 | 32px | Bold | Main screen titles, hero sections |
| H2 | 24px | Semi-bold | Section headers, card titles |
| H3 | 20px | Semi-bold | Subsection headers |

### Body Text
| Style | Size | Weight | Use Case |
|-------|------|--------|----------|
| Body Large | 18px | Regular | Important descriptions |
| Body Medium | 16px | Regular | Default body text |
| Body Small | 14px | Regular | Secondary information |
| Caption | 12px | Regular | Metadata, timestamps |

### Special
| Style | Size | Weight | Use Case |
|-------|------|--------|----------|
| Timer | 72px | Bold | Workout countdown |
| Button | 16px | Semi-bold | All buttons |

---

## Spacing System

Use the **8px grid system**:

```javascript
spacing: {
  xs: 4,    // Tight spacing between related items
  sm: 8,    // Default small spacing
  md: 16,   // Standard spacing (most common)
  lg: 24,   // Section spacing
  xl: 32,   // Large section spacing
  xxl: 48,  // Major section breaks
}
```

**Example:**
```typescript
<View style={{
  padding: spacing.md,      // 16px
  marginBottom: spacing.lg, // 24px
  gap: spacing.sm           // 8px
}}>
```

---

## Component Specifications

### Button Component
```typescript
<Button
  variant="primary"   // primary | secondary | text | icon
  size="medium"       // small | medium | large
  loading={false}
  disabled={false}
  onPress={() => {}}
>
  Button Text
</Button>
```

### Card Component
```typescript
<Card
  variant="elevated"  // elevated | outlined | filled
  padding="medium"    // small | medium | large
  onPress={() => {}}
>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Actions>
    <Button>Action</Button>
  </Card.Actions>
</Card>
```

### Progress Indicator
```typescript
<ProgressBar
  progress={0.6}        // 0-1
  variant="linear"      // linear | circular
  color="primary"       // primary | success | warning | error
  showLabel={true}
/>
```

---

## Screen Wireframes

### Home Screen
```
┌─────────────────────────────────────┐
│  Hello, [Name]!                     │
│  Ready to crush your workout?       │
│                                     │
│  ┌───────┬───────┬───────┐         │
│  │ 0 min │   0   │  🔥0  │         │
│  │Workout│Workouts│Streak│         │
│  └───────┴───────┴───────┘         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ⚡ JUMP RIGHT IN              │ │
│  │ Get an instant workout        │ │
│  │ ~20 minutes • Beginner        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🎯 LET US CURATE              │ │
│  │ Choose goal & customize       │ │
│  │ ~20-45 min • Any level        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🛠️ TAKE THE WHEEL             │ │
│  │ Build custom workout          │ │
│  │ Full control                  │ │
│  └───────────────────────────────┘ │
│                                     │
│  Recent Activity                    │
│  ┌───────────────────────────────┐ │
│  │ No workouts yet               │ │
│  │ [Start First Workout]         │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Workout Execution Screen
```
┌─────────────────────────────────────┐
│  [← Back]          Workout Timer    │
│                                     │
│        🔥 WORKOUT TIME 🔥           │
│                                     │
│         ⏱️  00:45                   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ████████████░░░░░░  60%       │ │
│  └───────────────────────────────┘ │
│                                     │
│  Push-ups                           │
│  ┌───────────────────────────────┐ │
│  │    [Exercise GIF/Image]        │ │
│  └───────────────────────────────┘ │
│                                     │
│  💪 Upper Body Push • Beginner      │
│                                     │
│  Circuit 1 • Set 2 • Exercise 3/4  │
│  ┌─────┬─────┬─────┬─────┐        │
│  │ ███ │ ███ │ ░░░ │ ░░░ │        │
│  └─────┴─────┴─────┴─────┘        │
│                                     │
│  ┌─────────┬─────────┬─────────┐   │
│  │[◀◀ Prev]│[▶ Pause]│[Skip ▶▶]│   │
│  └─────────┴─────────┴─────────┘   │
└─────────────────────────────────────┘
```

### Let Us Curate - Objective Selection
```
┌─────────────────────────────────────┐
│  Choose Your Goal                   │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ 🔥 FAT   │  │ 💪 BUILD │        │
│  │  BURN    │  │ STRENGTH │        │
│  │ ~20 min  │  │ ~30 min  │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ ❤️ CARDIO│  │ 🤸 FLEX  │        │
│  │ ~25 min  │  │ ~15 min  │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

### Loading States (Skeleton)
```
┌─────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                     │
│  ░░░░░░░░░░░░░░                     │
│  ░░░░░░░░░░░░░░                     │
│                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Foundation
- [x] Design tokens (colors, typography, spacing)
- [x] Button component (primary, secondary, text, icon)
- [x] Card component (elevated, outlined, filled)
- [x] ProgressBar component
- [x] Badge component
- [x] StatsCard component
- [x] WorkoutFlowCard component
- [x] SkeletonLoader component
- [x] Home screen stats section
- [x] Enhanced workout flow cards

### Phase 2: Core Experience
- [ ] Workout execution screen improvements
- [ ] Visual interval indicators (work/rest/circuit rest)
- [ ] Progress visualization (linear/circular)
- [ ] Exercise information display
- [ ] Let Us Curate visual objective selection
- [ ] Loading states (skeleton screens)
- [ ] Success/error feedback

### Phase 3: Advanced Features
- [ ] Progress dashboard with charts
- [ ] Take the Wheel enhancements
- [ ] Inline exercise selection
- [ ] Real-time workout analysis
- [ ] Onboarding flow

### Phase 4: Polish
- [ ] Micro-interactions and animations
- [ ] Page transitions
- [ ] Accessibility improvements
- [ ] Performance optimization

---

## Accessibility Guidelines

### Visual Accessibility
- Minimum **4.5:1 contrast ratio** for text (WCAG AA)
- Support system font scaling
- Provide high contrast mode option
- Don't rely on color alone for information

### Motor Accessibility
- Minimum **44x44pt touch targets**
- Provide swipe alternatives to buttons
- Adequate spacing between interactive elements
- No time-limited actions without extension option

### Cognitive Accessibility
- Clear, simple language
- Visual + text labels
- Progress indicators for multi-step processes
- Option to skip complex features

---

## Animation Guidelines

### Duration
| Speed | Duration | Use Case |
|-------|----------|----------|
| Fast | 150ms | Micro-interactions, button presses |
| Normal | 300ms | Standard transitions |
| Slow | 500ms | Page transitions |
| Slower | 800ms | Celebrations, major state changes |

### Easing
- `ease-in-out` for most transitions
- `ease-out` for entering elements
- `ease-in` for exiting elements

### When to Animate
- ✅ State changes (paused → playing)
- ✅ Navigation transitions
- ✅ List item additions/removals
- ✅ Progress updates
- ✅ Success/error feedback
- ❌ Initial load (use skeleton screens)
- ❌ Scroll (performance impact)

---

## Resources

### Design Inspiration
- Nike Training Club (workout execution)
- Strava (progress visualization)
- Apple Fitness+ (animations, hierarchy)
- Strong (exercise tracking)

### Libraries
- React Native Reanimated (animations)
- React Native Gesture Handler (interactions)
- Lottie (complex animations)
- React Native SVG (charts/graphics)

---

*Consolidated from: UX_IMPROVEMENT_PLAN.md, UX_IMPLEMENTATION_TRACKER.md, UX_QUICK_REFERENCE.md*
*Last Updated: 2026-01-20*
