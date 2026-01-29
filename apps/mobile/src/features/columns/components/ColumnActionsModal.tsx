import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Column } from '../domain/entities/Column';
import BaseModal from '@shared/components/BaseModal';
import theme from '@shared/theme';
import AppIcon, { AppIconName } from '@shared/components/icons/AppIcon';

interface ActionItem {
  id: string;
  icon: AppIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  badge?: string | number;
}

interface ColumnActionsModalProps {
  visible: boolean;
  column: Column | null;
  onClose: () => void;
  onRename: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onClearTasks: () => void;
  onMoveAllTasks: () => void;
  onDelete: () => void;
}

const ColumnActionsModal: React.FC<ColumnActionsModalProps> = ({
  visible,
  column,
  onClose,
  onRename,
  onMoveLeft,
  onMoveRight,
  onClearTasks,
  onMoveAllTasks,
  onDelete,
}) => {
  if (!column) return null;

  const taskCount = column.tasks.length;
  const canDelete = taskCount === 0;

  const actions: ActionItem[] = [
    {
      id: 'rename',
      icon: 'create-outline',
      label: 'Rename Column',
      onPress: () => {
        onClose();
        onRename();
      },
    },
    {
      id: 'move-left',
      icon: 'arrow-back',
      label: 'Move Left',
      onPress: () => {
        onClose();
        onMoveLeft();
      },
    },
    {
      id: 'move-right',
      icon: 'arrow-forward',
      label: 'Move Right',
      onPress: () => {
        onClose();
        onMoveRight();
      },
    },
    {
      id: 'move-all-tasks',
      icon: 'git-compare',
      label: 'Move All Tasks',
      onPress: () => {
        onClose();
        onMoveAllTasks();
      },
      disabled: taskCount === 0,
      badge: taskCount > 0 ? taskCount : undefined,
    },
    {
      id: 'clear-tasks',
      icon: 'trash-outline',
      label: 'Clear All Tasks',
      onPress: () => {
        onClose();
        onClearTasks();
      },
      disabled: taskCount === 0,
      destructive: true,
      badge: taskCount > 0 ? taskCount : undefined,
    },
    {
      id: 'delete',
      icon: 'trash',
      label: 'Delete Column',
      onPress: () => {
        onClose();
        onDelete();
      },
      disabled: !canDelete,
      destructive: true,
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={column.name}
    >
      <View style={styles.container}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionItem,
              action.disabled && styles.actionItemDisabled,
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View
                style={[
                  styles.iconContainer,
                  action.destructive && styles.iconContainerDestructive,
                ]}
              >
                <AppIcon
                  name={action.icon}
                  size={20}
                  color={
                    action.disabled
                      ? theme.colors.textTertiary
                      : action.destructive
                      ? theme.colors.error
                      : theme.colors.text
                  }
                />
              </View>
              <Text
                style={[
                  styles.actionLabel,
                  action.disabled && styles.actionLabelDisabled,
                  action.destructive && styles.actionLabelDestructive,
                ]}
              >
                {action.label}
              </Text>
            </View>

            {action.badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{action.badge}</Text>
              </View>
            )}

            {action.disabled && action.id === 'delete' && (
              <Text style={styles.disabledHint}>Clear tasks first</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  actionItemDisabled: {
    opacity: 0.5,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconContainerDestructive: {
    backgroundColor: theme.colors.error + '20',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  actionLabelDisabled: {
    color: theme.colors.textTertiary,
  },
  actionLabelDestructive: {
    color: theme.colors.error,
  },
  badge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: theme.spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  disabledHint: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },
});

export default ColumnActionsModal;
