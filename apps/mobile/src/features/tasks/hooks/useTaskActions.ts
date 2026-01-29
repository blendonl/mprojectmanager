import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Task } from '../domain/entities/Task';
import { getTaskService, getBoardService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';
import { TaskStatus } from '@mprojectmanager/shared-types';

interface UseTaskActionsOptions {
  boardId: string;
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
  const { boardId, onDataChanged } = options;
  const router = useRouter();
  const taskService = getTaskService();
  const boardService = getBoardService();

  const handleTaskPress = useCallback(
    (task: Task) => {
      router.push({
        pathname: '/tasks/[taskId]' as const,
        params: { taskId: task.id, boardId },
      });
    },
    [boardId, router]
  );

  const handleTaskLongPress = useCallback(async (task: Task) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleMoveTask = useCallback(
    async (taskId: string, targetColumnId: string): Promise<boolean> => {
      try {
        const board = await boardService.getBoardById(boardId);

        const validation = await taskService.validateTaskMove(board, taskId, targetColumnId);
        if (!validation.valid) {
          alertService.showError(validation.reason || 'Cannot move task');
          return false;
        }

        await taskService.moveTaskBetweenColumns(board, taskId, targetColumnId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Task moved');

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to move task', error, { boardId, taskId, targetColumnId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to move task'
        );
        return false;
      }
    },
    [boardId, boardService, taskService, onDataChanged]
  );

  const handleBatchMoveTasks = useCallback(
    async (taskIds: string[], targetColumnId: string): Promise<boolean> => {
      try {
        const board = await boardService.getBoardById(boardId);
        const targetColumn = board.getColumnById(targetColumnId);

        if (!targetColumn) {
          alertService.showError('Target column not found');
          return false;
        }

        if (
          targetColumn.limit !== null &&
          targetColumn.tasks.length + taskIds.length > targetColumn.limit
        ) {
          alertService.showError(
            `Column "${targetColumn.name}" cannot hold ${taskIds.length} more tasks (limit: ${targetColumn.limit})`
          );
          return false;
        }

        await taskService.batchMoveTasks(boardId, taskIds, targetColumnId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess(`Moved ${taskIds.length} tasks`);

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to batch move tasks', error, {
          boardId,
          taskIds,
          targetColumnId,
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to move tasks');
        return false;
      }
    },
    [boardId, boardService, taskService, onDataChanged]
  );

  const handleQuickComplete = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        const board = await boardService.getBoardById(boardId);
        const task = board.getTaskById(taskId);

        if (!task) {
          alertService.showError('Task not found');
          return false;
        }

        await taskService.updateTask(board, taskId, {
          status: TaskStatus.DONE,
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Task marked as done');

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to complete task', error, { boardId, taskId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to complete task');
        return false;
      }
    },
    [boardId, boardService, taskService, onDataChanged]
  );

  const handleAddTask = useCallback(
    (columnId: string) => {
      router.push({
        pathname: '/tasks/new' as const,
        params: { boardId, columnId },
      });
    },
    [boardId, router]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        const board = await boardService.getBoardById(boardId);
        await taskService.deleteTask(board, taskId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Task deleted');

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to delete task', error, { boardId, taskId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to delete task');
        return false;
      }
    },
    [boardId, boardService, taskService, onDataChanged]
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
