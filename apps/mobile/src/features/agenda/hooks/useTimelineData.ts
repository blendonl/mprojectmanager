import { useMemo } from 'react';
import { AgendaItemEnrichedDto, AgendaItemsDayDto } from 'shared-types';
import {
  TimelineHour,
  calculateTimelineHours,
  groupItemsByHour,
  separateAllDayItems,
} from '../utils/timelineHelpers';
import { WakeSleepTimes } from '../utils/timelineHelpers';
import { isItemUnfinished } from '../utils/agendaHelpers';

export interface TimelineData {
  hours: TimelineHour[];
  itemsByHour: Map<number, AgendaItemEnrichedDto[]>;
  allDayItems: AgendaItemEnrichedDto[];
  timedItems: AgendaItemEnrichedDto[];
}

export const useTimelineData = (
  dayData: AgendaItemsDayDto | null,
  wakeSleepTimes: WakeSleepTimes
): TimelineData => {
  return useMemo(() => {
    const hours = calculateTimelineHours(
      wakeSleepTimes.wake,
      wakeSleepTimes.sleep,
      wakeSleepTimes.isOvernight
    );

    if (!dayData) {
      return {
        hours,
        itemsByHour: new Map(),
        allDayItems: [],
        timedItems: [],
      };
    }

    const allItems = [
      ...dayData.tasks,
      ...dayData.routines,
    ].filter(item => !isItemUnfinished(item));

    const { allDay, timed } = separateAllDayItems(allItems);
    const itemsByHour = groupItemsByHour(timed);

    return {
      hours,
      itemsByHour,
      allDayItems: allDay,
      timedItems: timed,
    };
  }, [dayData, wakeSleepTimes]);
};
