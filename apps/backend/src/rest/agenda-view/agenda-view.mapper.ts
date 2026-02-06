import {
  AgendaDayViewDto,
  AgendaMonthViewDto,
  AgendaViewResponseDto,
  AgendaWeekViewDto,
} from 'shared-types';
import {
  AgendaDayView,
  AgendaMonthView,
  AgendaViewResponse,
  AgendaWeekView,
} from '../../core/agenda-view/types/agenda-view.types';
import { AgendaMapper } from '../agenda/agenda.mapper';

export class AgendaViewMapper {
  static toResponse(view: AgendaViewResponse): AgendaViewResponseDto {
    switch (view.mode) {
      case 'day':
        return AgendaViewMapper.toDayViewResponse(view);
      case 'week':
        return AgendaViewMapper.toWeekViewResponse(view);
      case 'month':
        return AgendaViewMapper.toMonthViewResponse(view);
    }
  }

  static toDayViewResponse(view: AgendaDayView): AgendaDayViewDto {
    return {
      ...view,
      hours: view.hours.map((slot) => ({
        hour: slot.hour,
        label: slot.label,
        items: slot.items.map(AgendaMapper.toAgendaItemEnrichedResponse),
      })),
      allDayItems: view.allDayItems.map(AgendaMapper.toAgendaItemEnrichedResponse),
      specialItems: {
        wakeup: view.specialItems.wakeup
          ? AgendaMapper.toAgendaItemEnrichedResponse(view.specialItems.wakeup)
          : null,
        sleep: view.specialItems.sleep
          ? AgendaMapper.toAgendaItemEnrichedResponse(view.specialItems.sleep)
          : null,
        step: view.specialItems.step
          ? AgendaMapper.toAgendaItemEnrichedResponse(view.specialItems.step)
          : null,
      },
      unfinishedItems: view.unfinishedItems.map(AgendaMapper.toAgendaItemEnrichedResponse),
    };
  }

  static toWeekViewResponse(view: AgendaWeekView): AgendaWeekViewDto {
    return {
      ...view,
      hours: view.hours.map((hour) => ({
        hour: hour.hour,
        label: hour.label,
      })),
      days: view.days.map((day) => ({
        ...day,
        allDayItems: day.allDayItems.map(AgendaMapper.toAgendaItemEnrichedResponse),
        timedItems: day.timedItems.map((timed) => ({
          ...timed,
          item: AgendaMapper.toAgendaItemEnrichedResponse(timed.item),
        })),
      })),
      unfinishedItems: view.unfinishedItems.map(AgendaMapper.toAgendaItemEnrichedResponse),
    };
  }

  static toMonthViewResponse(view: AgendaMonthView): AgendaMonthViewDto {
    return {
      ...view,
      days: view.days.map((day) => ({
        ...day,
        items: day.items.map(AgendaMapper.toAgendaItemEnrichedResponse),
      })),
      unfinishedItems: view.unfinishedItems.map(AgendaMapper.toAgendaItemEnrichedResponse),
    };
  }
}
