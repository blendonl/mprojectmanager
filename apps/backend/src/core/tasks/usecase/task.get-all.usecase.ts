import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../domain/task';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';

@Injectable()
export class TaskGetAllUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(columnId: string): Promise<Task[]> {
    const result = this.taskRepository.findAll(columnId);

    return result;
  }
}
