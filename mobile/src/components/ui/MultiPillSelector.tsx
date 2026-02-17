import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';
import { spacing, borderRadius, colors } from '../../tokens';

export interface PillOption {
  value: string;
  label: string;
}

interface MultiPillSelectorProps {
  options: PillOption[];
  selected: string | string[];
  onToggle: (value: string) => void;
  multiSelect?: boolean;
  label?: string;
}

export const MultiPillSelector: React.FC<MultiPillSelectorProps> = ({
  options,
  selected,
  onToggle,
  multiSelect = false,
  label,
}) => {
  const { theme } = useTheme();

  const isSelected = (value: string) =>
    multiSelect ? (selected as string[]).includes(value) : selected === value;

  return (
    <View>
      {label && (
        <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>
      )}
      <View style={styles.pillContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.pill,
              { borderColor: theme.border.medium, backgroundColor: theme.background.primary },
              isSelected(opt.value) && styles.pillActive,
            ]}
            onPress={() => onToggle(opt.value)}
          >
            <Text
              style={[
                styles.pillText,
                { color: theme.text.secondary },
                isSelected(opt.value) && styles.pillTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing[2],
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  pill: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pillText: {
    fontSize: 14,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
