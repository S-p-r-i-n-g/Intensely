import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useAuthStore, useWorkoutStore } from '../../stores';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuthStore();
  const { loadObjectives, objectives } = useWorkoutStore();
  const [showBackendWarning, setShowBackendWarning] = useState(false);

  useEffect(() => {
    loadObjectives().catch(() => {
      // If objectives fail to load, show backend warning
      setShowBackendWarning(true);
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Backend Warning Banner */}
      {showBackendWarning && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Backend Offline</Text>
            <Text style={styles.warningText}>
              Some features may be limited. Authentication still works!
            </Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello{profile?.firstName ? `, ${profile.firstName}` : ''}!
        </Text>
        <Text style={styles.subtitle}>Ready to work out?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Start</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('JumpRightIn')}
        >
          <Text style={styles.cardTitle}>Jump Right In</Text>
          <Text style={styles.cardDescription}>
            Get an instant workout based on your preferences
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('LetUsCurate', {})}
        >
          <Text style={styles.cardTitle}>Let Us Curate</Text>
          <Text style={styles.cardDescription}>
            Choose your goal and customize your workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('TakeTheWheel')}
        >
          <Text style={styles.cardTitle}>Take the Wheel</Text>
          <Text style={styles.cardDescription}>
            Build your own custom workout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.emptyText}>No recent workouts</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
    padding: 12,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
