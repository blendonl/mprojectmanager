import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';

interface DateNavigatorProps {
  label: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onDatePress: () => void;
  onTodayPress: () => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  label,
  onPreviousDay,
  onNextDay,
  onDatePress,
  onTodayPress,
}) => {
  const buttonHitSlop = { top: 6, right: 6, bottom: 6, left: 6 };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={onPreviousDay}
        hitSlop={buttonHitSlop}
        accessibilityLabel="Previous day"
        accessibilityRole="button"
        accessibilityHint="Navigate to the previous day"
      >
        <AppIcon name="arrow-left" size={16} color={theme.text.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={onDatePress}
        accessibilityLabel={`Selected date: ${label}`}
        accessibilityRole="button"
        accessibilityHint="Open calendar picker"
      >
        <Text style={styles.dateLabel}>{label}</Text>
      </TouchableOpacity>
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onDatePress}
          hitSlop={buttonHitSlop}
          accessibilityLabel="Open calendar"
          accessibilityRole="button"
        >
          <AppIcon name="calendar" size={16} color={theme.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={onTodayPress}
          accessibilityLabel="Go to today"
          accessibilityRole="button"
        >
          <Text style={styles.todayText}>Today</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={onNextDay}
        hitSlop={buttonHitSlop}
        accessibilityLabel="Next day"
        accessibilityRole="button"
        accessibilityHint="Navigate to the next day"
      >
        <AppIcon name="arrow-right" size={16} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  dateButton: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.accent.primary,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.background.primary,
  },
});
