import { Injectable } from '@nestjs/common';
import { AgendaItem } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgendaItemRepository } from './agenda-item.repository';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';

@Injectable()
export class AgendaItemPrismaRepository implements AgendaItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByAgendaId(agendaId: string): Promise<AgendaItem[]> {
    return this.prisma.agendaItem.findMany({
      where: { agendaId },
      orderBy: { position: 'asc' },
    });
  }

  findById(id: string): Promise<AgendaItem | null> {
    return this.prisma.agendaItem.findUnique({
      where: { id },
    });
  }

  create(agendaId: string, data: AgendaItemCreateData): Promise<AgendaItem> {
    return this.prisma.agendaItem.create({
      data: {
        agendaId,
        taskId: data.taskId,
        status: data.status,
        startAt: data.startAt,
        duration: data.duration,
        position: data.position ?? 0,
      },
    });
  }

  update(id: string, data: AgendaItemUpdateData): Promise<AgendaItem> {
    return this.prisma.agendaItem.update({
      where: { id },
      data: {
        taskId: data.taskId,
        status: data.status,
        startAt: data.startAt,
        duration: data.duration,
        position: data.position,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agendaItem.delete({ where: { id } });
  }
}
