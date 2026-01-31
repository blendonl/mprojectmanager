import { useState, useCallback } from 'react';
import { getBoardService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';
import { BoardDto } from 'shared-types';
import * as Haptics from 'expo-haptics';

interface UseBoardActionsOptions {
  onDataChanged?: () => Promise<void>;
}

interface UseBoardActionsReturn {
  handleCreateBoard: (projectId: string, name: string, description?: string) => Promise<BoardDto | null>;
  handleUpdateBoard: (boardId: string, updates: { name?: string; description?: string }) => Promise<boolean>;
  handleDeleteBoard: (boardId: string) => Promise<boolean>;
  isLoading: boolean;
}

export function useBoardActions(options?: UseBoardActionsOptions): UseBoardActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const boardService = getBoardService();

  const handleCreateBoard = useCallback(
    async (projectId: string, name: string, description: string = ''): Promise<BoardDto | null> => {
      try {
        setIsLoading(true);
        const board = await boardService.createBoardInProject(projectId, name, description);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alertService.showSuccess(`Board "${name}" created`);

        if (options?.onDataChanged) {
          await options.onDataChanged();
        }

        return board;
      } catch (error) {
        logger.error('Failed to create board', error, { projectId, name });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to create board'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [boardService, options]
  );

  const handleUpdateBoard = useCallback(
    async (
      boardId: string,
      updates: { name?: string; description?: string }
    ): Promise<boolean> => {
      try {
        setIsLoading(true);

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        alertService.showSuccess('Board updated');

        if (options?.onDataChanged) {
          await options.onDataChanged();
        }

        return true;
      } catch (error) {
        logger.error('Failed to update board', error, { boardId, updates });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to update board'
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const handleDeleteBoard = useCallback(
    async (boardId: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const canDelete = await boardService.canDeleteBoard(boardId);
        if (!canDelete) {
          alertService.showError('Cannot delete board with tasks. Clear all tasks first.');
          return false;
        }

        const deleted = await boardService.deleteBoard(boardId);

        if (deleted) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          alertService.showSuccess('Board deleted');

          if (options?.onDataChanged) {
            await options.onDataChanged();
          }
        }

        return deleted;
      } catch (error) {
        logger.error('Failed to delete board', error, { boardId });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError(
          error instanceof Error ? error.message : 'Failed to delete board'
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [boardService, options]
  );

  return {
    handleCreateBoard,
    handleUpdateBoard,
    handleDeleteBoard,
    isLoading,
  };
}
