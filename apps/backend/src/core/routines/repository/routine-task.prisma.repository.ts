import { Injectable } from '@nestjs/common';
import { RoutineTask } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoutineTaskCreateData } from '../data/routine-task.create.data';
import { RoutineTaskRepository } from './routine-task.repository';

@Injectable()
export class RoutineTaskPrismaRepository implements RoutineTaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByRoutineId(routineId: string): Promise<RoutineTask[]> {
    return this.prisma.routineTask.findMany({
      where: { routineId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMany(tasks: RoutineTaskCreateData[]): Promise<RoutineTask[]> {
    if (tasks.length === 0) {
      return [];
    }

    const routineId = tasks[0].routineId;
    await this.prisma.routineTask.createMany({
      data: tasks.map((task) => ({
        routineId: task.routineId,
        name: task.name,
        target: task.target,
      })),
    });

    return this.findByRoutineId(routineId);
  }

  async deleteByRoutineId(routineId: string): Promise<void> {
    await this.prisma.routineTask.deleteMany({
      where: { routineId },
    });
  }
}
