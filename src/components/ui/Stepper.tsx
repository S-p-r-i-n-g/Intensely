/**
 * Stepper Component
 * Integer-based increment/decrement control
 * Used for Circuits and Sets configuration
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MinusIcon, PlusIcon } from 'react-native-heroicons/outline';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../../tokens';
import { useTheme } from '../../theme';

interface StepperProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onIncrease,
  onDecrease,
  min = 1,
  max = 10,
  label,
  size = 'medium',
}) => {
  const { theme } = useTheme();
  const canDecrease = value > min;
  const canIncrease = value < max;

  const iconSize = size === 'small' ? 18 : size === 'large' ? 28 : 24;
  const buttonSize = size === 'small' ? 36 : size === 'large' ? 56 : 48;
  const valueFontSize = size === 'small' ? 20 : size === 'large' ? 36 : 28;

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="bodyLarge" style={[styles.label, { color: theme.text.primary }]}>
          {label}
        </Text>
      )}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={onDecrease}
          disabled={!canDecrease}
          style={[
            styles.button,
            {
              backgroundColor: theme.background.elevated,
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
            !canDecrease && styles.buttonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <MinusIcon
            size={iconSize}
            color={canDecrease ? colors.primary[500] : colors.secondary[400]}
          />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text
            variant="h1"
            style={[
              styles.value,
              { color: theme.text.primary, fontSize: valueFontSize },
            ]}
          >
            {value}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onIncrease}
          disabled={!canIncrease}
          style={[
            styles.button,
            {
              backgroundColor: theme.background.elevated,
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
            !canIncrease && styles.buttonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <PlusIcon
            size={iconSize}
            color={canIncrease ? colors.primary[500] : colors.secondary[400]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontWeight: '600',
    marginBottom: spacing[3],
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[5],
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueContainer: {
    minWidth: 60,
    alignItems: 'center',
  },
  value: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Stepper;
