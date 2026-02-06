import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';

interface EmptyTimelineStateProps {
  dateLabel: string;
  isToday: boolean;
  onScheduleTask: () => void;
}

export const EmptyTimelineState: React.FC<EmptyTimelineStateProps> = ({
  dateLabel,
  isToday,
  onScheduleTask,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AppIcon name="calendar" size={48} color={theme.text.muted} />
      </View>
      <Text style={styles.title}>
        {isToday ? 'No tasks scheduled today' : 'No tasks scheduled'}
      </Text>
      <Text style={styles.subtitle}>{dateLabel}</Text>
      <TouchableOpacity style={styles.button} onPress={onScheduleTask}>
        <AppIcon name="add" size={16} color={theme.background.primary} />
        <Text style={styles.buttonText}>Schedule a task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: spacing.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.background.primary,
  },
});
