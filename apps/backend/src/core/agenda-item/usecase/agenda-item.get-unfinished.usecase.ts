import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgendaItemEnriched } from './agenda.get-enriched-by-date.usecase';
import { AgendaItemStatus } from '@prisma/client';

@Injectable()
export class AgendaItemGetUnfinishedUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(beforeDate?: Date): Promise<AgendaItemEnriched[]> {
    const where: any = {
      status: AgendaItemStatus.UNFINISHED,
    };

    if (beforeDate) {
      where.agenda = {
        date: {
          lt: beforeDate,
        },
      };
    }

    const items = await this.prisma.agendaItem.findMany({
      where,
      include: {
        task: {
          include: {
            column: {
              include: {
                board: true,
              },
            },
          },
        },
        routineTask: {
          include: {
            routine: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        agenda: {
          date: 'desc',
        },
      },
    });

    return items as AgendaItemEnriched[];
  }
}
