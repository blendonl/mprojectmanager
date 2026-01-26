import { TimeLog } from '@prisma/client';
import { TimeLogDto } from 'shared-types';

export class TimeLogMapper {
  static toResponse(timeLog: TimeLog): TimeLogDto {
    return {
      id: timeLog.id,
      taskId: timeLog.taskId,
      projectId: timeLog.projectId,
      startTime: timeLog.date.toISOString(),
      endTime: null,
      duration: timeLog.durationMinutes,
      description: null,
      createdAt: timeLog.createdAt.toISOString(),
      updatedAt: timeLog.updatedAt.toISOString(),
    };
  }
}
