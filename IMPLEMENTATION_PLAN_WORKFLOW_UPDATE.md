# Implementation Plan: Home Screen Workflow Update

**Feature:** `feature-workflow-update-1.md`
**Version:** 3.0
**Created:** 2026-01-21
**Updated:** 2026-01-21

---

## Executive Summary

This plan updates the Home screen navigation flow and enhances the Workouts screen to support direct workout launching. The key changes are:

1. **Home Screen**: "Start Workout" navigates to My Workouts list (instead of JumpRightIn)
2. **WorkoutsScreen**: Add "Start Workout" button to each workout card
3. **Empty State**: Add "Create your first workout" CTA when no workouts exist

---

## Project Context

### Design Philosophy (from design.md)
- **Zero Friction**: Users should reach their workout in seconds, not minutes
- **Progressive Disclosure**: Simple by default, powerful when needed
- **Mobile-First**: Optimized for thumb zones, one-handed use

### Current Architecture
- **Framework:** React Native with Expo + TypeScript
- **Navigation:** React Navigation v7.x with Drawer Navigator
- **State:** Zustand stores (auth, workouts, sessions)
- **Design Tokens:** Located in `src/tokens/` (colors, spacing, typography, effects, borders)

---

## Current State Analysis

### Home Screen CTAs (Current)
| Button | Variant | Navigation Target |
|--------|---------|-------------------|
| Start Workout | primary | `JumpRightIn` |
| New Workout | secondary | `TakeTheWheel` |
| Exercise Library | secondary | `Exercises` |

### WorkoutsScreen (Current)
**File:** `src/screens/workouts/WorkoutsScreen.tsx`
- Displays user's saved workouts in card format
- Tapping a card navigates to `WorkoutPreview`
- Empty state shows: "No Workouts Yet - Create your first workout from the Home tab"
- No direct "Start Workout" action on cards

---

## Proposed Changes

### New Workflow Structure
```
Home
├── Start Workout → Workouts (My Workouts list)
│   ├── [Workout Card] + "Start" button → WorkoutPreview/WorkoutExecution
│   └── Empty State: "Create your first workout" → TakeTheWheel
│
├── New Workout → TakeTheWheel
│
└── Exercise Library → Exercises (unchanged)
```

### Summary of Changes

| Location | Change |
|----------|--------|
| Home Screen | "Start Workout" now navigates to WorkoutsList |
| WorkoutsScreen | Add "Start" button to each workout card |
| WorkoutsScreen | Update empty state with "Create your first workout" CTA |

---

## Visual Mockups

### Home Screen (Updated Navigation)
```
┌─────────────────────────────────────────┐
│  Hi, Daniel!                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ▶  Start Workout                │    │  → Navigates to My Workouts
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ +  New Workout                  │    │  → Navigates to TakeTheWheel
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔍  Exercise Library            │    │  → Navigates to Exercises
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### WorkoutsScreen - With Workouts
```
┌─────────────────────────────────────────┐
│  My Workouts                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Morning HIIT          [Start ▶]│    │  ← Start button on card
│  │  Fat Burn • 3 circuits • 20min  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Full Body Blast       [Start ▶]│    │
│  │  Strength • 4 circuits • 30min  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Quick Core            [Start ▶]│    │
│  │  Core • 2 circuits • 10min      │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### WorkoutsScreen - Empty State (Updated)
```
┌─────────────────────────────────────────┐
│  My Workouts                            │
│                                         │
│                                         │
│              💪                         │
│                                         │
│        No Workouts Yet                  │
│                                         │
│    You haven't created any workouts.    │
│    Let's fix that!                      │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  + Create Your First Workout    │   │  ← Primary CTA button
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Design System Specifications

### Token References (from design.md)

**Spacing:**
```typescript
spacing[2] = 8px   // Gap between card content and button
spacing[3] = 12px  // Button padding
spacing[4] = 16px  // Card padding
```

**Colors:**
```typescript
// Start button on workout card
backgroundColor: colors.primary[500]  // '#FF0000' (coral/red)
textColor: '#FFFFFF'

// Empty state CTA button
backgroundColor: '#000000'
textColor: '#FFFFFF'
```

**Touch Targets:**
```typescript
minHeight: 44px  // Start button (compact, in-card)
minHeight: 48px  // Empty state CTA button
```

---

## Implementation Tasks

### Phase 1: HomeScreen Navigation Update

#### Task 1.1: Update Start Workout Navigation
**File:** `src/screens/home/HomeScreen.tsx`

Change the "Start Workout" button to navigate to the Workouts list:

```typescript
// Before
onPress={() => navigation.navigate('Home', { screen: 'JumpRightIn' })}

// After
onPress={() => navigation.navigate('Workouts', { screen: 'WorkoutsList' })}
```

**Lines affected:** ~59-62

---

### Phase 2: WorkoutsScreen Enhancements

#### Task 2.1: Add Start Button to Workout Cards
**File:** `src/screens/workouts/WorkoutsScreen.tsx`

Update `renderWorkoutCard` to include a "Start" button:

```typescript
const renderWorkoutCard = ({ item }: { item: Workout }) => {
  const primaryObjective = item.objectiveMappings?.[0]?.objective;

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutPreview', { workoutId: item.id });
  };

  return (
    <TouchableOpacity
      style={[styles.workoutCard, { backgroundColor: theme.background.secondary }]}
      onPress={() => navigation.navigate('WorkoutPreview', { workoutId: item.id })}
    >
      <View style={styles.workoutHeader}>
        <Text style={[styles.workoutName, { color: theme.text.primary }]}>
          {item.name}
        </Text>

        {/* New Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <PlayIcon size={16} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>

      {/* ... rest of card content ... */}
    </TouchableOpacity>
  );
};
```

#### Task 2.2: Add Start Button Styles
**File:** `src/screens/workouts/WorkoutsScreen.tsx`

```typescript
startButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.primary[500],
  paddingHorizontal: spacing[3],
  paddingVertical: spacing[2],
  borderRadius: borderRadius.full, // Pill shape
  gap: 4,
},
startButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},
```

#### Task 2.3: Update Empty State with CTA
**File:** `src/screens/workouts/WorkoutsScreen.tsx`

Update the empty state section:

```typescript
if (workouts.length === 0) {
  return (
    <View style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
      <Text style={styles.emptyIcon}>💪</Text>
      <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
        No Workouts Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
        You haven't created any workouts.{'\n'}Let's fix that!
      </Text>

      {/* New CTA Button */}
      <TouchableOpacity
        style={styles.createWorkoutButton}
        onPress={() => navigation.navigate('Home', {
          screen: 'TakeTheWheel',
          params: {}
        })}
      >
        <PlusIcon size={20} color="#FFFFFF" />
        <Text style={styles.createWorkoutButtonText}>
          Create Your First Workout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

#### Task 2.4: Add Empty State CTA Styles
**File:** `src/screens/workouts/WorkoutsScreen.tsx`

```typescript
createWorkoutButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000000',
  paddingHorizontal: spacing[6],
  paddingVertical: spacing[4],
  borderRadius: 100, // Pill shape
  marginTop: spacing[6],
  gap: spacing[2],
},
createWorkoutButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},
```

#### Task 2.5: Add Required Imports
**File:** `src/screens/workouts/WorkoutsScreen.tsx`

```typescript
import { PlayIcon, PlusIcon } from 'react-native-heroicons/outline';
```

---

### Phase 3: Navigation Verification

#### Task 3.1: Verify Navigation from Empty State
The empty state needs to navigate to TakeTheWheel in the Home stack. This requires proper drawer/stack navigation:

```typescript
// From WorkoutsScreen (in Workouts stack) to TakeTheWheel (in Home stack)
navigation.getParent()?.navigate('Home', {
  screen: 'TakeTheWheel',
  params: {}
});
```

May need to adjust based on actual navigation hierarchy testing.

---

## File Changes Summary

| File | Action | Changes |
|------|--------|---------|
| `src/screens/home/HomeScreen.tsx` | Modify | Update "Start Workout" navigation target |
| `src/screens/workouts/WorkoutsScreen.tsx` | Modify | Add Start button to cards, update empty state |

**No new files required.**

---

## Testing Checklist

### HomeScreen Tests
- [ ] "Start Workout" navigates to WorkoutsList
- [ ] "New Workout" navigates to TakeTheWheel (unchanged)
- [ ] "Exercise Library" navigates to Exercises (unchanged)

### WorkoutsScreen Tests
- [ ] Start button appears on each workout card
- [ ] Tapping Start button navigates to WorkoutPreview
- [ ] Tapping card (not Start button) still navigates to WorkoutPreview
- [ ] Start button has proper touch target (no accidental misses)

### Empty State Tests
- [ ] "Create Your First Workout" button appears when no workouts
- [ ] Button navigates to TakeTheWheel
- [ ] After creating first workout, empty state no longer shows

### Visual Tests
- [ ] Start button styling matches design system (primary color, pill shape)
- [ ] Empty state CTA is visually prominent
- [ ] Light mode renders correctly
- [ ] Dark mode renders correctly

---

## Rollback Plan

If issues arise:
1. Revert HomeScreen navigation back to JumpRightIn
2. Remove Start button from workout cards
3. Restore original empty state text

No database or navigation structure changes required.

---

## Post-Implementation

After approval and implementation:
1. Update `projectplan.md` with task completion
2. Create checkpoint: `WORKFLOW_UPDATE_V1`
3. Test on iOS and Android simulators
4. Verify navigation works correctly across drawer/stack boundaries

---

## Open Questions (None Currently)

All clarifications received:
- ✅ Exercise Library remains on Home screen
- ✅ No expandable behavior - direct navigation to My Workouts
- ✅ Empty state gets "Create your first workout" CTA

---

## Approval Request

Please review this updated implementation plan and confirm:
1. The workflow changes are correct
2. The visual mockups align with your vision
3. Ready to proceed with implementation

Once approved, I will begin implementation and track progress.
