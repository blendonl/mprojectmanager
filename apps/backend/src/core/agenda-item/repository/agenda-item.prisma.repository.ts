import { Injectable } from '@nestjs/common';
import { AgendaItemStatus, RoutineType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgendaItemRepository, AgendaItemWithLogs } from './agenda-item.repository';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';
import { AgendaItemEnriched } from '../usecase/agenda.get-enriched-by-date.usecase';

@Injectable()
export class AgendaItemPrismaRepository implements AgendaItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByAgendaId(agendaId: string): Promise<AgendaItemWithLogs[]> {
    return this.prisma.agendaItem.findMany({
      where: { agendaId },
      orderBy: { position: 'asc' },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });
  }

  findById(id: string): Promise<AgendaItemWithLogs | null> {
    return this.prisma.agendaItem.findUnique({
      where: { id },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });
  }

  create(agendaId: string, data: AgendaItemCreateData): Promise<AgendaItemWithLogs> {
    return this.prisma.agendaItem.create({
      data: {
        agendaId,
        taskId: data.taskId,
        routineTaskId: data.routineTaskId ?? undefined,
        status: data.status,
        startAt: data.startAt,
        duration: data.duration,
        position: data.position ?? 0,
      },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });
  }

  update(id: string, data: AgendaItemUpdateData): Promise<AgendaItemWithLogs> {
    return this.prisma.agendaItem.update({
      where: { id },
      data: {
        taskId: data.taskId,
        routineTaskId: data.routineTaskId ?? undefined,
        status: data.status,
        startAt: data.startAt,
        duration: data.duration,
        position: data.position,
      },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agendaItem.delete({ where: { id } });
  }

  private getEnrichedInclude() {
    return {
      task: {
        include: {
          column: {
            include: {
              board: {
                include: {
                  project: true,
                },
              },
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
        orderBy: { createdAt: 'asc' as const },
      },
    };
  }

  async findTasksByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]> {
    return this.prisma.agendaItem.findMany({
      where: {
        agendaId,
        taskId: { not: null },
        status: { not: AgendaItemStatus.UNFINISHED },
      },
      orderBy: { position: 'asc' },
      include: this.getEnrichedInclude(),
    }) as Promise<AgendaItemEnriched[]>;
  }

  async findRoutinesByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]> {
    return this.prisma.agendaItem.findMany({
      where: {
        agendaId,
        routineTaskId: { not: null },
        status: { not: AgendaItemStatus.UNFINISHED },
        routineTask: {
          routine: {
            type: RoutineType.OTHER,
          },
        },
      },
      orderBy: { position: 'asc' },
      include: this.getEnrichedInclude(),
    }) as Promise<AgendaItemEnriched[]>;
  }

  async findStepsByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]> {
    return this.prisma.agendaItem.findMany({
      where: {
        agendaId,
        routineTaskId: { not: null },
        status: { not: AgendaItemStatus.UNFINISHED },
        routineTask: {
          routine: {
            type: RoutineType.STEP,
          },
        },
      },
      orderBy: { position: 'asc' },
      include: this.getEnrichedInclude(),
    }) as Promise<AgendaItemEnriched[]>;
  }

  async findSleepItemsByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]> {
    return this.prisma.agendaItem.findMany({
      where: {
        agendaId,
        routineTaskId: { not: null },
        status: { not: AgendaItemStatus.UNFINISHED },
        routineTask: {
          routine: {
            type: RoutineType.SLEEP,
          },
        },
      },
      orderBy: { position: 'asc' },
      include: this.getEnrichedInclude(),
    }) as Promise<AgendaItemEnriched[]>;
  }

  async findUnfinishedByAgendaId(agendaId: string): Promise<AgendaItemEnriched[]> {
    return this.prisma.agendaItem.findMany({
      where: {
        agendaId,
        status: AgendaItemStatus.UNFINISHED,
      },
      orderBy: { position: 'asc' },
      include: this.getEnrichedInclude(),
    }) as Promise<AgendaItemEnriched[]>;
  }
}
