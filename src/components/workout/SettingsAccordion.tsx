/**
 * SettingsAccordion Component
 * Animated collapsible container for workout settings
 * Uses react-native-reanimated for smooth height transitions
 */

import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { ChevronDownIcon } from 'react-native-heroicons/outline';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { colors, spacing, borderRadius } from '../../tokens';
import { useTheme } from '../../theme';

interface SettingsAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  summaryText: string;
  children: React.ReactNode;
  maxHeight?: number;
  title?: string;
}

export const SettingsAccordion: React.FC<SettingsAccordionProps> = ({
  isOpen,
  onToggle,
  summaryText,
  children,
  maxHeight = 500,
  title = 'Settings',
}) => {
  const { theme } = useTheme();
  const animation = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    animation.value = withTiming(isOpen ? 1 : 0, { duration: 300 });
  }, [isOpen, animation]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: interpolate(animation.value, [0, 1], [0, maxHeight]),
    opacity: animation.value,
    overflow: 'hidden',
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 180])}deg` }],
  }));

  return (
    <Card variant="filled" padding="small" style={styles.card}>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.header, { backgroundColor: theme.background.elevated }]}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text variant="bodyLarge" style={[styles.title, { color: theme.text.primary }]}>
            {title}
          </Text>
          <Text variant="bodySmall" style={[styles.summary, { color: theme.text.secondary }]}>
            {summaryText}
          </Text>
        </View>
        <Animated.View style={arrowStyle}>
          <ChevronDownIcon size={20} color={colors.primary[500]} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.body, bodyStyle]}>
        <View style={[styles.bodyContent, { backgroundColor: theme.background.secondary }]}>
          {children}
        </View>
      </Animated.View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderRadius: borderRadius.md,
  },
  headerContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  summary: {
    fontSize: 13,
  },
  body: {
    overflow: 'hidden',
  },
  bodyContent: {
    padding: spacing[4],
    paddingTop: spacing[2],
  },
});

export default SettingsAccordion;
