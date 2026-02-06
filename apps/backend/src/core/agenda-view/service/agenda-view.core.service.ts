import { Injectable } from '@nestjs/common';
import { AgendaItemCoreService } from '../../agenda-item/service/agenda-item.core.service';
import {
  addDaysToDateKey,
  addMonthsToDateKey,
  formatDateKeyUtc,
  formatDayLabel,
  formatDayNumberLabel,
  formatHourLabel,
  formatMonthLabel,
  formatWeekDayShortLabel,
  formatWeekLabel,
  getMonthGridDays,
  getMonthRange,
  getTodayDateKey,
  getWeekDays,
  getWeekRange,
  getWeekdayLabels,
  getUtcEndOfDay,
  getUtcStartOfDay,
  getTimePartsInTimeZone,
} from '../utils/agenda-view-date.utils';
import { assignOverlapLayout } from '../utils/agenda-view-layout.utils';
import {
  AgendaDayHourSlot,
  AgendaDayView,
  AgendaMonthDay,
  AgendaMonthView,
  AgendaViewHour,
  AgendaViewNavigation,
  AgendaWeekDay,
  AgendaWeekTimedItem,
  AgendaWeekView,
} from '../types/agenda-view.types';
import { AgendaItemEnriched } from '../../agenda-item/usecase/agenda.get-enriched-by-date.usecase';

const DEFAULT_EVENT_DURATION_MINUTES = 30;
const MAX_MONTH_ITEMS = 3;

@Injectable()
export class AgendaViewCoreService {
  constructor(private readonly agendaItemService: AgendaItemCoreService) {}

  async getDayView(anchorDate: string, timeZone: string): Promise<AgendaDayView> {
    const todayDateKey = getTodayDateKey(timeZone);
    const navigation = this.buildDayNavigation(anchorDate, todayDateKey);
    const agendaDate = getUtcStartOfDay(anchorDate);
    const agenda = await this.agendaItemService.getEnrichedAgendaByDate(agendaDate);
    const items = agenda?.items ?? [];

    const classified = this.classifyItems(items);
    const scheduledItems = this.filterScheduledItems([
      ...classified.tasks,
      ...classified.routines,
    ]);

    const allDayItems = scheduledItems.filter((item) => !item.startAt);
    const timedItems = scheduledItems.filter((item) => item.startAt);
    const hours = this.buildHourSlots(timedItems, timeZone);

    const wakeup = classified.sleepItems[1] ?? null;
    const sleep = classified.sleepItems[0] ?? null;
    const step = classified.steps[0] ?? null;

    const wakeUpHour = wakeup?.startAt
      ? getTimePartsInTimeZone(wakeup.startAt, timeZone).hour
      : null;
    const sleepHour = sleep?.startAt
      ? getTimePartsInTimeZone(sleep.startAt, timeZone).hour
      : null;

    const unfinishedItems = items.filter((item) => item.status === 'UNFINISHED');
    const hasAnyContent =
      classified.tasks.length > 0 ||
      classified.routines.length > 0 ||
      classified.steps.length > 0 ||
      !!wakeup ||
      !!sleep ||
      unfinishedItems.length > 0;

    return {
      mode: 'day',
      timezone: timeZone,
      anchorDate,
      label: formatDayLabel(anchorDate, timeZone),
      dateKey: anchorDate,
      isToday: anchorDate === todayDateKey,
      wakeUpHour,
      sleepHour,
      navigation,
      hours,
      allDayItems,
      specialItems: {
        wakeup,
        sleep,
        step,
      },
      unfinishedItems,
      isEmpty: !hasAnyContent,
    };
  }

  async getWeekView(anchorDate: string, timeZone: string): Promise<AgendaWeekView> {
    const todayDateKey = getTodayDateKey(timeZone);
    const range = getWeekRange(anchorDate, timeZone);
    const navigation = this.buildWeekNavigation(range.start, todayDateKey);
    const itemsByDate = await this.getAgendaItemsByDateRange(range.start, range.end);
    const weekDays = getWeekDays(anchorDate, timeZone);

    const days: AgendaWeekDay[] = weekDays.map((dateKey) => {
      const items = itemsByDate.get(dateKey) ?? [];
      const classified = this.classifyItems(items);
      const scheduledItems = this.filterScheduledItems([
        ...classified.tasks,
        ...classified.routines,
      ]);

      const allDayItems = scheduledItems.filter((item) => !item.startAt);
      const timedItems = scheduledItems.filter((item) => item.startAt);
      const timedLayout = this.buildTimedLayout(timedItems, timeZone);

      return {
        dateKey,
        label: formatDayNumberLabel(dateKey, timeZone),
        shortLabel: formatWeekDayShortLabel(dateKey, timeZone),
        isToday: dateKey === todayDateKey,
        allDayItems,
        timedItems: timedLayout,
      };
    });

    const anchorAgendaDate = getUtcStartOfDay(anchorDate);
    const anchorAgenda = await this.agendaItemService.getEnrichedAgendaByDate(anchorAgendaDate);
    const anchorItems = anchorAgenda?.items ?? [];
    const unfinishedItems = anchorItems.filter((item) => item.status === 'UNFINISHED');

    return {
      mode: 'week',
      timezone: timeZone,
      anchorDate,
      label: formatWeekLabel(range.start, range.end, timeZone),
      rangeStart: range.start,
      rangeEnd: range.end,
      navigation,
      hours: this.buildHours(),
      days,
      unfinishedItems,
    };
  }

  async getMonthView(anchorDate: string, timeZone: string): Promise<AgendaMonthView> {
    const todayDateKey = getTodayDateKey(timeZone);
    const monthRange = getMonthRange(anchorDate);
    const gridDays = getMonthGridDays(anchorDate, timeZone);
    const gridStart = gridDays[0];
    const gridEnd = gridDays[gridDays.length - 1];
    const navigation = this.buildMonthNavigation(monthRange.start, todayDateKey);
    const itemsByDate = await this.getAgendaItemsByDateRange(gridStart, gridEnd);

    const days: AgendaMonthDay[] = gridDays.map((dateKey) => {
      const items = itemsByDate.get(dateKey) ?? [];
      const classified = this.classifyItems(items);
      const scheduledItems = this.filterScheduledItems([
        ...classified.tasks,
        ...classified.routines,
      ]);
      const sortedItems = this.sortItemsForMonth(scheduledItems, timeZone);
      const visibleItems = sortedItems.slice(0, MAX_MONTH_ITEMS);
      const overflowCount = Math.max(0, sortedItems.length - visibleItems.length);

      return {
        dateKey,
        label: formatDayNumberLabel(dateKey, timeZone),
        isToday: dateKey === todayDateKey,
        isCurrentMonth: dateKey.slice(0, 7) === monthRange.start.slice(0, 7),
        items: visibleItems,
        overflowCount,
      };
    });

    const anchorAgendaDate = getUtcStartOfDay(anchorDate);
    const anchorAgenda = await this.agendaItemService.getEnrichedAgendaByDate(anchorAgendaDate);
    const anchorItems = anchorAgenda?.items ?? [];
    const unfinishedItems = anchorItems.filter((item) => item.status === 'UNFINISHED');

    return {
      mode: 'month',
      timezone: timeZone,
      anchorDate,
      label: formatMonthLabel(monthRange.start, timeZone),
      monthStart: monthRange.start,
      monthEnd: monthRange.end,
      navigation,
      weekdayLabels: getWeekdayLabels(timeZone),
      days,
      unfinishedItems,
    };
  }

  private buildDayNavigation(anchorDate: string, todayDateKey: string): AgendaViewNavigation {
    return {
      anchorDate,
      previousAnchorDate: addDaysToDateKey(anchorDate, -1),
      nextAnchorDate: addDaysToDateKey(anchorDate, 1),
      todayAnchorDate: todayDateKey,
    };
  }

  private buildWeekNavigation(weekStartDate: string, todayDateKey: string): AgendaViewNavigation {
    return {
      anchorDate: weekStartDate,
      previousAnchorDate: addDaysToDateKey(weekStartDate, -7),
      nextAnchorDate: addDaysToDateKey(weekStartDate, 7),
      todayAnchorDate: todayDateKey,
    };
  }

  private buildMonthNavigation(monthStartDate: string, todayDateKey: string): AgendaViewNavigation {
    return {
      anchorDate: monthStartDate,
      previousAnchorDate: addMonthsToDateKey(monthStartDate, -1),
      nextAnchorDate: addMonthsToDateKey(monthStartDate, 1),
      todayAnchorDate: todayDateKey,
    };
  }

  private async getAgendaItemsByDateRange(
    startDateKey: string,
    endDateKey: string
  ): Promise<Map<string, AgendaItemEnriched[]>> {
    const startDate = getUtcStartOfDay(startDateKey);
    const endDate = getUtcEndOfDay(endDateKey);
    const result = await this.agendaItemService.findAgendaItems({
      startDate,
      endDate,
      mode: 'all',
      page: 1,
      limit: 1000,
    });

    const itemsByDate = new Map<string, AgendaItemEnriched[]>();
    result.items.forEach((agenda) => {
      const dateKey = formatDateKeyUtc(agenda.date);
      itemsByDate.set(dateKey, agenda.items as AgendaItemEnriched[]);
    });

    return itemsByDate;
  }

  private classifyItems(items: AgendaItemEnriched[]) {
    const routineItems = items.filter((item) => item.routineTask);
    const taskItems = items.filter((item) => item.task && !item.routineTask);
    const sleepItems = routineItems
      .filter((item) => item.routineTask?.routine?.type === 'SLEEP')
      .sort((left, right) => left.position - right.position);
    const steps = routineItems.filter((item) => item.routineTask?.routine?.type === 'STEP');
    const routines = routineItems.filter(
      (item) =>
        item.routineTask?.routine?.type !== 'SLEEP'
        && item.routineTask?.routine?.type !== 'STEP'
    );

    return {
      tasks: taskItems,
      routines,
      steps,
      sleepItems,
    };
  }

  private filterScheduledItems(items: AgendaItemEnriched[]): AgendaItemEnriched[] {
    return items.filter((item) => item.status !== 'UNFINISHED');
  }

  private buildHours(): AgendaViewHour[] {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: formatHourLabel(hour),
    }));
  }

  private buildHourSlots(
    timedItems: AgendaItemEnriched[],
    timeZone: string
  ): AgendaDayHourSlot[] {
    const hours = this.buildHours();
    const grouped = new Map<number, AgendaItemEnriched[]>();

    const sorted = [...timedItems].sort((left, right) => {
      const leftTime = this.getStartMinute(left, timeZone);
      const rightTime = this.getStartMinute(right, timeZone);
      if (leftTime !== rightTime) return leftTime - rightTime;
      return this.getItemPriority(left) - this.getItemPriority(right);
    });

    sorted.forEach((item) => {
      if (!item.startAt) return;
      const { hour } = getTimePartsInTimeZone(item.startAt, timeZone);
      const existing = grouped.get(hour) ?? [];
      grouped.set(hour, [...existing, item]);
    });

    return hours.map((hour) => ({
      ...hour,
      items: grouped.get(hour.hour) ?? [],
    }));
  }

  private buildTimedLayout(
    timedItems: AgendaItemEnriched[],
    timeZone: string
  ): AgendaWeekTimedItem[] {
    const input = timedItems.map((item) => ({
      item,
      startMinute: this.getStartMinute(item, timeZone),
      durationMinutes: this.getDurationMinutes(item),
    }));

    return assignOverlapLayout(input);
  }

  private getStartMinute(item: AgendaItemEnriched, timeZone: string): number {
    if (!item.startAt) return 0;
    const { hour, minute } = getTimePartsInTimeZone(item.startAt, timeZone);
    return hour * 60 + minute;
  }

  private getDurationMinutes(item: AgendaItemEnriched): number {
    if (item.duration && item.duration > 0) return item.duration;
    return DEFAULT_EVENT_DURATION_MINUTES;
  }

  private getItemPriority(item: AgendaItemEnriched): number {
    const itemType = item.type;
    if (itemType === 'MEETING') return 1;
    if (itemType === 'MILESTONE') return 2;
    if (item.taskId) return 3;
    if (item.routineTaskId) return 4;
    return 5;
  }

  private sortItemsForMonth(
    items: AgendaItemEnriched[],
    timeZone: string
  ): AgendaItemEnriched[] {
    return [...items].sort((left, right) => {
      const leftHasTime = !!left.startAt;
      const rightHasTime = !!right.startAt;
      if (leftHasTime !== rightHasTime) return leftHasTime ? 1 : -1;
      const leftTime = this.getStartMinute(left, timeZone);
      const rightTime = this.getStartMinute(right, timeZone);
      if (leftTime !== rightTime) return leftTime - rightTime;
      return this.getItemPriority(left) - this.getItemPriority(right);
    });
  }
}
