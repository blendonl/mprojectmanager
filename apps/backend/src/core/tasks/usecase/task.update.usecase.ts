import { Inject, Injectable } from '@nestjs/common';
import { TaskUpdateData } from '../data/task.update.data';
import { Task } from '@prisma/client';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';

@Injectable()
export class TaskUpdateUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(taskId: string, data: TaskUpdateData): Promise<Task | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return null;
    }

    await this.taskRepository.update(task.id, data);

    return task;
  }
}
