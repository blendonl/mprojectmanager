import { TaskLog } from '@prisma/client';
import { TaskLogDto, WorkDurationDto } from 'shared-types';

export class TaskLogMapper {
  static toResponse(taskLog: TaskLog): TaskLogDto {
    return {
      id: taskLog.id,
      taskId: taskLog.taskId,
      action: taskLog.action,
      value: taskLog.value,
      metadata: taskLog.metadata as Record<string, any> | null,
      createdAt: taskLog.createdAt.toISOString(),
      updatedAt: taskLog.updatedAt.toISOString(),
    };
  }

  static toWorkDurationResponse(workDuration: {
    durationMinutes: number;
    formattedDuration: string;
    startedAt?: Date;
    completedAt?: Date;
  }): WorkDurationDto {
    return {
      durationMinutes: workDuration.durationMinutes,
      formattedDuration: workDuration.formattedDuration,
      startedAt: workDuration.startedAt?.toISOString() || null,
      completedAt: workDuration.completedAt?.toISOString() || null,
    };
  }
}
