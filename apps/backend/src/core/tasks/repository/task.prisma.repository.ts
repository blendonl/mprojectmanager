import { Injectable } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { Task } from '@prisma/client';
import { TaskCreateData } from '../data/task.create.data';
import { TaskUpdateData } from '../data/task.update.data';
import { TaskListQueryData } from '../data/task.list.query.data';
import { TaskListResultData } from '../data/task.list.result.data';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskFindOneData } from '../data/task.find.one.data';

@Injectable()
export class TaskPrismaRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: TaskCreateData): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        slug: data.slug!,
        taskNumber: data.taskNumber!,
        description: data.description,
        columnId: data.columnId,
        parentId: data.parentId ?? undefined,
        type: data.type,
        priority: data.priority,
        position: data.position,
      },
    });
  }
  async findById(id: string): Promise<TaskFindOneData | null> {
    return await this.prisma.task.findUnique({
      where: { id },
      include: {
        column: true,
      },
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

  async findAll(query: TaskListQueryData): Promise<TaskListResultData> {
    const where: any = {};

    if (query.columnId) {
      where.columnId = query.columnId;
    }

    if (query.boardId) {
      where.column = {
        boardId: query.boardId,
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { column: { name: { contains: query.search, mode: 'insensitive' } } },
        {
          column: {
            board: { name: { contains: query.search, mode: 'insensitive' } },
          },
        },
        {
          column: {
            board: {
              project: {
                name: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: { position: 'asc' },
        skip,
        take: query.limit,
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
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async moveToColumn(taskId: string, columnId: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { columnId },
    });
  }

  async countByColumnId(columnId: string): Promise<number> {
    return this.prisma.task.count({
      where: { columnId },
    });
  }
}
