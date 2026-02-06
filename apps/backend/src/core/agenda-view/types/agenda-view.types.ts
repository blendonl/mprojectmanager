import { AgendaItemEnriched } from '../../agenda-item/usecase/agenda.get-enriched-by-date.usecase';

export type AgendaViewMode = 'day' | 'week' | 'month';

export interface AgendaViewNavigation {
  anchorDate: string;
  previousAnchorDate: string;
  nextAnchorDate: string;
  todayAnchorDate: string;
}

export interface AgendaViewHour {
  hour: number;
  label: string;
}

export interface AgendaDayHourSlot extends AgendaViewHour {
  items: AgendaItemEnriched[];
}

export interface AgendaDaySpecialItems {
  wakeup: AgendaItemEnriched | null;
  sleep: AgendaItemEnriched | null;
  step: AgendaItemEnriched | null;
}

export interface AgendaDayView {
  mode: 'day';
  timezone: string;
  anchorDate: string;
  label: string;
  dateKey: string;
  isToday: boolean;
  wakeUpHour: number | null;
  sleepHour: number | null;
  navigation: AgendaViewNavigation;
  hours: AgendaDayHourSlot[];
  allDayItems: AgendaItemEnriched[];
  specialItems: AgendaDaySpecialItems;
  unfinishedItems: AgendaItemEnriched[];
  isEmpty: boolean;
}

export interface AgendaWeekTimedItem {
  item: AgendaItemEnriched;
  startMinute: number;
  durationMinutes: number;
  overlapIndex: number;
  overlapCount: number;
}

export interface AgendaWeekDay {
  dateKey: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
  allDayItems: AgendaItemEnriched[];
  timedItems: AgendaWeekTimedItem[];
}

export interface AgendaWeekView {
  mode: 'week';
  timezone: string;
  anchorDate: string;
  label: string;
  rangeStart: string;
  rangeEnd: string;
  navigation: AgendaViewNavigation;
  hours: AgendaViewHour[];
  days: AgendaWeekDay[];
  unfinishedItems: AgendaItemEnriched[];
}

export interface AgendaMonthDay {
  dateKey: string;
  label: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: AgendaItemEnriched[];
  overflowCount: number;
}

export interface AgendaMonthView {
  mode: 'month';
  timezone: string;
  anchorDate: string;
  label: string;
  monthStart: string;
  monthEnd: string;
  navigation: AgendaViewNavigation;
  weekdayLabels: string[];
  days: AgendaMonthDay[];
  unfinishedItems: AgendaItemEnriched[];
}

export type AgendaViewResponse = AgendaDayView | AgendaWeekView | AgendaMonthView;
