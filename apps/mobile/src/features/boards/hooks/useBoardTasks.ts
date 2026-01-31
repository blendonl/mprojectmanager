import { useState, useCallback, useEffect } from 'react';
import { BoardColumnDto, TaskDto } from 'shared-types';
import { useTaskService } from '@/core/di/hooks';
import logger from '@/utils/logger';

interface ColumnTasksState {
  [columnId: string]: {
    tasks: TaskDto[];
    page: number;
    hasMore: boolean;
    loading: boolean;
  };
}

interface UseBoardTasksParams {
  columns: BoardColumnDto[];
  pageSize?: number;
}

interface UseBoardTasksReturn {
  columnTasks: ColumnTasksState;
  loadInitialTasks: () => Promise<void>;
  loadMoreTasks: (columnId: string) => Promise<void>;
  getTasksForColumn: (columnId: string) => TaskDto[];
  isLoadingMore: (columnId: string) => boolean;
  hasMore: (columnId: string) => boolean;
}

const DEFAULT_PAGE_SIZE = 20;

export function useBoardTasks({
  columns,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseBoardTasksParams): UseBoardTasksReturn {
  const [columnTasks, setColumnTasks] = useState<ColumnTasksState>({});
  const taskService = useTaskService();

  const loadInitialTasks = useCallback(async () => {
    if (columns.length === 0) return;

    const initialState: ColumnTasksState = {};

    await Promise.all(
      columns.map(async (column) => {
        try {
          logger.info('[useBoardTasks] Loading initial tasks', {
            columnId: column.id,
            pageSize,
          });

          const response = await taskService.getTasks({
            columnId: column.id,
            page: 1,
            limit: pageSize,
          });

          initialState[column.id] = {
            tasks: response.items,
            page: 1,
            hasMore: response.items.length >= pageSize,
            loading: false,
          };
        } catch (error) {
          logger.error('Failed to load initial tasks', error as Error, {
            columnId: column.id,
          });
          initialState[column.id] = {
            tasks: [],
            page: 1,
            hasMore: false,
            loading: false,
          };
        }
      })
    );

    setColumnTasks(initialState);
  }, [columns, pageSize, taskService]);

  const loadMoreTasks = useCallback(
    async (columnId: string) => {
      const columnState = columnTasks[columnId];
      if (!columnState || columnState.loading || !columnState.hasMore) {
        return;
      }

      setColumnTasks((prev) => ({
        ...prev,
        [columnId]: { ...prev[columnId], loading: true },
      }));

      try {
        const nextPage = columnState.page + 1;
        logger.info('[useBoardTasks] Loading more tasks', {
          columnId,
          page: nextPage,
        });

        const response = await taskService.getTasks({
          columnId,
          page: nextPage,
          limit: pageSize,
        });

        setColumnTasks((prev) => ({
          ...prev,
          [columnId]: {
            tasks: [...prev[columnId].tasks, ...response.items],
            page: nextPage,
            hasMore: response.items.length >= pageSize,
            loading: false,
          },
        }));
      } catch (error) {
        logger.error('Failed to load more tasks', error as Error, { columnId });
        setColumnTasks((prev) => ({
          ...prev,
          [columnId]: { ...prev[columnId], loading: false, hasMore: false },
        }));
      }
    },
    [columnTasks, pageSize, taskService]
  );

  const getTasksForColumn = useCallback(
    (columnId: string): TaskDto[] => {
      return columnTasks[columnId]?.tasks || [];
    },
    [columnTasks]
  );

  const isLoadingMore = useCallback(
    (columnId: string): boolean => {
      return columnTasks[columnId]?.loading || false;
    },
    [columnTasks]
  );

  const hasMore = useCallback(
    (columnId: string): boolean => {
      return columnTasks[columnId]?.hasMore || false;
    },
    [columnTasks]
  );

  return {
    columnTasks,
    loadInitialTasks,
    loadMoreTasks,
    getTasksForColumn,
    isLoadingMore,
    hasMore,
  };
}
