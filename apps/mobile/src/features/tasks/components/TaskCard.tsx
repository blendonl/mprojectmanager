import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Task } from '../domain/entities/Task';
import { Parent } from '@domain/entities/Parent';
import { TaskPriority } from '@mprojectmanager/shared-types';
import ParentBadge from '@shared/components/ParentBadge';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';

interface TaskCardProps {
  task: Task;
  parent?: Parent;
  onPress: () => void;
  onLongPress?: () => void;
  isLoading?: boolean;
  showDragHandle?: boolean;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: '#DC2626',
  [TaskPriority.HIGH]: '#EA580C',
  [TaskPriority.MEDIUM]: '#CA8A04',
  [TaskPriority.LOW]: '#64748B',
};

const TaskCard: React.FC<TaskCardProps> = React.memo(({
  task,
  parent,
  onPress,
  onLongPress,
  isLoading = false,
  showDragHandle = false,
}) => {
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS[TaskPriority.LOW];

  return (
    <TouchableOpacity
      style={[styles.card, isLoading && styles.cardLoading]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          {showDragHandle && (
            <View style={styles.dragHandle}>
              <AppIcon name="reorder-two" size={18} color={theme.colors.textSecondary} />
            </View>
          )}

          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>
              {task.title}
            </Text>

            {task.isOverdue && (
              <View style={styles.dueDateBadge}>
                <AppIcon name="time" size={12} color={theme.colors.error} />
                <Text style={[styles.dueDateText, styles.dueDateOverdue]}>Overdue</Text>
              </View>
            )}

            {!task.isOverdue && task.isDueSoon && (
              <View style={styles.dueDateBadge}>
                <AppIcon name="time" size={12} color={theme.colors.warning} />
                <Text style={[styles.dueDateText, styles.dueDateSoon]}>Due Soon</Text>
              </View>
            )}
          </View>
        </View>

        {parent && (
          <View style={styles.parentContainer}>
            <ParentBadge name={parent.name} color={parent.color} size="small" />
          </View>
        )}

        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.badges}>
            {task.isMeeting && (
              <View style={styles.typeBadge}>
                <AppIcon name="videocam" size={12} color={theme.colors.primary} />
                <Text style={styles.typeBadgeText}>Meeting</Text>
              </View>
            )}

            {task.isMilestone && (
              <View style={styles.typeBadge}>
                <AppIcon name="flag" size={12} color={theme.colors.success} />
                <Text style={styles.typeBadgeText}>Milestone</Text>
              </View>
            )}

            {task.priority === TaskPriority.URGENT && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>URGENT</Text>
              </View>
            )}
          </View>

          {task.id && (
            <Text style={styles.taskId}>{task.id}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

TaskCard.displayName = 'TaskCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  cardLoading: {
    opacity: 0.6,
  },
  priorityIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  dragHandle: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  dueDateOverdue: {
    color: theme.colors.error,
  },
  dueDateSoon: {
    color: theme.colors.warning,
  },
  parentContainer: {
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceVariant,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  taskId: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontFamily: 'monospace',
  },
});

export default TaskCard;
