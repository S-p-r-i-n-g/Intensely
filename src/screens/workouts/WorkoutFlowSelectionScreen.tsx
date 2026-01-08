import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'WorkoutFlowSelection'>;

const WorkoutFlowSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Workout</Text>
        <Text style={styles.subtitle}>Three ways to get started</Text>
      </View>

      <View style={styles.flowsContainer}>
        {/* Jump Right In */}
        <TouchableOpacity
          style={[styles.flowCard, styles.primaryCard]}
          onPress={() => navigation.navigate('JumpRightIn')}
        >
          <Text style={styles.flowIcon}>⚡️</Text>
          <Text style={styles.flowTitle}>Jump Right In</Text>
          <Text style={styles.flowDescription}>
            Get an instant workout based on your preferences. No thinking required.
          </Text>
          <View style={styles.flowBadge}>
            <Text style={styles.flowBadgeText}>FASTEST</Text>
          </View>
        </TouchableOpacity>

        {/* Let Us Curate */}
        <TouchableOpacity
          style={styles.flowCard}
          onPress={() => navigation.navigate('LetUsCurate', {})}
        >
          <Text style={styles.flowIcon}>🎯</Text>
          <Text style={styles.flowTitle}>Let Us Curate</Text>
          <Text style={styles.flowDescription}>
            Choose your goal, then customize duration, difficulty, and constraints.
          </Text>
          <View style={[styles.flowBadge, styles.secondaryBadge]}>
            <Text style={styles.flowBadgeText}>RECOMMENDED</Text>
          </View>
        </TouchableOpacity>

        {/* Take the Wheel */}
        <TouchableOpacity
          style={styles.flowCard}
          onPress={() => navigation.navigate('TakeTheWheel')}
        >
          <Text style={styles.flowIcon}>🛠️</Text>
          <Text style={styles.flowTitle}>Take the Wheel</Text>
          <Text style={styles.flowDescription}>
            Build your own workout from scratch. Choose exercises, sets, and timing.
          </Text>
          <View style={[styles.flowBadge, styles.tertiaryBadge]}>
            <Text style={styles.flowBadgeText}>CUSTOM</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  flowsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  flowCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  primaryCard: {
    backgroundColor: '#FFF5F2',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  flowIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  flowTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  flowDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  flowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  secondaryBadge: {
    backgroundColor: '#4CAF50',
  },
  tertiaryBadge: {
    backgroundColor: '#2196F3',
  },
  flowBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default WorkoutFlowSelectionScreen;
