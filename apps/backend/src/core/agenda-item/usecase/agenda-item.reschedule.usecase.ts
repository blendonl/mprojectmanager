import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../../agenda/repository/agenda.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AgendaItemRescheduleUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    id: string,
    newDate: Date,
    startAt?: Date | null,
    duration?: number | null,
  ): Promise<AgendaItemWithLogs> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      throw new Error('AgendaItem not found');
    }

    let newAgenda = await this.agendaRepository.findByDate(newDate);
    if (!newAgenda) {
      newAgenda = await this.agendaRepository.create({ date: newDate });
    }

    return this.prisma.agendaItem.update({
      where: { id },
      data: {
        agendaId: newAgenda.id,
        startAt: startAt !== undefined ? startAt : item.startAt,
        duration: duration !== undefined ? duration : item.duration,
      },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
