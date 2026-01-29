import { useState, useCallback, useMemo } from 'react';
import { Task } from '../domain/entities/Task';
import { Column } from '@features/columns/domain/entities/Column';
import { getBoardService } from '@/core/di/hooks';

interface UseTaskMoveModalOptions {
  boardId: string;
  onMove: (taskId: string, targetColumnId: string) => Promise<boolean>;
}

interface UseTaskMoveModalReturn {
  isVisible: boolean;
  selectedTask: Task | null;
  selectedTaskIds: string[];
  targetColumnId: string | null;
  availableColumns: Column[];
  wipLimitWarning: string | null;
  isBatchMode: boolean;
  open: (task: Task) => void;
  openBatch: (tasks: Task[]) => void;
  close: () => void;
  setTargetColumn: (columnId: string) => void;
  toggleTaskSelection: (taskId: string) => void;
  clearSelection: () => void;
  handleMove: () => Promise<void>;
  getColumnCapacity: (columnId: string) => { current: number; limit: number | null; canMove: boolean };
}

export function useTaskMoveModal(
  options: UseTaskMoveModalOptions
): UseTaskMoveModalReturn {
  const { boardId, onMove } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [availableColumns, setAvailableColumns] = useState<Column[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const boardService = getBoardService();

  const loadColumns = useCallback(async () => {
    try {
      const board = await boardService.getBoardById(boardId);
      setAvailableColumns(board.columns);
    } catch (error) {
      setAvailableColumns([]);
    }
  }, [boardId, boardService]);

  const open = useCallback(
    async (task: Task) => {
      setSelectedTask(task);
      setSelectedTaskIds([task.id]);
      setTargetColumnId(null);
      setIsBatchMode(false);
      await loadColumns();
      setIsVisible(true);
    },
    [loadColumns]
  );

  const openBatch = useCallback(
    async (tasks: Task[]) => {
      setSelectedTask(tasks[0] || null);
      setSelectedTaskIds(tasks.map((t) => t.id));
      setTargetColumnId(null);
      setIsBatchMode(true);
      await loadColumns();
      setIsVisible(true);
    },
    [loadColumns]
  );

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setSelectedTask(null);
      setSelectedTaskIds([]);
      setTargetColumnId(null);
      setAvailableColumns([]);
      setIsBatchMode(false);
    }, 300);
  }, []);

  const setTargetColumnHandler = useCallback((columnId: string) => {
    setTargetColumnId(columnId);
  }, []);

  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  const getColumnCapacity = useCallback(
    (columnId: string): { current: number; limit: number | null; canMove: boolean } => {
      const column = availableColumns.find((c) => c.id === columnId);
      if (!column) {
        return { current: 0, limit: null, canMove: false };
      }

      const tasksToMove = isBatchMode ? selectedTaskIds.length : 1;
      const futureCount = column.tasks.length + tasksToMove;
      const canMove = column.limit === null || futureCount <= column.limit;

      return {
        current: column.tasks.length,
        limit: column.limit,
        canMove,
      };
    },
    [availableColumns, isBatchMode, selectedTaskIds.length]
  );

  const wipLimitWarning = useMemo(() => {
    if (!targetColumnId) return null;

    const capacity = getColumnCapacity(targetColumnId);
    const targetColumn = availableColumns.find((c) => c.id === targetColumnId);

    if (!targetColumn || !capacity.limit) return null;

    const tasksToMove = isBatchMode ? selectedTaskIds.length : 1;
    const futureCount = capacity.current + tasksToMove;

    if (!capacity.canMove) {
      return `Cannot move: Column "${targetColumn.name}" would exceed WIP limit (${capacity.limit})`;
    }

    if (futureCount === capacity.limit) {
      return `Warning: Column "${targetColumn.name}" will be at capacity (${capacity.limit}/${capacity.limit})`;
    }

    if (futureCount >= capacity.limit * 0.8) {
      return `Notice: Column "${targetColumn.name}" will be ${Math.round((futureCount / capacity.limit) * 100)}% full (${futureCount}/${capacity.limit})`;
    }

    return null;
  }, [targetColumnId, availableColumns, isBatchMode, selectedTaskIds.length, getColumnCapacity]);

  const handleMove = useCallback(async () => {
    if (!targetColumnId || selectedTaskIds.length === 0) return;

    const capacity = getColumnCapacity(targetColumnId);
    if (!capacity.canMove) return;

    if (isBatchMode) {
      for (const taskId of selectedTaskIds) {
        const success = await onMove(taskId, targetColumnId);
        if (!success) break;
      }
    } else if (selectedTask) {
      await onMove(selectedTask.id, targetColumnId);
    }

    close();
  }, [targetColumnId, selectedTaskIds, selectedTask, isBatchMode, onMove, close, getColumnCapacity]);

  return {
    isVisible,
    selectedTask,
    selectedTaskIds,
    targetColumnId,
    availableColumns,
    wipLimitWarning,
    isBatchMode,
    open,
    openBatch,
    close,
    setTargetColumn: setTargetColumnHandler,
    toggleTaskSelection,
    clearSelection,
    handleMove,
    getColumnCapacity,
  };
}
