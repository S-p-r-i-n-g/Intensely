import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing } from '../../tokens';
import { Text } from '../../components/ui';

const ExercisesScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text variant="h2" color="primary">Exercises</Text>
      <Text variant="body" color="secondary">Browse our exercise library</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
});

export default ExercisesScreen;
