import { useState, useEffect } from 'react';
import { routineApi } from '@features/routines/api/routineApi';
import {
  WakeSleepTimes,
  parseSleepTarget,
  DEFAULT_WAKE_TIME,
  DEFAULT_SLEEP_TIME,
} from '../utils/timelineHelpers';

export const useWakeSleepTimes = () => {
  const [wakeSleepTimes, setWakeSleepTimes] = useState<WakeSleepTimes>({
    wake: DEFAULT_WAKE_TIME,
    sleep: DEFAULT_SLEEP_TIME,
    isOvernight: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWakeSleepTimes = async () => {
      try {
        const routines = await routineApi.getRoutines();
        const sleepRoutine = routines.find(routine => routine.type === 'SLEEP');

        if (sleepRoutine && sleepRoutine.target) {
          const parsed = parseSleepTarget(sleepRoutine.target);
          if (parsed) {
            setWakeSleepTimes(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to fetch wake/sleep times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWakeSleepTimes();
  }, []);

  return { wakeSleepTimes, loading };
};
