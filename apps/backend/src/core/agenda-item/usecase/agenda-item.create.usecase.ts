import { Inject, Injectable } from '@nestjs/common';
import { AgendaItem } from '@prisma/client';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';

@Injectable()
export class AgendaItemCreateUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(agendaId: string, data: AgendaItemCreateData): Promise<AgendaItem> {
    return this.agendaItemRepository.create(agendaId, data);
  }
}
