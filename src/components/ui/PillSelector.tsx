/**
 * PillSelector Component
 * Segmented control for selecting from predefined options
 * Used for timing fields (Work, Rest, etc.)
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../../tokens';
import { useTheme } from '../../theme';

export interface PillOption {
  value: number;
  label: string;
}

interface PillSelectorProps {
  options: PillOption[];
  currentValue: number;
  onChange: (value: number) => void;
  label?: string;
  scrollable?: boolean;
}

export const PillSelector: React.FC<PillSelectorProps> = ({
  options,
  currentValue,
  onChange,
  label,
  scrollable = false,
}) => {
  const { theme } = useTheme();

  const renderPills = () => (
    <View style={[styles.pillContainer, scrollable && styles.pillContainerScrollable]}>
      {options.map((opt) => {
        const isActive = currentValue === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.pill,
              { backgroundColor: theme.background.elevated, borderColor: theme.border.medium },
              isActive && styles.pillActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              variant="body"
              style={[
                styles.label,
                { color: theme.text.primary },
                isActive && styles.labelActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="bodyLarge" style={[styles.sectionLabel, { color: theme.text.primary }]}>
          {label}
        </Text>
      )}
      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderPills()}
        </ScrollView>
      ) : (
        renderPills()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  pillContainerScrollable: {
    flexWrap: 'nowrap',
  },
  scrollContent: {
    paddingRight: spacing[4],
  },
  pill: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});

export default PillSelector;
