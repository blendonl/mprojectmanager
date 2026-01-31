import React, { useCallback, forwardRef } from 'react';
import { FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { TaskDto } from 'shared-types';
import { Parent } from '@domain/entities/Parent';
import { DraggableTaskCard } from '@features/boards/components/drag-drop';
import theme from '@shared/theme';

interface TaskListProps {
  tasks: TaskDto[];
  parents?: Parent[];
  onTaskPress: (task: TaskDto) => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
  onContentSizeChange?: (width: number, height: number) => void;
}

const TaskList = React.memo(forwardRef<FlatList, TaskListProps>(({
  tasks,
  parents = [],
  onTaskPress,
  onDragStart,
  onDragEnd,
  onContentSizeChange,
}, ref) => {
  const getTaskParent = useCallback((task: TaskDto): Parent | undefined => {
    if (!task.parentId) return undefined;
    return parents.find((p) => p.id === task.parentId);
  }, [parents]);

  const renderTask: ListRenderItem<TaskDto> = useCallback(
    ({ item: task }) => (
      <DraggableTaskCard
        task={task}
        parent={getTaskParent(task)}
        onPress={() => onTaskPress(task)}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    ),
    [onTaskPress, onDragStart, onDragEnd, getTaskParent]
  );

  const keyExtractor = useCallback((task: Task) => task.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80,
      offset: 80 * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      ref={ref}
      data={tasks}
      renderItem={renderTask}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      contentContainerStyle={styles.container}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      onContentSizeChange={onContentSizeChange}
    />
  );
}));

TaskList.displayName = 'TaskList';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
  },
});

export default TaskList;
