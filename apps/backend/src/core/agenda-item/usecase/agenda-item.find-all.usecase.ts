import { Inject, Injectable } from '@nestjs/common';
import { AgendaItemStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';

export interface AgendaItemFindAllParams {
  startDate?: Date;
  endDate?: Date;
  query?: string;
  mode?: 'all' | 'unfinished';
  page?: number;
  limit?: number;
}

export interface AgendaItemFindAllResult {
  items: Array<{
    id: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    items: any[];
  }>;
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class AgendaItemFindAllUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(params: AgendaItemFindAllParams): Promise<AgendaItemFindAllResult> {
    const agendaWhere: Prisma.AgendaWhereInput = {};
    if (params.startDate && params.endDate) {
      agendaWhere.date = {
        gte: params.startDate,
        lte: params.endDate,
      };
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const skip = (page - 1) * limit;

    const [total, agendas] = await this.prisma.$transaction([
      this.prisma.agenda.count({ where: agendaWhere }),
      this.prisma.agenda.findMany({
        where: agendaWhere,
        orderBy: { date: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    const enrichedAgendas = await Promise.all(
      agendas.map(async (agenda) => {
        let items: any[];

        if (params.mode === 'unfinished') {
          items = await this.agendaItemRepository.findUnfinishedByAgendaId(agenda.id);
        } else {
          const [tasks, routines, steps, sleepItems] = await Promise.all([
            this.agendaItemRepository.findTasksByAgendaId(agenda.id),
            this.agendaItemRepository.findRoutinesByAgendaId(agenda.id),
            this.agendaItemRepository.findStepsByAgendaId(agenda.id),
            this.agendaItemRepository.findSleepItemsByAgendaId(agenda.id),
          ]);
          items = [...tasks, ...routines, ...steps, ...sleepItems];
        }

        if (params.query) {
          const query = params.query.toLowerCase();
          items = items.filter((item: any) => {
            const taskTitle = item.task?.title?.toLowerCase() || '';
            const routineTaskName = item.routineTask?.name?.toLowerCase() || '';
            return taskTitle.includes(query) || routineTaskName.includes(query);
          });
        }

        return {
          ...agenda,
          items,
        };
      }),
    );

    return {
      items: enrichedAgendas,
      total,
      page,
      limit,
    };
  }
}
