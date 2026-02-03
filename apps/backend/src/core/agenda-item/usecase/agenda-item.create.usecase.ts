import { Inject, Injectable } from '@nestjs/common';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../../agenda/repository/agenda.repository';

@Injectable()
export class AgendaItemCreateUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  private parseAgendaDate(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  async execute(agendaId: string, data: AgendaItemCreateData): Promise<AgendaItemWithLogs> {
    let agenda = await this.agendaRepository.findById(agendaId);

    if (!agenda) {
      const agendaDateFromId = this.parseAgendaDate(agendaId);
      if (agendaDateFromId) {
        agenda = await this.agendaRepository.findByDate(agendaDateFromId);
        if (!agenda) {
          agenda = await this.agendaRepository.create({ date: agendaDateFromId });
        }
      }
    }

    if (!agenda) {
      const agendaDate = data.startAt || new Date();
      agenda = await this.agendaRepository.create({ date: agendaDate });
    }

    agendaId = agenda.id;

    return this.agendaItemRepository.create(agendaId, data);
  }
}
