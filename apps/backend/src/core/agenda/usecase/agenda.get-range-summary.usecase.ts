import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface AgendaRangeSummaryItem {
  date: Date;
  agendaItemsTotal: number;
}

export interface AgendaRangeSummaryResult {
  items: AgendaRangeSummaryItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class AgendaGetRangeSummaryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
  ): Promise<AgendaRangeSummaryResult> {
    const skip = (page - 1) * limit;

    const [total, agendas] = await this.prisma.$transaction([
      this.prisma.agenda.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      this.prisma.agenda.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
        skip,
        take: limit,
        select: {
          date: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
    ]);

    return {
      items: agendas.map((agenda) => ({
        date: agenda.date,
        agendaItemsTotal: agenda._count.items,
      })),
      total,
      page,
      limit,
    };
  }
}
