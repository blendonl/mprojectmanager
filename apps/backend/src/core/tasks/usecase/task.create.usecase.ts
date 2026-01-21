import { Inject, Injectable } from '@nestjs/common';
import { TaskCreateData } from '../data/task.create.data';
import { Task } from '@prisma/client';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';

@Injectable()
export class TaskCreateUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(columnId: string, data: TaskCreateData): Promise<Task | null> {
    const task = await this.taskRepository.create(columnId, data);

    return task;
  }
}
