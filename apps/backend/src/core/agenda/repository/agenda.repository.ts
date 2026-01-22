import { Agenda } from '@prisma/client';
import { AgendaCreateData } from '../data/agenda.create.data';
import { AgendaUpdateData } from '../data/agenda.update.data';

export const AGENDA_REPOSITORY = 'AGENDA_REPOSITORY';

export interface AgendaRepository {
  findAll(): Promise<Agenda[]>;
  findById(id: string): Promise<Agenda | null>;
  findByDate(date: Date): Promise<Agenda | null>;
  create(data: AgendaCreateData): Promise<Agenda>;
  update(id: string, data: AgendaUpdateData): Promise<Agenda>;
  delete(id: string): Promise<void>;
}
