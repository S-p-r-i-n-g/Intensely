# Technical Design Document: Intensely Workflow & "New Workout" Refactor

**Status:** Ready for Implementation

**Target:** Claude Code / Engineering Team

**Project:** Intensely (Mobile)

**Date:** January 2026

---

## 1. Executive Summary

This document outlines the transition of the **Intensely** app from a "randomized" focus to a "structured" fitness model. We are deprecating the "Jump Right In" and "Take the Wheel" terminology in favor of a unified **New Workout** builder and an enhanced **My Workouts** management system.

---

## 2. Navigation & Route Refactor

### Changes

* **Rename Route:** `/take-the-wheel` → `/new-workout`.
* **Home Screen Redirect:**
* **"Start Workout" button:** Navigates to `WorkoutsListScreen`.
* **"New Workout" button:** Navigates to the new `/new-workout` route.


* **Cleanup:** Remove the "Jump Right In" logic and its associated frontend components to reduce technical debt.

---

## 3. "My Workouts" Enhancement

**Location:** `mobile/src/screens/WorkoutsScreen.tsx`

* **Requirement:** Add an inline "Start" action to the workout grid items for high-velocity access.
* **Component Modification:** Update `WorkoutCard.tsx` to include a `PlayIcon` (from `react-native-heroicons`).
* **Logic Integration:**
```typescript
const handleQuickStart = (workoutId: string) => {
  // Direct navigation to the Workout Engine
  navigation.navigate('ActiveWorkout', { id: workoutId });
};

```



---

## 4. "New Workout" Builder Architecture

### A. State Strategy & Sync/Split Logic

We will use a `useReducer` to handle the complex relationship between circuit settings and exercise lists. When a user switches to "Split" mode, we clone the current exercise list to ensure a seamless experience.

**File:** `mobile/src/hooks/useWorkoutBuilder.ts`

```typescript
type WorkoutSettings = {
  work: number;
  rest: number;
  warmUp: number;
  coolDown: number;
  circuits: number;
  sets: number;
};

type WorkoutState = {
  settings: WorkoutSettings;
  isSplit: boolean;
  exercises: Record<number, string[]>; // Key is circuit index: 0, 1, 2...
  activeCircuitTab: number;
};

function workoutReducer(state: WorkoutState, action: Action): WorkoutState {
  switch (action.type) {
    case 'SET_SETTING':
      return { 
        ...state, 
        settings: { ...state.settings, [action.payload.key]: action.payload.value } 
      };

    case 'TOGGLE_SPLIT': {
      const newIsSplit = !state.isSplit;
      let newExercises = { ...state.exercises };

      if (newIsSplit) {
        // CLONING LOGIC: Copy Circuit 1 (index 0) to all other possible circuits
        const baseExercises = state.exercises[0] || [];
        for (let i = 1; i < state.settings.circuits; i++) {
          newExercises[i] = [...baseExercises];
        }
      } else {
        // SYNCING LOGIC: Revert to only using index 0
        newExercises = { 0: [...(state.exercises[0] || [])] };
      }

      return { ...state, isSplit: newIsSplit, exercises: newExercises, activeCircuitTab: 0 };
    }
    // ... additional action handlers for SET_EXERCISES and SET_TAB
  }
}

```

### B. UI Components (Custom Implementation)

#### Pill Selector (Segmented Control)

Used for timing fields (Work, Rest, etc.) using design system tokens.

```tsx
export const PillSelector = ({ options, currentValue, onChange }) => (
  <View style={styles.pillContainer}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt.value}
        onPress={() => onChange(opt.value)}
        style={[styles.pill, currentValue === opt.value && styles.pillActive]}
      >
        <Text style={[styles.label, currentValue === opt.value && styles.labelActive]}>
          {opt.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

```

#### Stepper Component

Used for integer-based fields like Circuits and Sets.

```tsx
export const Stepper = ({ value, onIncrease, onDecrease, min, max }) => (
  <View style={styles.stepperContainer}>
    <TouchableOpacity onPress={onDecrease} disabled={value <= min}>
      <MinusIcon size={24} color={value <= min ? colors.neutral400 : colors.primary} />
    </TouchableOpacity>
    <Text style={styles.stepperValue}>{value}</Text>
    <TouchableOpacity onPress={onIncrease} disabled={value >= max}>
      <PlusIcon size={24} color={value >= max ? colors.neutral400 : colors.primary} />
    </TouchableOpacity>
  </View>
);

```

---

## 5. Summary & Animated Layout (Refined Idea 3)

We use `react-native-reanimated` to expand settings from a collapsed summary state to minimize cognitive load.

**File:** `mobile/src/components/workout/SettingsAccordion.tsx`

```tsx
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolate } from 'react-native-reanimated';

export const SettingsAccordion = ({ isOpen, children, summaryText, onToggle }) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withTiming(isOpen ? 1 : 0, { duration: 300 });
  }, [isOpen]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: interpolate(animation.value, [0, 1], [0, 400]), 
    opacity: animation.value,
    overflow: 'hidden',
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 180])}deg` }]
  }));

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onToggle} style={styles.header}>
        <Text style={typography.bodyLargeBold}>{summaryText}</Text>
        <Animated.View style={arrowStyle}>
          <ChevronDownIcon size={20} color={colors.primary} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={bodyStyle}>{children}</Animated.View>
    </Card>
  );
};

```

---

## 6. Persistence & Final Actions

The footer handles transformation of local state into the persistence model for storage.

**Logic: Save & Persistence**

```typescript
const onSaveWorkout = async (startImmediately: boolean = false) => {
  const workoutData = {
    title: "New Workout", 
    config: state.settings,
    isSplit: state.isSplit,
    exercises: state.exercises, 
    createdAt: new Date().toISOString(),
  };

  const savedWorkout = await workoutService.save(workoutData);

  if (startImmediately) {
    navigation.navigate('ActiveWorkout', { id: savedWorkout.id });
  } else {
    navigation.navigate('WorkoutsList');
  }
};

```

---

## 7. Implementation Task List for Claude Code

1. [ ] **Route Cleanup:** Rename `/take-the-wheel` → `/new-workout`.
2. [ ] **Home Screen:** Update buttons to point to Workouts List and New Builder.
3. [ ] **Hook:** Implement `useWorkoutBuilder` with exercise cloning logic.
4. [ ] **Inputs:** Build `PillSelector` and `Stepper` in `src/components/ui/`.
5. [ ] **Accordion:** Build `SettingsAccordion` with reanimated height interpolation.
6. [ ] **Screen Build:** Combine Accordion, Sync/Split Toggle, and Tab Switcher in `NewWorkoutScreen`.
7. [ ] **Persistence:** Connect "Save" and "Save & Start" to the storage service.
