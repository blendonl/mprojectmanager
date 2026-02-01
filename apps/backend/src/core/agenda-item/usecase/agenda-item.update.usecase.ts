import { Inject, Injectable } from '@nestjs/common';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';

@Injectable()
export class AgendaItemUpdateUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(id: string, data: AgendaItemUpdateData): Promise<AgendaItemWithLogs> {
    return this.agendaItemRepository.update(id, data);
  }
}
