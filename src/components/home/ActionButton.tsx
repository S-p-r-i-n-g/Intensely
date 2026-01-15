import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../../tokens';

interface ActionButtonProps {
  title: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon,
  variant = 'secondary',
  onPress,
  style,
  testID,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      onPress={onPress}
      testID={testID}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, isPrimary ? styles.primaryText : styles.secondaryText]}>
        {title}
      </Text>
      {icon && <>{icon}</>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 100, // Pill shape
    marginBottom: 12,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
});

export default ActionButton;
