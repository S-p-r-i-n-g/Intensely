import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { designTokens } from '../../config/design-tokens';

interface WorkoutFlowCardProps {
  icon?: string;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'info';
  estimatedTime?: string;
  difficulty?: string;
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const WorkoutFlowCard: React.FC<WorkoutFlowCardProps> = ({
  icon,
  title,
  description,
  badge,
  badgeVariant = 'primary',
  estimatedTime,
  difficulty,
  onPress,
  style,
  testID,
}) => {
  return (
    <Card
      variant="elevated"
      padding="large"
      onPress={onPress}
      style={[styles.card, style]}
      testID={testID}
    >
      <CardContent>
        <View style={styles.header}>
          {badge && (
            <Badge variant={badgeVariant} size="small">
              {badge}
            </Badge>
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {(estimatedTime || difficulty) && (
          <View style={styles.meta}>
            {estimatedTime && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>⏱️</Text>
                <Text style={styles.metaText}>{estimatedTime}</Text>
              </View>
            )}
            {difficulty && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>💪</Text>
                <Text style={styles.metaText}>{difficulty}</Text>
              </View>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: designTokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: designTokens.spacing.sm,
  },
  title: {
    ...designTokens.typography.h3,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  description: {
    ...designTokens.typography.bodyMedium,
    color: designTokens.colors.text.secondary,
    lineHeight: 22,
    marginBottom: designTokens.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaText: {
    ...designTokens.typography.bodySmall,
    color: designTokens.colors.text.secondary,
  },
});

export default WorkoutFlowCard;
