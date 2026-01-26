import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task, TaskAction } from '@prisma/client';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from 'src/core/columns/repository/column.repository';
import { TaskLogsCoreService } from 'src/core/task-logs/service/task-logs.core.service';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';

@Injectable()
export class TaskMoveUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: ColumnRepository,
    private readonly taskLogService: TaskLogsCoreService,
  ) {}

  async execute(taskId: string, targetColumnId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    const targetColumn = await this.columnRepository.findById(targetColumnId);
    if (!targetColumn) {
      throw new NotFoundException(
        `Column with id ${targetColumnId} not found`,
      );
    }

    if (task.columnId !== targetColumnId) {
      if (targetColumn.limit !== null && targetColumn.limit !== undefined) {
        const taskCount =
          await this.taskRepository.countByColumnId(targetColumnId);
        if (taskCount >= targetColumn.limit) {
          throw new BadRequestException(
            `Column '${targetColumn.name}' is at capacity (${targetColumn.limit} tasks)`,
          );
        }
      }
    }

    const fromColumnId = task.columnId;

    const updatedTask = await this.taskRepository.moveToColumn(
      taskId,
      targetColumnId,
    );

    await this.taskLogService.createLog({
      taskId,
      action: TaskAction.MOVED_TO_COLUMN,
      metadata: { fromColumnId, toColumnId: targetColumnId },
    });

    const columnNameLower = targetColumn.name.toLowerCase();
    if (
      columnNameLower.includes('progress') ||
      columnNameLower.includes('in progress')
    ) {
      await this.taskLogService.createLog({
        taskId,
        action: TaskAction.MOVE_TO_IN_PROGRESS,
      });
    } else if (
      columnNameLower.includes('done') ||
      columnNameLower.includes('complete')
    ) {
      await this.taskLogService.createLog({
        taskId,
        action: TaskAction.MOVE_TO_DONE,
      });
    }

    return updatedTask;
  }
}
