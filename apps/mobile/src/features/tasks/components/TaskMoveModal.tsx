import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Column } from '@features/columns';
import { Task } from '../domain/entities/Task';
import BaseModal from '@shared/components/BaseModal';
import { PrimaryButton, SecondaryButton } from '@shared/components/Button';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';

interface TaskMoveModalProps {
  visible: boolean;
  mode: 'single' | 'batch';
  selectedTasks: Task[];
  currentColumnId: string | null;
  targetColumnId: string | null;
  availableColumns: Column[];
  wipLimitWarning: {
    show: boolean;
    severity: 'error' | 'warning' | null;
    message: string;
  };
  isMoving: boolean;
  onSelectColumn: (columnId: string) => void;
  onMove: () => void;
  onClose: () => void;
}

const TaskMoveModal: React.FC<TaskMoveModalProps> = ({
  visible,
  mode,
  selectedTasks,
  currentColumnId,
  targetColumnId,
  availableColumns,
  wipLimitWarning,
  isMoving,
  onSelectColumn,
  onMove,
  onClose,
}) => {
  const taskCount = selectedTasks.length;
  const canMove = targetColumnId !== null && targetColumnId !== currentColumnId;

  const getColumnCapacityInfo = (column: Column) => {
    const currentCount = column.tasks.length;
    const wipLimit = column.wipLimit;

    if (!wipLimit) {
      return { text: `${currentCount} tasks`, severity: null };
    }

    const afterMoveCount = targetColumnId === column.id
      ? currentCount + taskCount
      : currentCount;

    const isAtCapacity = afterMoveCount >= wipLimit;
    const isNearCapacity = afterMoveCount >= wipLimit * 0.8;

    return {
      text: wipLimit ? `${afterMoveCount}/${wipLimit} tasks` : `${afterMoveCount} tasks`,
      severity: isAtCapacity ? 'error' : isNearCapacity ? 'warning' : null,
    };
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={mode === 'batch' ? `Move ${taskCount} Tasks` : 'Move Task'}
    >
      <View style={styles.container}>
        {mode === 'batch' && (
          <View style={styles.batchInfo}>
            <AppIcon name="albums" size={16} color={theme.colors.primary} />
            <Text style={styles.batchInfoText}>
              {taskCount} task{taskCount !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {mode === 'single' && selectedTasks[0] && (
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {selectedTasks[0].title}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Select Target Column</Text>

        <ScrollView style={styles.columnList} showsVerticalScrollIndicator={false}>
          {availableColumns.map((column) => {
            const isCurrent = column.id === currentColumnId;
            const isSelected = column.id === targetColumnId;
            const capacityInfo = getColumnCapacityInfo(column);

            return (
              <TouchableOpacity
                key={column.id}
                style={[
                  styles.columnOption,
                  isCurrent && styles.currentColumn,
                  isSelected && styles.selectedColumn,
                ]}
                onPress={() => onSelectColumn(column.id)}
                disabled={isCurrent || isMoving}
                activeOpacity={0.7}
              >
                <View style={styles.columnLeft}>
                  {column.color && (
                    <View style={[styles.colorIndicator, { backgroundColor: column.color }]} />
                  )}
                  <View style={styles.columnInfo}>
                    <Text
                      style={[
                        styles.columnName,
                        isCurrent && styles.currentColumnText,
                      ]}
                    >
                      {column.name}
                    </Text>
                    <Text
                      style={[
                        styles.columnCount,
                        capacityInfo.severity === 'error' && styles.capacityError,
                        capacityInfo.severity === 'warning' && styles.capacityWarning,
                      ]}
                    >
                      {capacityInfo.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.columnRight}>
                  {isCurrent && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Current</Text>
                    </View>
                  )}
                  {isSelected && !isCurrent && (
                    <AppIcon name="checkmark-circle" size={24} color={theme.colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {wipLimitWarning.show && (
          <View
            style={[
              styles.warningContainer,
              wipLimitWarning.severity === 'error' && styles.warningError,
              wipLimitWarning.severity === 'warning' && styles.warningWarning,
            ]}
          >
            <AppIcon
              name={wipLimitWarning.severity === 'error' ? 'alert-circle' : 'warning'}
              size={20}
              color={
                wipLimitWarning.severity === 'error'
                  ? theme.colors.error
                  : theme.colors.warning
              }
            />
            <Text
              style={[
                styles.warningText,
                wipLimitWarning.severity === 'error' && styles.warningTextError,
                wipLimitWarning.severity === 'warning' && styles.warningTextWarning,
              ]}
            >
              {wipLimitWarning.message}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <SecondaryButton
            title="Cancel"
            onPress={onClose}
            disabled={isMoving}
            style={styles.button}
          />
          <PrimaryButton
            title={mode === 'batch' ? `Move ${taskCount}` : 'Move'}
            onPress={onMove}
            loading={isMoving}
            disabled={!canMove || isMoving || wipLimitWarning.severity === 'error'}
            style={styles.button}
          />
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  batchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  batchInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  taskInfo: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  columnList: {
    maxHeight: 300,
    marginBottom: theme.spacing.md,
  },
  columnOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentColumn: {
    backgroundColor: theme.colors.surfaceVariant,
    opacity: 0.6,
  },
  selectedColumn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  columnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: theme.spacing.md,
  },
  columnInfo: {
    flex: 1,
  },
  columnName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  currentColumnText: {
    color: theme.colors.textSecondary,
  },
  columnCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  capacityError: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  capacityWarning: {
    color: theme.colors.warning,
    fontWeight: '600',
  },
  columnRight: {
    marginLeft: theme.spacing.md,
  },
  badge: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  warningError: {
    backgroundColor: theme.colors.error + '10',
  },
  warningWarning: {
    backgroundColor: theme.colors.warning + '10',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    marginLeft: theme.spacing.sm,
  },
  warningTextError: {
    color: theme.colors.error,
    fontWeight: '500',
  },
  warningTextWarning: {
    color: theme.colors.warning,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
});

export default TaskMoveModal;
