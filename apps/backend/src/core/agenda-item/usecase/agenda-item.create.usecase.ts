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

  async execute(agendaId: string, data: AgendaItemCreateData): Promise<AgendaItemWithLogs> {
    let agenda = await this.agendaRepository.findById(agendaId);

    if (!agenda) {
      const agendaDate = data.startAt || new Date();
      agenda = await this.agendaRepository.create({ date: agendaDate });
      agendaId = agenda.id;
    }

    return this.agendaItemRepository.create(agendaId, data);
  }
}
