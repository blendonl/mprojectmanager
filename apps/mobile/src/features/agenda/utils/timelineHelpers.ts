import { AgendaItemEnrichedDto } from 'shared-types';
import { getScheduledTime } from './agendaHelpers';

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
  if (parts.length !== 2) return null;

  const [sleep, wake] = parts;
  if (!sleep || !wake) return null;

  const sleepHour = parseInt(sleep.split(':')[0], 10);
  const wakeHour = parseInt(wake.split(':')[0], 10);

  if (isNaN(sleepHour) || isNaN(wakeHour)) return null;

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
  const wakeHour = parseInt(wakeTime.split(':')[0], 10);
  const sleepHour = parseInt(sleepTime.split(':')[0], 10);

  const startHour = Math.max(0, wakeHour - 1);
  let endHour: number;

  if (isOvernight) {
    endHour = Math.min(23, sleepHour + 1);
  } else {
    endHour = Math.min(23, sleepHour + 1);
  }

  const hours: TimelineHour[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    hours.push({
      hour,
      label: formatHourLabel(hour),
    });
  }

  return hours;
};

export const formatHourLabel = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

export const groupItemsByHour = (
  items: AgendaItemEnrichedDto[]
): Map<number, AgendaItemEnrichedDto[]> => {
  const grouped = new Map<number, AgendaItemEnrichedDto[]>();

  items.forEach(item => {
    const timeStr = getScheduledTime(item);
    if (!timeStr) return;

    const hour = parseInt(timeStr.split(':')[0], 10);
    if (isNaN(hour)) return;

    const existing = grouped.get(hour) || [];
    grouped.set(hour, [...existing, item]);
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
