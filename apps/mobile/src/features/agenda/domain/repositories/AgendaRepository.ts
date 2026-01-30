import { AgendaItem } from "../entities/AgendaItem";
import { DayAgenda, ScheduledAgendaItem, CreateAgendaItemRequest } from "../interfaces/AgendaService.interface";

export interface AgendaRepository {
  loadAgendaItemsForDate(date: string): Promise<DayAgenda | null>;

  loadAgendaItemsForDateRange(startDate: string, endDate: string): Promise<AgendaItem[]>;

  loadAgendasForDateRange(startDate: string, endDate: string): Promise<DayAgenda[]>;

  searchAgendaItems(query: string, mode: 'all' | 'unfinished'): Promise<ScheduledAgendaItem[]>;

  loadAgendaItemById(agendaItemId: string): Promise<AgendaItem | null>;

  loadAllAgendaItems(): Promise<AgendaItem[]>;

  createAgendaItem(request: CreateAgendaItemRequest): Promise<AgendaItem>;

  saveAgendaItem(item: AgendaItem): Promise<void>;

  deleteAgendaItem(item: AgendaItem): Promise<boolean>;

  getOrphanedAgendaItems(): Promise<AgendaItem[]>;

  getOverdueAgendaItems(): Promise<AgendaItem[]>;

  getUpcomingAgendaItems(days?: number): Promise<AgendaItem[]>;

  loadUnfinishedItems(beforeDate?: string): Promise<AgendaItem[]>;

  completeAgendaItem(itemId: string, completedAt?: Date, notes?: string): Promise<AgendaItem>;

  rescheduleAgendaItem(itemId: string, newDate: string, startAt?: Date | null, duration?: number | null): Promise<AgendaItem>;
}
