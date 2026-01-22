import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgendaItemEnriched } from '../../agenda/usecase/agenda.get-enriched-by-date.usecase';
import { AgendaItemStatus } from '@prisma/client';

@Injectable()
export class AgendaItemGetUpcomingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(days: number = 7): Promise<AgendaItemEnriched[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    const items = await this.prisma.agendaItem.findMany({
      where: {
        status: AgendaItemStatus.PENDING,
        agenda: {
          date: {
            gte: today,
            lte: endDate,
          },
        },
      },
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
      },
      orderBy: {
        agenda: {
          date: 'asc',
        },
      },
    });

    return items as AgendaItemEnriched[];
  }
}
