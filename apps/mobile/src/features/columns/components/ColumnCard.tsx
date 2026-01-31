import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { BoardColumnDto, TaskDto } from 'shared-types';
import { Parent } from '@domain/entities/Parent';
import { useColumnGrouping } from '../hooks/useColumnGrouping';
import ColumnHeader from './ColumnHeader';
import TaskList from './TaskList';
import GroupedTaskList from './GroupedTaskList';
import AddTaskButton from './AddTaskButton';
import theme from '@shared/theme';

interface ColumnCardProps {
  column: BoardColumnDto;
  parents?: Parent[];
  showParentGroups?: boolean;
  onTaskPress: (task: TaskDto) => void;
  onTaskLongPress?: (task: TaskDto) => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
  onAddTask: () => void;
  onColumnMenu?: () => void;
  registerVerticalScroll?: (
    columnId: string,
    ref: React.RefObject<FlatList | null>,
    contentHeight: number,
    viewportHeight: number
  ) => void;
  unregisterVerticalScroll?: (columnId: string) => void;
}

const ColumnCard: React.FC<ColumnCardProps> = React.memo(
  ({
    column,
    parents = [],
    showParentGroups = false,
    onTaskPress,
    onTaskLongPress,
    onDragStart,
    onDragEnd,
    onAddTask,
    onColumnMenu,
    registerVerticalScroll,
    unregisterVerticalScroll,
  }) => {
    const taskListRef = useRef<FlatList>(null);
    const [contentSize, setContentSize] = useState({ height: 0, width: 0 });
    const [viewportHeight, setViewportHeight] = useState(0);

    const { groupedTasks, totalTaskCount } = useColumnGrouping({
      tasks: column.tasks,
      parents,
      showParentGroups,
      sortByPriority: false,
    });

    useEffect(() => {
      if (registerVerticalScroll && !showParentGroups) {
        registerVerticalScroll(
          column.id,
          taskListRef,
          contentSize.height,
          viewportHeight
        );
      }

      return () => {
        if (unregisterVerticalScroll) {
          unregisterVerticalScroll(column.id);
        }
      };
    }, [
      column.id,
      registerVerticalScroll,
      unregisterVerticalScroll,
      contentSize.height,
      viewportHeight,
      showParentGroups,
    ]);

    return (
      <View style={styles.container}>
        <ColumnHeader
          column={column}
          taskCount={totalTaskCount}
          onMenuPress={onColumnMenu || (() => {})}
        />

        <View
          style={styles.content}
          onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
        >
          {showParentGroups ? (
            <GroupedTaskList
              groups={groupedTasks}
              onTaskPress={onTaskPress}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ) : (
            <TaskList
              ref={taskListRef}
              tasks={column.tasks}
              parents={parents}
              onTaskPress={onTaskPress}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onContentSizeChange={(width, height) =>
                setContentSize({ width, height })
              }
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
    backgroundColor: theme.background.elevated,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.border.primary,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 200,
  },
});

export default ColumnCard;
