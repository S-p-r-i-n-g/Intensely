# UX Quick Reference Guide

Quick reference for implementing UX improvements in the Intensely app.

## Priority Improvements (Start Here)

### 1. Home Screen Enhancement (High Impact, Quick Win)

**Current State**: Basic greeting + 3 workout cards + empty recent activity

**Enhanced Version**:

```
┌─────────────────────────────────────┐
│  Hello, [Name]! 👋                  │
│  Ready to crush your workout?       │
│                                     │
│  ┌───────┬───────┬───────┐         │
│  │ 0 min │   0   │  🔥0  │         │
│  │Workout│Workouts│Streak│         │
│  └───────┴───────┴───────┘         │
│                                     │
│  Quick Start                        │
│  ┌───────────────────────────────┐ │
│  │ ⚡ JUMP RIGHT IN              │ │
│  │ Get an instant workout        │ │
│  │ ~20 minutes • Beginner        │ │
│  │                              →│ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🎯 LET US CURATE              │ │
│  │ Choose goal & customize       │ │
│  │ ~20-45 min • Any level        │ │
│  │                              →│ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🛠️ TAKE THE WHEEL             │ │
│  │ Build custom workout          │ │
│  │ Full control                  │ │
│  │                              →│ │
│  └───────────────────────────────┘ │
│                                     │
│  Recent Activity                    │
│  ┌───────────────────────────────┐ │
│  │ 📊 No workouts yet            │ │
│  │ Start your first workout to   │ │
│  │ see your activity here!       │ │
│  │                              │ │
│  │    [Start First Workout]     │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Implementation Steps**:
1. Add stats cards (workout minutes, total workouts, streak)
2. Enhance workout cards with icons, time estimates, difficulty
3. Replace empty state with motivational message + CTA
4. Add subtle shadows/elevation to cards

**Code Changes**:
- Update `HomeScreen.tsx` to use design tokens
- Add stats calculation (if data available)
- Create reusable `StatsCard` component
- Create enhanced `WorkoutFlowCard` component

---

### 2. Workout Execution Screen (Critical UX Flow)

**Current State**: Basic timer with exercise name

**Enhanced Version**:

```
┌─────────────────────────────────────┐
│  [← Back]          Workout Timer   │
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
│                                     │
│  [🏁 Finish Workout]                │
└─────────────────────────────────────┘
```

**Key Improvements**:
1. **Visual Interval Indicator**: Color-code WORK (orange), REST (green), CIRCUIT REST (blue)
2. **Progress Visualization**: Circular or linear progress bar
3. **Exercise Thumbnail**: Show exercise image/GIF
4. **Circuit Progress**: Visual indicators for completed circuits
5. **Clear Hierarchy**: Timer is prominent, supporting info is secondary

**Implementation Steps**:
1. Add interval type visual indicator (colored banner/background)
2. Implement progress bar (circular or linear)
3. Fetch and display exercise thumbnails
4. Add circuit progress indicators
5. Improve button layout and spacing

---

### 3. Let Us Curate Screen (Improved Selection)

**Current State**: List of objectives with customization options

**Enhanced Objective Selection**:

```
┌─────────────────────────────────────┐
│  Choose Your Goal                   │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ 🔥       │  │ 💪       │        │
│  │  FAT     │  │ STRENGTH │        │
│  │  BURN    │  │ BUILDING │        │
│  │          │  │          │        │
│  │ ~20 min  │  │ ~30 min  │        │
│  │Cardio    │  │Muscle    │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ ❤️       │  │ 🤸       │        │
│  │ CARDIO   │  │ FLEX     │        │
│  │          │  │          │        │
│  │ ~25 min  │  │ ~15 min  │        │
│  │Heart     │  │Mobility  │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
```

**Enhanced Customization View**:

```
┌─────────────────────────────────────┐
│  Customize Your Workout             │
│  Fat Burn & Weight Loss             │
│                                     │
│  Difficulty                         │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Begin ││Inter ││Advanc│        │
│  └──────┘ └──────┘ └──────┘        │
│     ✓ Selected                      │
│                                     │
│  Duration (minutes)                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │15 ││20 ││30 ││45 │          │
│  └───┘ └───┘ └───┘ └───┘          │
│     ✓ Recommended                   │
│                                     │
│  Constraints                        │
│  ┌───────────────────────────────┐ │
│  │ 🏠 Small Space    [✓]         │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ 🔇 Quiet Mode     [ ]         │ │
│  └───────────────────────────────┘ │
│                                     │
│  Estimated Workout:                 │
│  • 3 circuits                       │
│  • 4 exercises per circuit          │
│  • ~20 minutes                      │
│  • 280 calories                     │
│                                     │
│  [Generate Workout →]               │
└─────────────────────────────────────┘
```

**Key Improvements**:
1. Visual objective cards (grid layout, icons, estimated time)
2. Clear customization interface with recommended values highlighted
3. Real-time workout preview as options change
4. Visual constraint toggles

---

### 4. Loading States & Feedback

**Replace Spinners with Skeleton Screens**:

```
Loading Workout...
┌─────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                     │
│  ░░░░░░░░░░░░░░                     │
│  ░░░░░░░░░░░░░░                     │
│                                     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────┘
```

**Success Feedback**:

```
Workout Generated!
┌─────────────────────────────────────┐
│          ✓                          │
│     Workout Ready!                  │
│                                     │
│  Your perfect workout is ready      │
│  Let's get started!                 │
│                                     │
│     [View Workout →]                │
└─────────────────────────────────────┘
```

---

### 5. Error States

**User-Friendly Error Messages**:

```
Something Went Wrong
┌─────────────────────────────────────┐
│          ⚠️                          │
│  Couldn't generate workout          │
│                                     │
│  We're having trouble connecting    │
│  to the server. Please check your   │
│  connection and try again.          │
│                                     │
│  [Retry]  [Go Back]                 │
└─────────────────────────────────────┘
```

---

## Component Specifications

### Enhanced Button Component

```typescript
// Usage
<Button 
  variant="primary" // primary | secondary | text | icon
  size="medium"    // small | medium | large
  loading={false}
  disabled={false}
  onPress={() => {}}
>
  Button Text
</Button>
```

### Enhanced Card Component

```typescript
// Usage
<Card 
  variant="elevated" // elevated | outlined | filled
  padding="medium"   // small | medium | large
  onPress={() => {}}
>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Actions>
    <Button>Action</Button>
  </Card.Actions>
</Card>
```

### Progress Indicator

```typescript
// Usage
<ProgressBar 
  progress={0.6}        // 0-1
  variant="linear"      // linear | circular
  color="primary"       // primary | success | warning | error
  showLabel={true}      // Show percentage text
/>
```

---

## Color Usage Guidelines

### Primary Actions
- Use `primary.main` (#FF6B35) for main CTAs
- Use `primary.dark` for pressed/hover states
- Use `primary.lightest` for subtle backgrounds

### Status Indicators
- Success: `semantic.success` (#10B981) - completed workouts, achievements
- Warning: `semantic.warning` (#F59E0B) - important notices
- Error: `semantic.error` (#EF4444) - errors, critical actions
- Info: `semantic.info` (#3B82F6) - informational messages

### Workout States
- Work interval: `workout.work` (orange)
- Rest interval: `workout.rest` (green)
- Circuit rest: `workout.circuitRest` (blue)
- Paused: `workout.paused` (gray)

---

## Typography Usage

### Headlines
- **H1 (32px)**: Main screen titles, hero sections
- **H2 (24px)**: Section headers, card titles
- **H3 (20px)**: Subsection headers

### Body Text
- **Body Large (18px)**: Important descriptions, key content
- **Body Medium (16px)**: Default body text
- **Body Small (14px)**: Secondary information
- **Caption (12px)**: Metadata, timestamps, labels

### Special
- **Timer (72px)**: Workout execution screen countdown
- **Button (16px, semibold)**: All button text

---

## Spacing Guidelines

Use the 8px grid system:
- **xs (4px)**: Tight spacing between related items
- **sm (8px)**: Default small spacing
- **md (16px)**: Standard spacing (most common)
- **lg (24px)**: Section spacing
- **xl (32px)**: Large section spacing
- **xxl (48px)**: Major section breaks

**Example**:
```typescript
<View style={{ 
  padding: spacing.md,      // 16px
  marginBottom: spacing.lg, // 24px
  gap: spacing.sm           // 8px
}}>
```

---

## Animation Guidelines

### Duration
- **Fast (150ms)**: Micro-interactions, button presses
- **Normal (300ms)**: Standard transitions
- **Slow (500ms)**: Page transitions, complex animations
- **Slower (800ms)**: Celebrations, major state changes

### Easing
- Use `ease-in-out` for most transitions
- Use `ease-out` for entering elements
- Use `ease-in` for exiting elements

### When to Animate
- ✅ State changes (paused → playing)
- ✅ Navigation transitions
- ✅ List item additions/removals
- ✅ Progress updates
- ✅ Success/error feedback
- ❌ Avoid on initial load (skeleton screens instead)
- ❌ Avoid on scroll (performance impact)

---

## Accessibility Checklist

### Visual
- ✅ Minimum 4.5:1 contrast ratio for text
- ✅ Support system font scaling
- ✅ Provide high contrast mode option
- ✅ Don't rely on color alone for information

### Motor
- ✅ Minimum 44x44pt touch targets
- ✅ Provide swipe alternatives to buttons
- ✅ Spacing between interactive elements
- ✅ No time-limited actions without option to extend

### Cognitive
- ✅ Clear, simple language
- ✅ Visual + text labels
- ✅ Progress indicators for multi-step processes
- ✅ Option to skip complex features

---

## Quick Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Import design tokens file
- [ ] Create reusable Button component
- [ ] Create reusable Card component
- [ ] Update Home screen with stats cards
- [ ] Enhance workout flow cards
- [ ] Add loading skeletons

### Phase 2: Core Experience (Week 3-4)
- [ ] Enhance Workout Execution screen
- [ ] Add progress visualizations
- [ ] Improve interval indicators
- [ ] Update Let Us Curate screen
- [ ] Add success/error feedback
- [ ] Implement onboarding flow

### Phase 3: Polish (Week 5-6)
- [ ] Add animations
- [ ] Implement haptic feedback
- [ ] Create progress dashboard
- [ ] Add accessibility features
- [ ] Performance optimization
- [ ] User testing & iteration

---

## Resources

### Design Tools
- Figma/Sketch for mockups
- React Native Reanimated for animations
- React Native Gesture Handler for interactions
- Lottie for complex animations

### Inspiration
- Nike Training Club (workout execution)
- Strava (progress visualization)
- Apple Fitness+ (animations, hierarchy)
- Strong (exercise tracking)

---

**Last Updated**: January 2025  
**Status**: Ready for Implementation
