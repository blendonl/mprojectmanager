import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Column } from '../domain/entities/Column';
import { useColumnService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';

interface UseColumnActionsOptions {
  boardId: string;
  onDataChanged?: () => Promise<void>;
}

interface UseColumnActionsReturn {
  handleCreateColumn: (name: string, limit?: number) => Promise<Column | null>;
  handleUpdateColumn: (columnId: string, updates: { name?: string; limit?: number | null }) => Promise<boolean>;
  handleReorderColumn: (columnId: string, direction: 'left' | 'right') => Promise<void>;
  handleClearColumn: (columnId: string) => Promise<void>;
  handleMoveAllTasks: (sourceColumnId: string, targetColumnId: string) => Promise<void>;
  handleDeleteColumn: (columnId: string) => Promise<boolean>;
}

export function useColumnActions(options: UseColumnActionsOptions): UseColumnActionsReturn {
  const { boardId, onDataChanged } = options;
  const columnService = useColumnService();

  const handleCreateColumn = useCallback(
    async (name: string, limit?: number): Promise<Column | null> => {
      try {
        const column = await columnService.createColumn(boardId, name);

        if (limit !== undefined) {
          await columnService.updateColumn(boardId, column.id, { limit });
        }

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Column created');

        if (onDataChanged) {
          await onDataChanged();
        }

        return column;
      } catch (error) {
        logger.error('Failed to create column', error, { boardId, name });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to create column'
        );
        return null;
      }
    },
    [boardId, columnService, onDataChanged]
  );

  const handleUpdateColumn = useCallback(
    async (
      columnId: string,
      updates: { name?: string; limit?: number | null }
    ): Promise<boolean> => {
      try {
        await columnService.updateColumn(boardId, columnId, updates);

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        alertService.showSuccess('Column updated');

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to update column', error, { boardId, columnId, updates });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to update column'
        );
        return false;
      }
    },
    [boardId, columnService, onDataChanged]
  );

  const handleReorderColumn = useCallback(
    async (columnId: string, direction: 'left' | 'right'): Promise<void> => {
      try {
        await columnService.reorderColumn(boardId, columnId, direction);

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (onDataChanged) {
          await onDataChanged();
        }
      } catch (error) {
        logger.error('Failed to reorder column', error, { boardId, columnId, direction });
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to reorder column'
        );
      }
    },
    [boardId, columnService, onDataChanged]
  );

  const handleClearColumn = useCallback(
    async (columnId: string): Promise<void> => {
      try {
        await columnService.clearColumn(boardId, columnId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Column cleared');

        if (onDataChanged) {
          await onDataChanged();
        }
      } catch (error) {
        logger.error('Failed to clear column', error, { boardId, columnId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to clear column');
      }
    },
    [boardId, columnService, onDataChanged]
  );

  const handleMoveAllTasks = useCallback(
    async (sourceColumnId: string, targetColumnId: string): Promise<void> => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('All tasks moved');

        if (onDataChanged) {
          await onDataChanged();
        }
      } catch (error) {
        logger.error('Failed to move all tasks', error, {
          sourceColumnId,
          targetColumnId,
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to move all tasks');
      }
    },
    [onDataChanged]
  );

  const handleDeleteColumn = useCallback(
    async (columnId: string): Promise<boolean> => {
      try {
        await columnService.deleteColumn(boardId, columnId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess('Column deleted');

        if (onDataChanged) {
          await onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to delete column', error, { boardId, columnId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to delete column'
        );
        return false;
      }
    },
    [boardId, columnService, onDataChanged]
  );

  return {
    handleCreateColumn,
    handleUpdateColumn,
    handleReorderColumn,
    handleClearColumn,
    handleMoveAllTasks,
    handleDeleteColumn,
  };
}
