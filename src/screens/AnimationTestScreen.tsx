import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ExerciseAnimation } from '../components/ExerciseAnimation';

/**
 * AnimationTestScreen
 *
 * Quick test screen to verify animations are loading from Vercel Blob CDN.
 * Shows all 5 test exercises in both compact and expanded sizes.
 */
export const AnimationTestScreen = () => {
  const testExercises = [
    'bench-dips',
    'bodyweight-squat',
    'ab-bicycles',
    'ab-walk-outs',
    'body-weight-curtsy-lunges',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Animation Test</Text>
      <Text style={styles.subtitle}>
        CDN: {process.env.EXPO_PUBLIC_CDN_BASE_URL || 'Not configured'}
      </Text>

      <Text style={styles.sectionTitle}>Compact Size (120px)</Text>
      <View style={styles.grid}>
        {testExercises.map((slug) => (
          <View key={slug} style={styles.item}>
            <ExerciseAnimation
              slug={slug}
              size="compact"
              onError={(err) => console.error(`Error loading ${slug}:`, err)}
            />
            <Text style={styles.label}>{slug}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Expanded Size (240px)</Text>
      <View style={styles.gridExpanded}>
        {testExercises.slice(0, 2).map((slug) => (
          <View key={slug} style={styles.itemExpanded}>
            <ExerciseAnimation
              slug={slug}
              size="expanded"
              onLoadStart={() => console.log(`Loading ${slug}...`)}
              onLoadEnd={() => console.log(`Loaded ${slug}!`)}
              onError={(err) => console.error(`Error loading ${slug}:`, err)}
            />
            <Text style={styles.label}>{slug}</Text>
          </View>
        ))}
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          ✅ If animations appear above, the CDN is working!
        </Text>
        <Text style={styles.infoText}>
          ❌ If you see loading spinners or errors, check:
        </Text>
        <Text style={styles.infoSubtext}>
          1. EXPO_PUBLIC_CDN_BASE_URL is set in Vercel
        </Text>
        <Text style={styles.infoSubtext}>
          2. App was redeployed after adding the env var
        </Text>
        <Text style={styles.infoSubtext}>
          3. CDN URLs are accessible (try in browser)
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridExpanded: {
    gap: 24,
  },
  item: {
    alignItems: 'center',
    gap: 8,
  },
  itemExpanded: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 120,
  },
  info: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    paddingLeft: 16,
  },
});

export default AnimationTestScreen;
