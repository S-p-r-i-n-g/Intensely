import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { designTokens } from '../../config/design-tokens';

interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: string;
  style?: ViewStyle;
  testID?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  icon,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: designTokens.spacing.md,
    backgroundColor: designTokens.colors.neutral.surfaceVariant,
    borderRadius: designTokens.borderRadius.md,
    marginHorizontal: designTokens.spacing.xs,
  },
  icon: {
    fontSize: 24,
    marginBottom: designTokens.spacing.xs,
  },
  value: {
    ...designTokens.typography.h2,
    color: designTokens.colors.primary.main,
    marginBottom: designTokens.spacing.xs,
  },
  label: {
    ...designTokens.typography.caption,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
});

export default StatsCard;
