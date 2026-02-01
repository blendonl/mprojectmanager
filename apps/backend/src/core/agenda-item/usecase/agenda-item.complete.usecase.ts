import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import { AgendaItemStatus, AgendaItemLogType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgendaItemLogCreateUseCase } from './agenda-item-log.create.usecase';

@Injectable()
export class AgendaItemCompleteUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly prisma: PrismaService,
    private readonly logUseCase: AgendaItemLogCreateUseCase,
  ) {}

  async execute(
    id: string,
    completedAt?: Date,
    notes?: string,
  ): Promise<AgendaItemWithLogs> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      throw new Error('AgendaItem not found');
    }

    const task = item.taskId ? await this.prisma.task.findUnique({
      where: { id: item.taskId ?? undefined },
      include: {
        column: {
          include: {
            board: {
              include: {
                columns: true,
              },
            },
          },
        },
      },
    }) : null;

    if (task) {
      const doneColumn = task.column?.board.columns.find((col) =>
        col.name.toLowerCase().includes('done'),
      );

      if (doneColumn && task.columnId !== doneColumn.id) {
        await this.prisma.task.update({
          where: { id: task.id },
          data: { columnId: doneColumn.id },
        });
      }
    }

    const updated = await this.agendaItemRepository.update(id, {
      status: AgendaItemStatus.COMPLETED,
      notes: notes || item.notes,
    });

    await this.logUseCase.execute({
      agendaItemId: id,
      type: AgendaItemLogType.COMPLETED,
      previousValue: { status: item.status },
      newValue: { status: AgendaItemStatus.COMPLETED, completedAt: completedAt || new Date() },
      notes,
    });

    return updated;
  }
}
