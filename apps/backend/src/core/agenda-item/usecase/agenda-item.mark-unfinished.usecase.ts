import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AgendaItem } from '@prisma/client';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';

@Injectable()
export class AgendaItemMarkUnfinishedUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(id: string): Promise<AgendaItem> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Agenda item with id ${id} not found`);
    }

    return this.agendaItemRepository.update(id, {
      isUnfinished: true,
      unfinishedAt: new Date(),
    });
  }
}
