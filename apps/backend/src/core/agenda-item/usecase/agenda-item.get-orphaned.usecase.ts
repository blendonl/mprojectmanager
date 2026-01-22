import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgendaItemEnriched } from '../../agenda/usecase/agenda.get-enriched-by-date.usecase';

@Injectable()
export class AgendaItemGetOrphanedUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<AgendaItemEnriched[]> {
    const items = await this.prisma.agendaItem.findMany({
      where: {},
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
