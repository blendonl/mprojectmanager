import { Inject, Injectable } from '@nestjs/common';
import { TaskLog } from '@prisma/client';
import { TaskLogCreateData } from '../data/task-log.create.data';
import {
  TASK_LOG_REPOSITORY,
  type TaskLogRepository,
} from '../repository/task-log.repository';

@Injectable()
export class TaskLogCreateUseCase {
  constructor(
    @Inject(TASK_LOG_REPOSITORY)
    private readonly taskLogRepository: TaskLogRepository,
  ) {}

  async execute(data: TaskLogCreateData): Promise<TaskLog> {
    return this.taskLogRepository.create(data);
  }
}
