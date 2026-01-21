import { Inject, Injectable } from '@nestjs/common';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';

@Injectable()
export class TaskDeleteUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly columnRepository: TaskRepository,
  ) {}

  async execute(taskId: string): Promise<boolean> {
    const task = await this.columnRepository.findById(taskId);

    if (!task) {
      throw new Error('Task not found.');
    }

    await this.columnRepository.delete(taskId);

    return true;
  }
}
