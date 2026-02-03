import { AgendaItemEnrichedDto } from 'shared-types';
import { getScheduledTime } from './agendaHelpers';
import { safeParseHour, validateHourValue } from './timelineValidation';

export interface WakeSleepTimes {
  wake: string;
  sleep: string;
  isOvernight: boolean;
}

export interface TimelineHour {
  hour: number;
  label: string;
}

export const DEFAULT_WAKE_TIME = '07:00';
export const DEFAULT_SLEEP_TIME = '23:00';

export const parseSleepTarget = (target: string | null): WakeSleepTimes | null => {
  if (!target) return null;

  const parts = target.split('-').map(t => t.trim());
  if (parts.length !== 2) {
    console.warn(`Invalid sleep target format: ${target}`);
    return null;
  }

  const [sleep, wake] = parts;
  if (!sleep || !wake) {
    console.warn(`Missing wake/sleep times in: ${target}`);
    return null;
  }

  // Use safe parsing with validation
  const sleepHour = safeParseHour(sleep);
  const wakeHour = safeParseHour(wake);

  if (sleepHour === null || wakeHour === null) {
    console.warn(`Failed to parse wake/sleep hours from: ${target}`);
    return null;
  }

  const isOvernight = sleepHour > wakeHour;

  return {
    sleep,
    wake,
    isOvernight,
  };
};

export const calculateTimelineHours = (
  wakeTime: string,
  sleepTime: string,
  isOvernight: boolean
): TimelineHour[] => {
  const hours: TimelineHour[] = [];

  // Always show all 24 hours
  for (let hour = 0; hour <= 23; hour++) {
    hours.push({
      hour,
      label: formatHourLabel(hour),
    });
  }

  return hours;
};

export const formatHourLabel = (hour: number): string => {
  // Validate hour bounds
  const validation = validateHourValue(hour);
  if (!validation.isValid) {
    console.warn(`Invalid hour value: ${hour}`, validation.error);
    return '-- --';
  }

  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

export const sortItemsWithinHour = (
  items: AgendaItemEnrichedDto[]
): AgendaItemEnrichedDto[] => {
  return [...items].sort((a, b) => {
    const timeA = getScheduledTime(a) || '00:00';
    const timeB = getScheduledTime(b) || '00:00';

    // Sort by time first (HH:MM format naturally sorts)
    if (timeA !== timeB) {
      return timeA.localeCompare(timeB);
    }

    // If same time, prioritize by type
    const priorityA = getItemPriority(a);
    const priorityB = getItemPriority(b);
    return priorityA - priorityB;
  });
};

const getItemPriority = (item: AgendaItemEnrichedDto): number => {
  // Meetings first, then milestones, then tasks, then routines
  if (item.task?.taskType === 'meeting') return 1;
  if (item.task?.taskType === 'milestone') return 2;
  if (item.taskId) return 3;
  if (item.routineTaskId) return 4;
  return 5;
};

export const groupItemsByHour = (
  items: AgendaItemEnrichedDto[]
): Map<number, AgendaItemEnrichedDto[]> => {
  const grouped = new Map<number, AgendaItemEnrichedDto[]>();

  items.forEach(item => {
    const timeStr = getScheduledTime(item);
    if (!timeStr) return;

    // Use safe parsing with validation
    const hour = safeParseHour(timeStr);
    if (hour === null) {
      console.warn(`Skipping item ${item.id} with invalid time: ${timeStr}`);
      return;
    }

    const existing = grouped.get(hour) || [];
    grouped.set(hour, [...existing, item]);
  });

  // Sort items within each hour
  grouped.forEach((items, hour) => {
    grouped.set(hour, sortItemsWithinHour(items));
  });

  return grouped;
};

export const separateAllDayItems = (
  items: AgendaItemEnrichedDto[]
): { allDay: AgendaItemEnrichedDto[]; timed: AgendaItemEnrichedDto[] } => {
  const allDay: AgendaItemEnrichedDto[] = [];
  const timed: AgendaItemEnrichedDto[] = [];

  items.forEach(item => {
    if (!item.startAt || !getScheduledTime(item)) {
      allDay.push(item);
    } else {
      timed.push(item);
    }
  });

  return { allDay, timed };
};

export const calculateCurrentTimePosition = (
  hours: TimelineHour[],
  hourSlotHeight: number
): { offsetY: number; hour: number; minute: number } | null => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const hourIndex = hours.findIndex(h => h.hour === currentHour);
  if (hourIndex === -1) return null;

  const minuteProgress = currentMinute / 60;
  const offsetY = hourIndex * hourSlotHeight + minuteProgress * hourSlotHeight;

  return {
    offsetY,
    hour: currentHour,
    minute: currentMinute,
  };
};

export const getCurrentTime = (): { hour: number; minute: number } => {
  const now = new Date();
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
};

export const isCurrentTimeVisible = (
  hours: TimelineHour[],
  currentHour: number
): boolean => {
  return hours.some(h => h.hour === currentHour);
};
