import { Injectable } from '@nestjs/common';
import { TaskLogCreateData } from '../data/task-log.create.data';
import { TaskLogCreateUseCase } from '../usecase/task-log.create.usecase';
import { TaskLogGetByTaskUseCase } from '../usecase/task-log.get-by-task.usecase';
import { TaskLogGetWorkDurationUseCase } from '../usecase/task-log.get-work-duration.usecase';

@Injectable()
export class TaskLogsCoreService {
  constructor(
    private readonly taskLogCreateUseCase: TaskLogCreateUseCase,
    private readonly taskLogGetByTaskUseCase: TaskLogGetByTaskUseCase,
    private readonly taskLogGetWorkDurationUseCase: TaskLogGetWorkDurationUseCase,
  ) {}

  async createLog(data: TaskLogCreateData) {
    return this.taskLogCreateUseCase.execute(data);
  }

  async getTaskHistory(taskId: string) {
    return this.taskLogGetByTaskUseCase.execute(taskId);
  }

  async getWorkDuration(taskId: string) {
    return this.taskLogGetWorkDurationUseCase.execute(taskId);
  }
}
