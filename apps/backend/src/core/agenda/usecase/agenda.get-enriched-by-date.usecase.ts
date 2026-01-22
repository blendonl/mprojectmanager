import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';
import { PrismaService } from '../../../prisma/prisma.service';

export interface AgendaItemEnriched {
  id: string;
  agendaId: string;
  taskId: string;
  type: string;
  status: string;
  startAt: Date | null;
  duration: number | null;
  position: number;
  notes: string | null;
  completedAt: Date | null;
  notificationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  task: {
    id: string;
    title: string;
    description: string | null;
    columnId: string;
    column: {
      boardId: string;
      board: {
        projectId: string;
      };
    };
  };
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
    private readonly prisma: PrismaService,
  ) {}

  async execute(date: Date): Promise<AgendaEnriched | null> {
    const agenda = await this.prisma.agenda.findFirst({
      where: { date },
      include: {
        items: {
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
          orderBy: { position: 'asc' },
        },
      },
    });

    return agenda as AgendaEnriched | null;
  }
}
