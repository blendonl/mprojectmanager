import React, { useCallback } from 'react';
import { FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { Task } from '@features/tasks/domain/entities/Task';
import { TaskCard } from '@features/tasks/components';
import theme from '@shared/theme';

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onTaskLongPress?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = React.memo(({
  tasks,
  onTaskPress,
  onTaskLongPress,
}) => {
  const renderTask: ListRenderItem<Task> = useCallback(
    ({ item: task }) => (
      <TaskCard
        task={task}
        onPress={() => onTaskPress(task)}
        onLongPress={onTaskLongPress ? () => onTaskLongPress(task) : undefined}
      />
    ),
    [onTaskPress, onTaskLongPress]
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
      data={tasks}
      renderItem={renderTask}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
});

TaskList.displayName = 'TaskList';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
  },
});

export default TaskList;
