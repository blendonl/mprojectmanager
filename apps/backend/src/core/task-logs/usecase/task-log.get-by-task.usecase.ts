import { Inject, Injectable } from '@nestjs/common';
import { TaskLog } from '@prisma/client';
import {
  TASK_LOG_REPOSITORY,
  type TaskLogRepository,
} from '../repository/task-log.repository';

@Injectable()
export class TaskLogGetByTaskUseCase {
  constructor(
    @Inject(TASK_LOG_REPOSITORY)
    private readonly taskLogRepository: TaskLogRepository,
  ) {}

  async execute(taskId: string): Promise<TaskLog[]> {
    return this.taskLogRepository.findByTaskId(taskId);
  }
}
