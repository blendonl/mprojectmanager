import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskCreateData } from '../data/task.create.data';
import { Task } from '@prisma/client';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from 'src/core/columns/repository/column.repository';

@Injectable()
export class TaskCreateUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(columnId: string, data: TaskCreateData): Promise<Task | null> {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundException(`Column with id ${columnId} not found`);
    }

    if (column.limit !== null && column.limit !== undefined) {
      const taskCount = await this.taskRepository.countByColumnId(columnId);
      if (taskCount >= column.limit) {
        throw new BadRequestException(
          `Column '${column.name}' is at capacity (${column.limit} tasks)`,
        );
      }
    }

    const task = await this.taskRepository.create(columnId, data);

    return task;
  }
}
