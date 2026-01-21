import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../domain/task';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';

@Injectable()
export class TaskGetOneUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }

    return task;
  }
}
