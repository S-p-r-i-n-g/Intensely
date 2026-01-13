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
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius } from '../../tokens';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

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
    <View style={[styles.toggle, { backgroundColor: theme.border.medium }, value && styles.toggleActive]}>
      <View style={[styles.toggleCircle, value && styles.toggleCircleActive]} />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>Manage your app preferences</Text>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>Notifications</Text>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: theme.border.light }]}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>Push Notifications</Text>
            <Text style={[styles.settingDescription, { color: theme.text.secondary }]}>
              Receive workout reminders and updates
            </Text>
          </View>
          {renderToggle(notificationsEnabled)}
        </TouchableOpacity>
      </View>

      {/* App Experience Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>App Experience</Text>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: theme.border.light }]}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>Sound Effects</Text>
            <Text style={[styles.settingDescription, { color: theme.text.secondary }]}>
              Play sounds during workouts
            </Text>
          </View>
          {renderToggle(soundEnabled)}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: theme.border.light }]}
          onPress={() => setHapticEnabled(!hapticEnabled)}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>Haptic Feedback</Text>
            <Text style={[styles.settingDescription, { color: theme.text.secondary }]}>
              Vibrate on timer transitions
            </Text>
          </View>
          {renderToggle(hapticEnabled)}
        </TouchableOpacity>
      </View>

      {/* Data & Storage Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>Data & Storage</Text>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: theme.border.light }]}
          onPress={handleClearCache}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.text.primary }]}>Clear Cache</Text>
            <Text style={[styles.actionDescription, { color: theme.text.secondary }]}>
              Free up storage space
            </Text>
          </View>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: theme.border.light }]}
          onPress={() => {
            Alert.alert('Coming Soon', 'Export data feature coming soon!');
          }}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.text.primary }]}>Export Data</Text>
            <Text style={[styles.actionDescription, { color: theme.text.secondary }]}>
              Download your workout history
            </Text>
          </View>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>Support</Text>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: theme.border.light }]}
          onPress={() => {
            Alert.alert('Coming Soon', 'Help & FAQ will be available soon!');
          }}
        >
          <Text style={styles.actionIcon}>❓</Text>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.text.primary }]}>Help & FAQ</Text>
            <Text style={[styles.actionDescription, { color: theme.text.secondary }]}>
              Get answers to common questions
            </Text>
          </View>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: theme.border.light }]}
          onPress={() => {
            Alert.alert('Contact Support', 'Email: support@intensely-app.com\n\nWe typically respond within 24 hours.');
          }}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.text.primary }]}>Contact Support</Text>
            <Text style={[styles.actionDescription, { color: theme.text.secondary }]}>
              Get help from our team
            </Text>
          </View>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>Legal</Text>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: theme.border.light }]}
          onPress={() => {
            Alert.alert('Coming Soon', 'Privacy policy will be available soon!');
          }}
        >
          <Text style={styles.actionIcon}>🔒</Text>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.text.primary }]}>Privacy Policy</Text>
          </View>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: theme.border.light }]}
          onPress={() => {
            Alert.alert('Coming Soon', 'Terms of service will be available soon!');
          }}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, { color: theme.text.primary }]}>Terms of Service</Text>
          </View>
          <Text style={[styles.actionArrow, { color: theme.text.tertiary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={[styles.versionText, { color: theme.text.secondary }]}>Version 1.0.0</Text>
        <Text style={[styles.versionSubtext, { color: theme.text.tertiary }]}>Build 2026.01.08</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing[5],
    paddingTop: spacing[7],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing[1],
  },
  settingDescription: {
    fontSize: 13,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.primary[500],
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
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing[0],
  },
  actionDescription: {
    fontSize: 13,
  },
  actionArrow: {
    fontSize: 18,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  versionText: {
    fontSize: 14,
    marginBottom: spacing[1],
  },
  versionSubtext: {
    fontSize: 12,
  },
});

export default SettingsScreen;
