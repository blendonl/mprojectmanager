import { Injectable } from '@nestjs/common';
import { TaskLog } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskLogCreateData } from '../data/task-log.create.data';
import { TaskLogRepository } from './task-log.repository';

@Injectable()
export class TaskLogPrismaRepository implements TaskLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: TaskLogCreateData): Promise<TaskLog> {
    return this.prisma.taskLog.create({
      data: {
        taskId: data.taskId,
        action: data.action,
        value: data.value,
        metadata: data.metadata,
      },
    });
  }

  findByTaskId(taskId: string): Promise<TaskLog[]> {
    return this.prisma.taskLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string): Promise<TaskLog | null> {
    return this.prisma.taskLog.findUnique({
      where: { id },
    });
  }
}
