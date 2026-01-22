import { Inject, Injectable } from '@nestjs/common';
import { AgendaItem } from '@prisma/client';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';

@Injectable()
export class AgendaItemGetOneUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(id: string): Promise<AgendaItem | null> {
    return this.agendaItemRepository.findById(id);
  }
}
