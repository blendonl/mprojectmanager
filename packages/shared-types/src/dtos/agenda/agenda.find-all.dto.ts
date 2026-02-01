import { AgendaItemEnrichedDto } from './agenda-item.dto';

export interface AgendaFindAllItemDto {
  date: string; // YYYY-MM-DD
  agendaItemsTotal: number;
}

export interface AgendaFindAllResponse {
  items: AgendaFindAllItemDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AgendaItemsSleepDto {
  sleep: AgendaItemEnrichedDto | null;
  wakeup: AgendaItemEnrichedDto | null;
}

export interface AgendaItemsDayDto {
  date: string; // YYYY-MM-DD
  agendaItemsTotal: number;
  sleep: AgendaItemsSleepDto;
  steps: AgendaItemEnrichedDto[];
  routines: AgendaItemEnrichedDto[];
  tasks: AgendaItemEnrichedDto[];
  unfinished: AgendaItemEnrichedDto[];
}

export interface AgendaItemsFindAllResponse {
  items: AgendaItemsDayDto[];
  total: number;
  page: number;
  limit: number;
}
