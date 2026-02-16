# Animation Integration Guide

Complete guide for integrating exercise animations into the Intensely mobile app.

## Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install expo-image

# Optional: For Lottie support
npm install lottie-react-native lottie-ios@3.4.0
cd ios && pod install && cd ..
```

### 2. Configure Environment

Add to `.env`:
```bash
EXPO_PUBLIC_CDN_BASE_URL=https://cdn.intensely.app
```

### 3. Import Component

```tsx
import ExerciseAnimation from '@/components/ExerciseAnimation';

<ExerciseAnimation slug="push-up" size="compact" />
```

## Integration Points

### 1. Exercise Library Screen

**Location:** `src/screens/exercises/ExerciseLibraryScreen.tsx`

**Before:**
```tsx
const renderExercise = ({ item }: { item: Exercise }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
  >
    <Text>{item.name}</Text>
  </TouchableOpacity>
);
```

**After:**
```tsx
import ExerciseAnimation from '@/components/ExerciseAnimation';

const renderExercise = ({ item }: { item: Exercise }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
    style={styles.exerciseCard}
  >
    <ExerciseAnimation
      slug={item.slug}
      size="compact"
      onError={(error) => {
        // Fallback to text-only if animation fails
        console.log(`Animation failed for ${item.slug}`);
      }}
    />
    <Text style={styles.exerciseName}>{item.name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  exerciseCard: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
```

### 2. Exercise Detail Screen

**Location:** `src/screens/exercises/ExerciseDetailScreen.tsx`

**Add large animation at top:**
```tsx
import ExerciseAnimation from '@/components/ExerciseAnimation';

function ExerciseDetailScreen({ route }) {
  const { exercise } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Large animation preview */}
      <View style={styles.animationContainer}>
        <ExerciseAnimation
          slug={exercise.slug}
          size="expanded"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>

      {/* Exercise info */}
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.description}>{exercise.description}</Text>

      {/* Instructions */}
      <Text style={styles.sectionTitle}>Instructions</Text>
      {exercise.instructions?.map((step, index) => (
        <View key={index} style={styles.instructionRow}>
          <Text style={styles.stepNumber}>{index + 1}.</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  animationContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  // ... rest of styles
});
```

### 3. Workout Builder Screen

**Location:** `src/screens/workouts/WorkoutBuilderScreen.tsx`

**Add animations to exercise picker:**
```tsx
import ExerciseAnimation from '@/components/ExerciseAnimation';

const renderExercisePicker = ({ item }: { item: Exercise }) => (
  <TouchableOpacity
    onPress={() => addExerciseToWorkout(item)}
    style={styles.pickerItem}
  >
    <ExerciseAnimation slug={item.slug} size="compact" />
    <Text style={styles.pickerText}>{item.name}</Text>
  </TouchableOpacity>
);

// Workout preview with animations
const renderWorkoutExercise = ({ item, index }: { item: WorkoutExercise; index: number }) => (
  <View style={styles.workoutRow}>
    <ExerciseAnimation slug={item.exercise.slug} size="compact" />
    <View style={styles.workoutInfo}>
      <Text style={styles.workoutName}>{item.exercise.name}</Text>
      <Text style={styles.workoutDetails}>
        {item.sets} sets × {item.reps} reps
      </Text>
    </View>
    <TouchableOpacity onPress={() => removeExercise(index)}>
      <Text style={styles.removeButton}>Remove</Text>
    </TouchableOpacity>
  </View>
);
```

### 4. Active Workout Screen

**Location:** `src/screens/workouts/ActiveWorkoutScreen.tsx`

**Show current exercise animation:**
```tsx
import ExerciseAnimation from '@/components/ExerciseAnimation';

function ActiveWorkoutScreen({ route }) {
  const { workout } = route.params;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <View style={styles.container}>
      {/* Large animation for current exercise */}
      <View style={styles.exercisePreview}>
        <ExerciseAnimation
          slug={currentExercise.exercise.slug}
          size="expanded"
        />
        <Text style={styles.exerciseName}>
          {currentExercise.exercise.name}
        </Text>
      </View>

      {/* Workout controls */}
      <View style={styles.controls}>
        <Text style={styles.setCounter}>
          Set {currentSet} of {currentExercise.sets}
        </Text>
        <Text style={styles.repCounter}>
          {currentExercise.reps} reps
        </Text>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={completeSet}
        >
          <Text style={styles.completeButtonText}>Complete Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### 5. Create Exercise Screen

**Location:** `src/screens/exercises/CreateExerciseScreen.tsx`

**Add animation preview:**
```tsx
import ExerciseAnimation from '@/components/ExerciseAnimation';
import { useExerciseAnimation } from '@/hooks/useExerciseAnimation';

function CreateExerciseScreen({ route }) {
  const [slug, setSlug] = useState('');
  const { url, hasError } = useExerciseAnimation({
    slug,
    format: 'webp',
    preload: false,
  });

  return (
    <ScrollView>
      {/* Existing form fields */}
      <TextInput
        placeholder="Slug"
        value={slug}
        onChangeText={setSlug}
      />

      {/* Animation preview */}
      {slug && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Animation Preview:</Text>
          <ExerciseAnimation
            slug={slug}
            size="compact"
          />
          {hasError && (
            <Text style={styles.errorText}>
              No animation found for this slug
            </Text>
          )}
        </View>
      )}

      {/* Rest of form */}
    </ScrollView>
  );
}
```

## Performance Optimization

### 1. Preload Favorite Exercises

**Location:** `src/contexts/FavoritesContext.tsx` or App entry

```tsx
import { useAutoPreloadFavorites } from '@/hooks/useExerciseAnimation';

function AppContent() {
  const { favorites } = useFavorites();

  // Auto-preload favorite exercise animations
  useAutoPreloadFavorites(
    favorites.map((f) => f.exercise.slug),
    {
      maxPreload: 20,
      format: 'webp',
      enabled: true,
    }
  );

  return <NavigationContainer>{/* ... */}</NavigationContainer>;
}
```

### 2. Lazy Load in Lists

```tsx
import { FlatList } from 'react-native';

<FlatList
  data={exercises}
  renderItem={renderExercise}
  // Performance optimizations
  windowSize={5}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  removeClippedSubviews={true}
  // Use item key for optimal rendering
  keyExtractor={(item) => item.slug}
/>
```

### 3. Implement Virtualized Grid

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={exercises}
  renderItem={renderExercise}
  estimatedItemSize={160}
  numColumns={2}
/>
```

### 4. Cache Management

```tsx
import { useAnimationCache } from '@/hooks/useExerciseAnimation';

function SettingsScreen() {
  const { clearCache } = useAnimationCache();

  const handleClearCache = async () => {
    await clearCache();
    Alert.alert('Success', 'Animation cache cleared');
  };

  return (
    <TouchableOpacity onPress={handleClearCache}>
      <Text>Clear Animation Cache</Text>
    </TouchableOpacity>
  );
}
```

## Error Handling

### 1. Global Error Boundary

```tsx
// src/components/AnimationErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AnimationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Animation error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View>
          <Text>Animation failed to load</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
```

### 2. Use in App

```tsx
<AnimationErrorBoundary>
  <ExerciseAnimation slug={exercise.slug} />
</AnimationErrorBoundary>
```

## Testing

### 1. Component Tests

```tsx
// __tests__/ExerciseAnimation.test.tsx
import { render, waitFor } from '@testing-library/react-native';
import ExerciseAnimation from '@/components/ExerciseAnimation';

describe('ExerciseAnimation', () => {
  it('renders animation for valid slug', async () => {
    const { getByTestId } = render(
      <ExerciseAnimation slug="push-up" size="compact" />
    );

    await waitFor(() => {
      expect(getByTestId('exercise-animation')).toBeTruthy();
    });
  });

  it('shows error state for invalid slug', async () => {
    const { getByTestId } = render(
      <ExerciseAnimation slug="invalid-exercise" />
    );

    await waitFor(() => {
      expect(getByTestId('error-state')).toBeTruthy();
    });
  });
});
```

### 2. Integration Tests

```tsx
it('loads animations in exercise library', async () => {
  const { getAllByTestId } = render(<ExerciseLibraryScreen />);

  await waitFor(() => {
    const animations = getAllByTestId('exercise-animation');
    expect(animations.length).toBeGreaterThan(0);
  });
});
```

## Monitoring

### 1. Track Animation Load Times

```tsx
import * as Analytics from 'expo-firebase-analytics';

<ExerciseAnimation
  slug={exercise.slug}
  onLoadStart={() => {
    const startTime = Date.now();
    // Store startTime
  }}
  onLoadEnd={() => {
    const loadTime = Date.now() - startTime;
    Analytics.logEvent('animation_loaded', {
      slug: exercise.slug,
      load_time: loadTime,
    });
  }}
/>
```

### 2. Track Errors

```tsx
<ExerciseAnimation
  slug={exercise.slug}
  onError={(error) => {
    Analytics.logEvent('animation_error', {
      slug: exercise.slug,
      error: error.message,
    });

    // Send to error tracking service
    Sentry.captureException(error, {
      tags: {
        component: 'ExerciseAnimation',
        slug: exercise.slug,
      },
    });
  }}
/>
```

## Deployment Checklist

Before deploying animations to production:

- [ ] All animations uploaded to CDN
- [ ] CDN URLs configured in `.env`
- [ ] Components integrated into all screens
- [ ] Error handling implemented
- [ ] Loading states tested
- [ ] Performance profiled on low-end devices
- [ ] Cache management implemented
- [ ] Analytics tracking added
- [ ] E2E tests passing
- [ ] iOS and Android tested
- [ ] Fallback UI for offline mode

## Rollout Strategy

### Phase 1: Beta (10% of users)
- Enable animations for beta users
- Monitor performance metrics
- Gather feedback
- Fix critical issues

### Phase 2: Gradual Rollout (50% of users)
- Enable for half of users
- Monitor CDN costs
- Track error rates
- Optimize based on data

### Phase 3: Full Release (100% of users)
- Enable for all users
- Continue monitoring
- Prepare for updates

## Support

For issues or questions:
- GitHub: [anthropics/claude-code](https://github.com/anthropics/claude-code/issues)
- Animation Pipeline: `animation-pipeline/README.md`
- Component Docs: `mobile/src/components/ExerciseAnimation.README.md`

---

**You're ready to launch animations!** 🎉
