import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { colors } from '../../tokens';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

/**
 * Reusable pill-shaped filter chip for exercise filter bars.
 */
export const FilterChip = ({ label, active, onPress, icon }: FilterChipProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary[500] : theme.background.secondary,
          borderColor: active ? colors.primary[500] : theme.border.medium,
        },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.label, { color: active ? '#FFFFFF' : theme.text.secondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
