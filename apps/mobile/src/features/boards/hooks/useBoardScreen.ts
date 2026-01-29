import { useMemo } from 'react';
import { useBoardData } from './useBoardData';
import { useBoardActions } from './useBoardActions';
import { useBoardViewState } from './useBoardViewState';
import { useBoardNavigation } from './useBoardNavigation';
import { useColumnActions } from '@features/columns/hooks/useColumnActions';
import { useTaskActions } from '@features/tasks/hooks/useTaskActions';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';

interface UseBoardScreenReturn {
  board: ReturnType<typeof useBoardData>['board'];
  loading: boolean;
  refreshing: boolean;
  error: ReturnType<typeof useBoardData>['error'];
  isAutoRefreshing: boolean;
  boardActions: ReturnType<typeof useBoardActions>;
  columnActions: ReturnType<typeof useColumnActions>;
  taskActions: ReturnType<typeof useTaskActions>;
  viewState: ReturnType<typeof useBoardViewState>;
  refreshBoard: () => Promise<void>;
  retryLoad: () => Promise<void>;
}

export function useBoardScreen(boardId: string): UseBoardScreenReturn {
  const {
    board,
    loading,
    refreshing,
    error,
    refreshBoard,
    retryLoad,
  } = useBoardData(boardId);

  const { isAutoRefreshing } = useAutoRefresh(
    [
      'board_updated',
      'column_created',
      'column_updated',
      'column_deleted',
      'column_reordered',
      'column_cleared',
      'task_created',
      'task_updated',
      'task_moved',
      'task_deleted',
      'tasks_moved_bulk',
    ],
    refreshBoard,
    500
  );

  useBoardNavigation({
    board,
    refreshBoard,
  });

  const boardActions = useBoardActions({
    onDataChanged: refreshBoard,
  });

  const columnActions = useColumnActions({
    boardId,
    onDataChanged: refreshBoard,
  });

  const taskActions = useTaskActions({
    boardId,
    onDataChanged: refreshBoard,
  });

  const viewState = useBoardViewState(boardId);

  return useMemo(
    () => ({
      board,
      loading,
      refreshing,
      error,
      isAutoRefreshing,
      boardActions,
      columnActions,
      taskActions,
      viewState,
      refreshBoard,
      retryLoad,
    }),
    [
      board,
      loading,
      refreshing,
      error,
      isAutoRefreshing,
      boardActions,
      columnActions,
      taskActions,
      viewState,
      refreshBoard,
      retryLoad,
    ]
  );
}
