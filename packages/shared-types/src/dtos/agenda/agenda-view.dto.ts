import { AgendaItemEnrichedDto } from './agenda-item.dto';

export type AgendaViewMode = 'day' | 'week' | 'month';

export interface AgendaViewNavigationDto {
  anchorDate: string;
  previousAnchorDate: string;
  nextAnchorDate: string;
  todayAnchorDate: string;
}

export interface AgendaViewHourDto {
  hour: number;
  label: string;
}

export interface AgendaDayHourSlotDto extends AgendaViewHourDto {
  items: AgendaItemEnrichedDto[];
}

export interface AgendaDaySpecialItemsDto {
  wakeup: AgendaItemEnrichedDto | null;
  sleep: AgendaItemEnrichedDto | null;
  step: AgendaItemEnrichedDto | null;
}

export interface AgendaDayViewDto {
  mode: 'day';
  timezone: string;
  anchorDate: string;
  label: string;
  dateKey: string;
  isToday: boolean;
  wakeUpHour: number | null;
  sleepHour: number | null;
  navigation: AgendaViewNavigationDto;
  hours: AgendaDayHourSlotDto[];
  allDayItems: AgendaItemEnrichedDto[];
  specialItems: AgendaDaySpecialItemsDto;
  unfinishedItems: AgendaItemEnrichedDto[];
  isEmpty: boolean;
}

export interface AgendaWeekTimedItemDto {
  item: AgendaItemEnrichedDto;
  startMinute: number;
  durationMinutes: number;
  overlapIndex: number;
  overlapCount: number;
}

export interface AgendaWeekDayDto {
  dateKey: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
  allDayItems: AgendaItemEnrichedDto[];
  timedItems: AgendaWeekTimedItemDto[];
}

export interface AgendaWeekViewDto {
  mode: 'week';
  timezone: string;
  anchorDate: string;
  label: string;
  rangeStart: string;
  rangeEnd: string;
  navigation: AgendaViewNavigationDto;
  hours: AgendaViewHourDto[];
  days: AgendaWeekDayDto[];
  unfinishedItems: AgendaItemEnrichedDto[];
}

export interface AgendaMonthDayDto {
  dateKey: string;
  label: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: AgendaItemEnrichedDto[];
  overflowCount: number;
}

export interface AgendaMonthViewDto {
  mode: 'month';
  timezone: string;
  anchorDate: string;
  label: string;
  monthStart: string;
  monthEnd: string;
  navigation: AgendaViewNavigationDto;
  weekdayLabels: string[];
  days: AgendaMonthDayDto[];
  unfinishedItems: AgendaItemEnrichedDto[];
}

export type AgendaViewResponseDto =
  | AgendaDayViewDto
  | AgendaWeekViewDto
  | AgendaMonthViewDto;
