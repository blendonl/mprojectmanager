import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AgendaViewMode } from 'shared-types';
import { spacing } from '@shared/theme/spacing';
import theme from '@shared/theme/colors';

interface AgendaViewSwitcherProps {
  value: AgendaViewMode;
  onChange: (mode: AgendaViewMode) => void;
}

const OPTIONS: Array<{ label: string; value: AgendaViewMode }> = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

export const AgendaViewSwitcher: React.FC<AgendaViewSwitcherProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${option.label} view`}
          >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: theme.background.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border.primary,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: theme.accent.primary,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  optionTextActive: {
    color: theme.background.primary,
    fontWeight: '700',
  },
});
