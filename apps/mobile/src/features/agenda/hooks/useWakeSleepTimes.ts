import { useState, useEffect, useCallback } from 'react';
import { routineApi } from '@features/routines/api/routineApi';
import {
  WakeSleepTimes,
  parseSleepTarget,
  DEFAULT_WAKE_TIME,
  DEFAULT_SLEEP_TIME,
} from '../utils/timelineHelpers';

interface WakeSleepTimesHook {
  wakeSleepTimes: WakeSleepTimes;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
}

export const useWakeSleepTimes = (): WakeSleepTimesHook => {
  const [wakeSleepTimes, setWakeSleepTimes] = useState<WakeSleepTimes>({
    wake: DEFAULT_WAKE_TIME,
    sleep: DEFAULT_SLEEP_TIME,
    isOvernight: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWakeSleepTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const routines = await routineApi.getRoutines();
      const sleepRoutine = routines.find(routine => routine.type === 'SLEEP');

      if (sleepRoutine && sleepRoutine.target) {
        const parsed = parseSleepTarget(sleepRoutine.target);
        if (parsed) {
          setWakeSleepTimes(parsed);
        } else {
          // Validation failed, use defaults
          console.warn('Failed to parse sleep target, using defaults');
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Failed to fetch wake/sleep times:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWakeSleepTimes();
  }, [fetchWakeSleepTimes]);

  return {
    wakeSleepTimes,
    loading,
    error,
    retry: fetchWakeSleepTimes,
  };
};
