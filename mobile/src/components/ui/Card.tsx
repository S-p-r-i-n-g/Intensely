import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { spacing, borderRadius } from '../../tokens';
import { useTheme } from '../../theme/ThemeContext';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  onPress,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const cardStyle = [
    styles.base,
    variant === 'elevated' && { ...styles.elevated, backgroundColor: theme.background.elevated },
    variant === 'outlined' && { ...styles.outlined, backgroundColor: theme.background.primary, borderColor: theme.border.medium },
    variant === 'filled' && { ...styles.filled, backgroundColor: theme.background.secondary },
    styles[`${padding}Padding`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
  },
  filled: {
    // Background color set dynamically via theme
  },
  smallPadding: {
    padding: spacing[3],
  },
  mediumPadding: {
    padding: spacing[4],
  },
  largePadding: {
    padding: spacing[6],
  },
});

// Card sub-components for structured content
export const CardHeader: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardTitle: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.title, style]}>{children}</View>
);

export const CardContent: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.content, style]}>{children}</View>
);

export const CardActions: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => (
  <View style={[styles.actions, style]}>{children}</View>
);

const subComponentStyles = StyleSheet.create({
  header: {
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  content: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing[4],
    gap: spacing[3],
  },
});

export default Card;
