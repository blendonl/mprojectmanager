import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgendaItemEnriched } from '../../agenda/usecase/agenda.get-enriched-by-date.usecase';
import { AgendaItemStatus } from '@prisma/client';

@Injectable()
export class AgendaItemGetOverdueUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<AgendaItemEnriched[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await this.prisma.agendaItem.findMany({
      where: {
        status: {
          in: [AgendaItemStatus.PENDING],
        },
        agenda: {
          date: {
            lt: today,
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
    });

    return items as AgendaItemEnriched[];
  }
}
