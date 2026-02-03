import { useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { TimelineHour, getCurrentTime } from '../utils/timelineHelpers';

export const useTimelineScroll = (
  hours: TimelineHour[],
  hourSlotHeight: number,
  enabled: boolean = true
) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!enabled || hours.length === 0) return;

    const { hour } = getCurrentTime();
    const targetHour = Math.max(0, hour - 2);
    const hourIndex = hours.findIndex(h => h.hour === targetHour);

    if (hourIndex !== -1) {
      const timeout = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: hourIndex,
          animated: true,
          viewPosition: 0,
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [hours, hourSlotHeight, enabled]);

  return flatListRef;
};
