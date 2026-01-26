import { Injectable } from '@nestjs/common';
import { RoutineTaskLog } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoutineTaskLogCreateData } from '../data/routine-task-log.create.data';
import { RoutineTaskLogRepository } from './routine-task-log.repository';

@Injectable()
export class RoutineTaskLogPrismaRepository implements RoutineTaskLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: RoutineTaskLogCreateData): Promise<RoutineTaskLog> {
    return this.prisma.routineTaskLog.create({
      data: {
        routineTaskId: data.routineTaskId,
        userId: data.userId,
        value: data.value ?? null,
      },
    });
  }
}
