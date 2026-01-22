import { AgendaItem } from '@prisma/client';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';

export const AGENDA_ITEM_REPOSITORY = 'AGENDA_ITEM_REPOSITORY';

export interface AgendaItemRepository {
  findAllByAgendaId(agendaId: string): Promise<AgendaItem[]>;
  findById(id: string): Promise<AgendaItem | null>;
  create(agendaId: string, data: AgendaItemCreateData): Promise<AgendaItem>;
  update(id: string, data: AgendaItemUpdateData): Promise<AgendaItem>;
  delete(id: string): Promise<void>;
}
