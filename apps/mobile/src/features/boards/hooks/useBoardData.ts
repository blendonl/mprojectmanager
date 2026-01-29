import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Board } from '../domain/entities/Board';
import { getBoardService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';

interface UseBoardDataReturn {
  board: Board | null;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  loadBoard: () => Promise<void>;
  refreshBoard: () => Promise<void>;
  retryLoad: () => Promise<void>;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export function useBoardData(boardId: string | undefined): UseBoardDataReturn {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const boardService = getBoardService();
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadBoardWithRetry = useCallback(
    async (isRefresh = false): Promise<void> => {
      if (!boardId) return;

      const setLoadingState = isRefresh ? setRefreshing : setLoading;

      try {
        setLoadingState(true);
        setError(null);

        const loadedBoard = await boardService.getBoardById(boardId);

        if (!isMountedRef.current) return;

        if (loadedBoard) {
          setBoard(loadedBoard);
          retryCountRef.current = 0;
        } else {
          throw new Error('Board not found');
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        const error = err instanceof Error ? err : new Error('Failed to load board');
        logger.error('Failed to load board', error, { boardId, isRefresh });

        if (retryCountRef.current < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current);
          retryCountRef.current += 1;

          logger.info(`Retrying board load (attempt ${retryCountRef.current}/${MAX_RETRIES})`, {
            boardId,
            delay,
          });

          setTimeout(() => {
            if (isMountedRef.current) {
              loadBoardWithRetry(isRefresh);
            }
          }, delay);
        } else {
          setError(error);
          alertService.showError(isRefresh ? 'Failed to refresh board' : 'Failed to load board');

          if (!isRefresh) {
            router.back();
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingState(false);
        }
      }
    },
    [boardId, boardService, router]
  );

  const loadBoard = useCallback(async () => {
    retryCountRef.current = 0;
    await loadBoardWithRetry(false);
  }, [loadBoardWithRetry]);

  const refreshBoard = useCallback(async () => {
    if (!board) return;
    retryCountRef.current = 0;
    await loadBoardWithRetry(true);
  }, [board, loadBoardWithRetry]);

  const retryLoad = useCallback(async () => {
    retryCountRef.current = 0;
    await loadBoardWithRetry(false);
  }, [loadBoardWithRetry]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const memoizedBoard = useMemo(() => board, [board]);

  return {
    board: memoizedBoard,
    loading,
    refreshing,
    error,
    loadBoard,
    refreshBoard,
    retryLoad,
  };
}
