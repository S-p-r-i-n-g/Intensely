import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './ui/Button';
import { useTheme } from '../theme/ThemeContext';
import { colors, spacing } from '../tokens';
import { BoltIcon } from 'react-native-heroicons/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.iconContainer}>
        <BoltIcon size={48} color={colors.primary[500]} strokeWidth={1.5} />
      </View>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.text.secondary }]}>
        {description}
      </Text>
      <Button onPress={onPress} variant="primary" size="large">
        {buttonText}
      </Button>
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
  iconContainer: {
    backgroundColor: 'rgba(217, 45, 32, 0.1)',
    padding: spacing[6],
    borderRadius: 9999,
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing[8],
    paddingHorizontal: spacing[4],
  },
});
