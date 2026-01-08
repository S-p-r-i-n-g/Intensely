import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary data and may free up storage space. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const renderToggle = (value: boolean) => (
    <View style={[styles.toggle, value && styles.toggleActive]}>
      <View style={[styles.toggleCircle, value && styles.toggleCircleActive]} />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive workout reminders and updates
            </Text>
          </View>
          {renderToggle(notificationsEnabled)}
        </TouchableOpacity>
      </View>

      {/* App Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Experience</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Text style={styles.settingDescription}>
              Play sounds during workouts
            </Text>
          </View>
          {renderToggle(soundEnabled)}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setHapticEnabled(!hapticEnabled)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Text style={styles.settingDescription}>
              Vibrate on timer transitions
            </Text>
          </View>
          {renderToggle(hapticEnabled)}
        </TouchableOpacity>
      </View>

      {/* Data & Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleClearCache}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Clear Cache</Text>
            <Text style={styles.actionDescription}>
              Free up storage space
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Coming Soon', 'Export data feature coming soon!');
          }}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Export Data</Text>
            <Text style={styles.actionDescription}>
              Download your workout history
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Coming Soon', 'Help & FAQ will be available soon!');
          }}
        >
          <Text style={styles.actionIcon}>❓</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Help & FAQ</Text>
            <Text style={styles.actionDescription}>
              Get answers to common questions
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Contact Support', 'Email: support@intensely-app.com\n\nWe typically respond within 24 hours.');
          }}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Contact Support</Text>
            <Text style={styles.actionDescription}>
              Get help from our team
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Coming Soon', 'Privacy policy will be available soon!');
          }}
        >
          <Text style={styles.actionIcon}>🔒</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Privacy Policy</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Alert.alert('Coming Soon', 'Terms of service will be available soon!');
          }}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Terms of Service</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.versionSubtext}>Build 2026.01.08</Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: '#E5E5E5',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF6B35',
  },
  toggleCircle: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#666',
  },
  actionArrow: {
    fontSize: 18,
    color: '#999',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
