import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Column } from '../domain/entities/Column';
import { Task } from '@features/tasks/domain/entities/Task';
import { Parent } from '@domain/entities/Parent';
import { useColumnGrouping } from '../hooks/useColumnGrouping';
import ColumnHeader from './ColumnHeader';
import TaskList from './TaskList';
import GroupedTaskList from './GroupedTaskList';
import AddTaskButton from './AddTaskButton';
import theme from '@shared/theme';

interface ColumnCardProps {
  column: Column;
  parents?: Parent[];
  showParentGroups?: boolean;
  onTaskPress: (task: Task) => void;
  onTaskLongPress?: (task: Task) => void;
  onAddTask: () => void;
  onColumnMenu?: () => void;
}

const ColumnCard: React.FC<ColumnCardProps> = React.memo(
  ({
    column,
    parents = [],
    showParentGroups = false,
    onTaskPress,
    onTaskLongPress,
    onAddTask,
    onColumnMenu,
  }) => {
    const { groupedTasks, totalTaskCount } = useColumnGrouping({
      tasks: column.tasks,
      parents,
      showParentGroups,
      sortByPriority: false,
    });

    return (
      <View style={styles.container}>
        <ColumnHeader
          column={column}
          taskCount={totalTaskCount}
          onMenuPress={onColumnMenu || (() => {})}
        />

        <View style={styles.content}>
          {showParentGroups ? (
            <GroupedTaskList
              groups={groupedTasks}
              onTaskPress={onTaskPress}
              onTaskLongPress={onTaskLongPress}
            />
          ) : (
            <TaskList
              tasks={column.tasks}
              onTaskPress={onTaskPress}
              onTaskLongPress={onTaskLongPress}
            />
          )}
        </View>

        <AddTaskButton onPress={onAddTask} />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.column.id === nextProps.column.id &&
      prevProps.column.name === nextProps.column.name &&
      prevProps.column.color === nextProps.column.color &&
      prevProps.column.limit === nextProps.column.limit &&
      prevProps.column.tasks.length === nextProps.column.tasks.length &&
      prevProps.showParentGroups === nextProps.showParentGroups &&
      prevProps.parents?.length === nextProps.parents?.length
    );
  }
);

ColumnCard.displayName = 'ColumnCard';

const styles = StyleSheet.create({
  container: {
    width: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
    minHeight: 200,
    maxHeight: 600,
  },
});

export default ColumnCard;
