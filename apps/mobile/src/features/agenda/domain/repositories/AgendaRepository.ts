import { AgendaItem } from "../entities/AgendaItem";

export interface AgendaRepository {
  loadAgendaItemsForDate(date: string): Promise<AgendaItem[]>;

  loadAgendaItemsForDateRange(startDate: string, endDate: string): Promise<AgendaItem[]>;

  loadAgendaItemById(agendaItemId: string): Promise<AgendaItem | null>;

  loadAllAgendaItems(): Promise<AgendaItem[]>;

  saveAgendaItem(item: AgendaItem): Promise<void>;

  deleteAgendaItem(item: AgendaItem): Promise<boolean>;

  getOrphanedAgendaItems(): Promise<AgendaItem[]>;

  getOverdueAgendaItems(): Promise<AgendaItem[]>;

  getUpcomingAgendaItems(days?: number): Promise<AgendaItem[]>;

  loadUnfinishedItems(beforeDate?: string): Promise<AgendaItem[]>;

  completeAgendaItem(itemId: string, completedAt?: Date, notes?: string): Promise<AgendaItem>;

  rescheduleAgendaItem(itemId: string, newDate: string, startAt?: Date | null, duration?: number | null): Promise<AgendaItem>;
}
