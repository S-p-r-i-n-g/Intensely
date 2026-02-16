import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ExerciseAnimation from './ExerciseAnimation';
import ExerciseAnimationAdvanced from './ExerciseAnimationAdvanced';

/**
 * ExerciseAnimation Usage Examples
 *
 * This file demonstrates various use cases for the ExerciseAnimation components.
 */

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export const BasicExample = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Basic Usage</Text>
      <ExerciseAnimation slug="push-up" size="compact" />
    </View>
  );
};

// ============================================================================
// Example 2: Different Sizes
// ============================================================================

export const SizesExample = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Different Sizes</Text>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Compact</Text>
          <ExerciseAnimation slug="push-up" size="compact" />
        </View>
        <View style={styles.column}>
          <Text style={styles.label}>Expanded</Text>
          <ExerciseAnimation slug="push-up" size="expanded" />
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// Example 3: Exercise Library Grid
// ============================================================================

export const LibraryGridExample = () => {
  const exercises = [
    'push-up',
    'bodyweight-squat',
    'lunge',
    'plank',
    'burpee',
    'mountain-climber',
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Exercise Library Grid</Text>
      <View style={styles.grid}>
        {exercises.map((slug) => (
          <View key={slug} style={styles.gridItem}>
            <ExerciseAnimation slug={slug} size="compact" />
            <Text style={styles.gridLabel}>
              {slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// Example 4: Exercise Detail View
// ============================================================================

export const ExerciseDetailExample = () => {
  const exercise = {
    slug: 'push-up',
    name: 'Push-Up',
    description: 'A fundamental upper body exercise targeting chest, shoulders, and triceps.',
    instructions: [
      'Start in plank position with hands shoulder-width apart',
      'Lower body until chest nearly touches ground',
      'Push back up to starting position',
      'Keep core engaged throughout movement',
    ],
  };

  return (
    <ScrollView style={styles.section}>
      <Text style={styles.heading}>{exercise.name}</Text>

      {/* Large animation at top */}
      <View style={styles.detailAnimation}>
        <ExerciseAnimation slug={exercise.slug} size="expanded" />
      </View>

      <Text style={styles.description}>{exercise.description}</Text>

      <Text style={styles.subheading}>Instructions</Text>
      {exercise.instructions.map((instruction, index) => (
        <View key={index} style={styles.instructionRow}>
          <Text style={styles.instructionNumber}>{index + 1}.</Text>
          <Text style={styles.instructionText}>{instruction}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

// ============================================================================
// Example 5: With Loading/Error Callbacks
// ============================================================================

export const CallbacksExample = () => {
  const [status, setStatus] = React.useState('idle');

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>With Callbacks</Text>
      <ExerciseAnimation
        slug="push-up"
        size="compact"
        onLoadStart={() => setStatus('loading...')}
        onLoadEnd={() => setStatus('loaded!')}
        onError={(error) => setStatus(`error: ${error.message}`)}
      />
      <Text style={styles.status}>Status: {status}</Text>
    </View>
  );
};

// ============================================================================
// Example 6: Advanced - Auto Format Selection
// ============================================================================

export const AdvancedAutoExample = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Advanced - Auto Format</Text>
      <Text style={styles.caption}>
        Automatically selects best format (Lottie if available, WebP fallback)
      </Text>
      <ExerciseAnimationAdvanced
        slug="push-up"
        size="medium"
        format="auto"
        showLabel
      />
    </View>
  );
};

// ============================================================================
// Example 7: Advanced - Lottie with Custom Speed
// ============================================================================

export const AdvancedLottieExample = () => {
  const [speed, setSpeed] = React.useState(1.0);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Advanced - Lottie Controls</Text>
      <ExerciseAnimationAdvanced
        slug="push-up"
        size="medium"
        format="lottie"
        speed={speed}
        showLabel
      />
      <View style={styles.controls}>
        <Text style={styles.controlLabel}>Speed: {speed.toFixed(1)}x</Text>
        <View style={styles.buttonRow}>
          <Text style={styles.button} onPress={() => setSpeed(0.5)}>
            0.5x
          </Text>
          <Text style={styles.button} onPress={() => setSpeed(1.0)}>
            1.0x
          </Text>
          <Text style={styles.button} onPress={() => setSpeed(2.0)}>
            2.0x
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// Example 8: Workout Builder Preview
// ============================================================================

export const WorkoutBuilderExample = () => {
  const workout = [
    { slug: 'push-up', sets: 3, reps: 10 },
    { slug: 'bodyweight-squat', sets: 3, reps: 15 },
    { slug: 'plank', sets: 3, duration: '30s' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Workout Builder</Text>
      {workout.map((exercise, index) => (
        <View key={index} style={styles.workoutRow}>
          <ExerciseAnimation slug={exercise.slug} size="compact" />
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>
              {exercise.slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            <Text style={styles.workoutDetails}>
              {exercise.sets} sets × {exercise.reps ? `${exercise.reps} reps` : exercise.duration}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// Example 9: Custom CDN URL
// ============================================================================

export const CustomCDNExample = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Custom CDN URL</Text>
      <ExerciseAnimation
        slug="push-up"
        size="compact"
        cdnBaseUrl="https://custom-cdn.example.com"
      />
    </View>
  );
};

// ============================================================================
// Example 10: Progressive Loading (Multiple Exercises)
// ============================================================================

export const ProgressiveLoadingExample = () => {
  const exercises = [
    'push-up',
    'bodyweight-squat',
    'lunge',
    'plank',
    'burpee',
    'mountain-climber',
    'jumping-jack',
    'high-knees',
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Progressive Loading</Text>
      <Text style={styles.caption}>
        Animations load on-demand as you scroll
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {exercises.map((slug) => (
          <View key={slug} style={styles.carouselItem}>
            <ExerciseAnimation slug={slug} size="compact" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// Full Demo Screen
// ============================================================================

export const ExerciseAnimationDemo = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ExerciseAnimation Demo</Text>

      <BasicExample />
      <SizesExample />
      <LibraryGridExample />
      <CallbacksExample />
      <AdvancedAutoExample />
      <WorkoutBuilderExample />
      <ProgressiveLoadingExample />
    </ScrollView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111827',
  },
  section: {
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  caption: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 24,
  },
  column: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    alignItems: 'center',
    width: 120,
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  detailAnimation: {
    alignItems: 'center',
    marginVertical: 24,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  controls: {
    marginTop: 16,
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    borderRadius: 6,
    overflow: 'hidden',
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  carouselItem: {
    marginRight: 16,
  },
});

export default ExerciseAnimationDemo;
