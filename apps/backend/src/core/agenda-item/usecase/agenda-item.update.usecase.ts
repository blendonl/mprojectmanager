import { Inject, Injectable } from '@nestjs/common';
import { AgendaItem } from '@prisma/client';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';

@Injectable()
export class AgendaItemUpdateUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(id: string, data: AgendaItemUpdateData): Promise<AgendaItem> {
    return this.agendaItemRepository.update(id, data);
  }
}
