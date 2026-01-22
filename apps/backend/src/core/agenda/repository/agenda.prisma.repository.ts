import { Injectable } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgendaRepository } from './agenda.repository';
import { AgendaCreateData } from '../data/agenda.create.data';
import { AgendaUpdateData } from '../data/agenda.update.data';

@Injectable()
export class AgendaPrismaRepository implements AgendaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Agenda[]> {
    return this.prisma.agenda.findMany({
      orderBy: { date: 'desc' },
    });
  }

  findById(id: string): Promise<Agenda | null> {
    return this.prisma.agenda.findUnique({
      where: { id },
    });
  }

  findByDate(date: Date): Promise<Agenda | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.agenda.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  create(data: AgendaCreateData): Promise<Agenda> {
    return this.prisma.agenda.create({
      data: {
        date: data.date,
      },
    });
  }

  update(id: string, data: AgendaUpdateData): Promise<Agenda> {
    return this.prisma.agenda.update({
      where: { id },
      data: {
        date: data.date,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.agenda.delete({ where: { id } });
  }
}
