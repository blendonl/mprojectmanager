import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';
import { AgendaItem, AgendaItemStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AgendaItemCompleteUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    id: string,
    completedAt?: Date,
    notes?: string,
  ): Promise<AgendaItem> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      throw new Error('AgendaItem not found');
    }

    const task = await this.prisma.task.findUnique({
      where: { id: item.taskId },
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
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const doneColumn = task.column.board.columns.find((col) =>
      col.name.toLowerCase().includes('done'),
    );

    if (doneColumn && task.columnId !== doneColumn.id) {
      await this.prisma.task.update({
        where: { id: task.id },
        data: { columnId: doneColumn.id },
      });
    }

    return this.agendaItemRepository.update(id, {
      status: AgendaItemStatus.COMPLETED,
      completedAt: completedAt || new Date(),
      notes: notes || item.notes,
    });
  }
}
