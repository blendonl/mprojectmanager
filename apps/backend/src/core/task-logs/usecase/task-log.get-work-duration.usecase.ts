import { Inject, Injectable } from '@nestjs/common';
import { TaskAction } from '@prisma/client';
import {
  TASK_LOG_REPOSITORY,
  type TaskLogRepository,
} from '../repository/task-log.repository';

export interface WorkDuration {
  durationMinutes: number;
  formattedDuration: string;
  startedAt?: Date;
  completedAt?: Date;
}

@Injectable()
export class TaskLogGetWorkDurationUseCase {
  constructor(
    @Inject(TASK_LOG_REPOSITORY)
    private readonly taskLogRepository: TaskLogRepository,
  ) {}

  async execute(taskId: string): Promise<WorkDuration | null> {
    const logs = await this.taskLogRepository.findByTaskId(taskId);

    const startLog = logs.find(
      (log) =>
        log.action === TaskAction.MOVE_TO_IN_PROGRESS ||
        log.action === TaskAction.CREATED,
    );

    const endLog = logs.find(
      (log) =>
        log.action === TaskAction.MOVE_TO_DONE ||
        log.action === TaskAction.COMPLETED,
    );

    if (!startLog || !endLog) {
      return null;
    }

    const durationMs = endLog.createdAt.getTime() - startLog.createdAt.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return {
      durationMinutes,
      formattedDuration,
      startedAt: startLog.createdAt,
      completedAt: endLog.createdAt,
    };
  }
}
