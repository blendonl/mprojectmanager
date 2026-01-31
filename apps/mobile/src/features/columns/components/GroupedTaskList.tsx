import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { TaskDto } from 'shared-types';
import { Parent } from '@domain/entities/Parent';
import ParentGroup from '@shared/components/ParentGroup';
import theme from '@shared/theme';

interface GroupedTasksData {
  parentId: string | null;
  parent: Parent | null;
  tasks: TaskDto[];
  taskCount: number;
}

interface GroupedTaskListProps {
  groups: GroupedTasksData[];
  onTaskPress: (task: TaskDto) => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
}

const GroupedTaskList: React.FC<GroupedTaskListProps> = React.memo(({
  groups,
  onTaskPress,
  onDragStart,
  onDragEnd,
}) => {
  const renderGroup: ListRenderItem<GroupedTasksData> = useCallback(
    ({ item: group }) => (
      <ParentGroup
        parent={group.parent}
        tasks={group.tasks}
        onTaskPress={onTaskPress}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    ),
    [onTaskPress, onDragStart, onDragEnd]
  );

  const keyExtractor = useCallback(
    (group: GroupedTasksData) => group.parentId || 'orphaned',
    []
  );

  return (
    <FlatList
      data={groups}
      renderItem={renderGroup}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    />
  );
});

GroupedTaskList.displayName = 'GroupedTaskList';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
  },
});

export default GroupedTaskList;
