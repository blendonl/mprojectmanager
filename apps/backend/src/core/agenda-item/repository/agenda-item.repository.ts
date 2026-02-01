import { AgendaItem, AgendaItemLog } from '@prisma/client';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';
import { AgendaItemEnriched } from '../usecase/agenda.get-enriched-by-date.usecase';

export const AGENDA_ITEM_REPOSITORY = 'AGENDA_ITEM_REPOSITORY';

export type AgendaItemWithLogs = AgendaItem & {
  logs: AgendaItemLog[];
};

export interface AgendaItemRepository {
  findAllByAgendaId(agendaId: string): Promise<AgendaItemWithLogs[]>;
  findById(id: string): Promise<AgendaItemWithLogs | null>;
  create(agendaId: string, data: AgendaItemCreateData): Promise<AgendaItemWithLogs>;
  update(id: string, data: AgendaItemUpdateData): Promise<AgendaItemWithLogs>;
  delete(id: string): Promise<void>;

  findTasksByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]>;
  findRoutinesByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]>;
  findStepsByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]>;
  findSleepItemsByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]>;
  findUnfinishedByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]>;
}
