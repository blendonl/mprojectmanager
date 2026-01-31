import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Task } from '../domain/entities/Task';
import { useTaskService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';
import { TaskStatus } from 'shared-types';

interface UseTaskActionsOptions {
  onDataChanged?: () => Promise<void>;
}

interface UseTaskActionsReturn {
  handleTaskPress: (task: Task) => void;
  handleTaskLongPress: (task: Task) => Promise<void>;
  handleMoveTask: (taskId: string, targetColumnId: string) => Promise<boolean>;
  handleBatchMoveTasks: (taskIds: string[], targetColumnId: string) => Promise<boolean>;
  handleQuickComplete: (taskId: string) => Promise<boolean>;
  handleAddTask: (columnId: string) => void;
  handleDeleteTask: (taskId: string) => Promise<boolean>;
}

export function useTaskActions(options: UseTaskActionsOptions): UseTaskActionsReturn {
  const { onDataChanged } = options;
  const router = useRouter();
  const taskService = useTaskService();

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push({
        pathname: '/tasks/[taskId]' as const,
        params: { taskId: task.id },
      });
    },
    [router]
  );

  const handleTaskLongPress = useCallback(async (task: Task) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleMoveTask = useCallback(
    async (taskId: string, targetColumnId: string): Promise<boolean> => {
      try {
        await taskService.moveTaskBetweenColumns(taskId, targetColumnId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to move task', error, { taskId, targetColumnId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to move task'
        );
        return false;
      }
    },
    [taskService, onDataChanged]
  );

  const handleBatchMoveTasks = useCallback(
    async (taskIds: string[], targetColumnId: string): Promise<boolean> => {
      try {
        await taskService.batchMoveTasks(taskIds, targetColumnId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess(`Moved ${taskIds.length} tasks`);

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to batch move tasks', error, {
          taskIds,
          targetColumnId,
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to move tasks');
        return false;
      }
    },
    [taskService, onDataChanged]
  );

  const handleQuickComplete = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        await taskService.updateTask(taskId, {
          status: TaskStatus.DONE,
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Task marked as done');

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to complete task', error, { taskId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to complete task');
        return false;
      }
    },
    [taskService, onDataChanged]
  );

  const handleAddTask = useCallback(
    (columnId: string) => {
      router.push({
        pathname: '/tasks/new' as const,
        params: { columnId },
      });
    },
    [router]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        await taskService.deleteTask(taskId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Task deleted');

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to delete task', error, { taskId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to delete task');
        return false;
      }
    },
    [taskService, onDataChanged]
  );

  return {
    handleTaskPress,
    handleTaskLongPress,
    handleMoveTask,
    handleBatchMoveTasks,
    handleQuickComplete,
    handleAddTask,
    handleDeleteTask,
  };
}
