import { useCallback, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TaskDto } from 'shared-types';
import { runOnJS } from 'react-native-reanimated';
import { useTaskService } from '@core/di/hooks';

interface UseBoardDragDropOptions {
  onMoveTask: (taskId: string, targetColumnId: string) => Promise<boolean>;
}

interface UseBoardDragDropReturn {
  boardListRef: React.RefObject<FlatList>;
  handleDragStart: (task: TaskDto) => void;
  handleDragEnd: (taskId: string, targetColumnId: string | null) => Promise<void>;
}

export function useBoardDragDrop(options: UseBoardDragDropOptions): UseBoardDragDropReturn {
  const { onMoveTask } = options;
  const boardListRef = useRef<FlatList>(null);
  const activeDragRef = useRef<string | null>(null);
  const taskService = useTaskService();

  const handleDragStart = useCallback((task: TaskDto) => {
    console.log('[useBoardDragDrop] handleDragStart', task.id);
    activeDragRef.current = task.id;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleDragEnd = useCallback(
    async (taskId: string, targetColumnId: string | null) => {
      console.log('[useBoardDragDrop] handleDragEnd', taskId, targetColumnId);

      if (activeDragRef.current !== taskId) {
        console.log('[useBoardDragDrop] Stale drag operation ignored');
        return;
      }

      if (!targetColumnId) {
        console.log('[useBoardDragDrop] No target column');
        activeDragRef.current = null;
        return;
      }

      const task = await taskService.getTaskDetail(taskId);
      if (!task) {
        console.log('[useBoardDragDrop] Task not found');
        activeDragRef.current = null;
        return;
      }

      if (task.columnId === targetColumnId) {
        console.log('[useBoardDragDrop] Same column');
        activeDragRef.current = null;
        return;
      }

      console.log('[useBoardDragDrop] Moving task...');
      const success = await onMoveTask(taskId, targetColumnId);
      console.log('[useBoardDragDrop] Move result:', success);

      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      activeDragRef.current = null;
    },
    [onMoveTask, taskService]
  );

  useEffect(() => {
    return () => {
      activeDragRef.current = null;
    };
  }, []);

  return {
    boardListRef,
    handleDragStart,
    handleDragEnd,
  };
}
