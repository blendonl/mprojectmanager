import { Injectable } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { Task } from '@prisma/client';
import { TaskCreateData } from '../data/task.create.data';
import { TaskUpdateData } from '../data/task.update.data';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskPrismaRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(columnId: string, data: TaskCreateData): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId ?? columnId,
        parentId: data.parentId ?? undefined,
        type: data.type,
        priority: data.priority,
        position: data.position,
      },
    });
  }
  findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
    });
  }
  update(id: string, data: TaskUpdateData): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        parentId: data.parentId ?? undefined,
        type: data.type,
        priority: data.priority,
        position: data.position,
      },
    });
  }
  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async findAll(columnId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
    });
  }
}
