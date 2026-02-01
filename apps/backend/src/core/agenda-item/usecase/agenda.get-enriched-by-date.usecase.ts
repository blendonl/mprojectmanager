import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../../agenda/repository/agenda.repository';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';
import { PrismaService } from '../../../prisma/prisma.service';

export interface AgendaItemLogEnriched {
  id: string;
  agendaItemId: string;
  type: string;
  previousValue: any;
  newValue: any;
  notes: string | null;
  createdAt: Date;
}

export interface AgendaItemEnriched {
  id: string;
  agendaId: string;
  taskId: string | null;
  routineTaskId?: string | null;
  routineTask?: {
    id: string;
    name: string;
    target: string;
    routineId: string;
    routine: {
      id: string;
      name: string;
      type: string;
      target: string;
    };
  } | null;
  type: string;
  status: string;
  startAt: Date | null;
  duration: number | null;
  position: number;
  notes: string | null;
  notificationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  logs: AgendaItemLogEnriched[];
  task?: {
    id: string;
    title: string;
    description: string | null;
    columnId: string;
    column: {
      boardId: string;
      name?: string;
      board: {
        projectId: string;
        name?: string;
        project?: {
          name: string;
        };
      };
    };
  } | null;
}

export interface AgendaEnriched {
  id: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  items: AgendaItemEnriched[];
}

@Injectable()
export class AgendaGetEnrichedByDateUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(date: Date): Promise<AgendaEnriched | null> {
    const agenda = await this.prisma.agenda.findFirst({
      where: { date },
    });

    if (!agenda) {
      return null;
    }

    const [tasks, routines, steps, sleepItems, unfinished] = await Promise.all([
      this.agendaItemRepository.findTasksByAgendaId(agenda.id),
      this.agendaItemRepository.findRoutinesByAgendaId(agenda.id),
      this.agendaItemRepository.findStepsByAgendaId(agenda.id),
      this.agendaItemRepository.findSleepItemsByAgendaId(agenda.id),
      this.agendaItemRepository.findUnfinishedByAgendaId(agenda.id),
    ]);

    return {
      ...agenda,
      items: [...tasks, ...routines, ...steps, ...sleepItems, ...unfinished],
    } as AgendaEnriched;
  }
}
