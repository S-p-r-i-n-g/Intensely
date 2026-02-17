import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../../theme';
import { Text } from './Text';
import { spacing, borderRadius } from '../../tokens';

interface AccordionProps {
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  summary,
  isOpen,
  onToggle,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.accordion, { backgroundColor: theme.background.elevated }]}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
        <View>
          <Text style={[styles.accordionTitle, { color: theme.text.primary }]}>{title}</Text>
          {!isOpen && (
            <Text style={[styles.accordionSummary, { color: theme.text.secondary }]}>{summary}</Text>
          )}
        </View>
        {isOpen ? (
          <ChevronUpIcon size={20} color={theme.text.secondary} />
        ) : (
          <ChevronDownIcon size={20} color={theme.text.secondary} />
        )}
      </TouchableOpacity>
      {isOpen && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  accordion: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  accordionSummary: {
    fontSize: 14,
  },
  accordionContent: {
    padding: spacing[4],
    paddingTop: 0,
  },
});
