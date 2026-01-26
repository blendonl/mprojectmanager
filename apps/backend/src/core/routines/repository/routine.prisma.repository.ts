import { Injectable } from '@nestjs/common';
import { Prisma, Routine } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoutineCreateData } from '../data/routine.create.data';
import { RoutineUpdateData } from '../data/routine.update.data';
import { RoutineRepository } from './routine.repository';

@Injectable()
export class RoutinePrismaRepository implements RoutineRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Routine[]> {
    return this.prisma.routine.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<Routine | null> {
    return this.prisma.routine.findUnique({
      where: { id },
    });
  }

  create(data: RoutineCreateData): Promise<Routine> {
    return this.prisma.routine.create({
      data: {
        name: data.name,
        type: data.type,
        target: data.target,
        separateInto: data.separateInto ?? 1,
        repeatIntervalMinutes: data.repeatIntervalMinutes,
        activeDays: data.activeDays ?? undefined,
      },
    });
  }

  update(id: string, data: RoutineUpdateData): Promise<Routine> {
    return this.prisma.routine.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        type: data.type,
        target: data.target,
        separateInto: data.separateInto,
        repeatIntervalMinutes: data.repeatIntervalMinutes,
        activeDays: data.activeDays === null ? Prisma.JsonNull : data.activeDays,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.routine.delete({ where: { id } });
  }
}
