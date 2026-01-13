import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing } from '../../tokens';

const ProgressScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>Progress</Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>Track your personal records and achievements</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProgressScreen;
