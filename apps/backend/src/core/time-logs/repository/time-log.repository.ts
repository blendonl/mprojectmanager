import { TimeLog } from '@prisma/client';
import { TimeLogCreateData } from '../data/time-log.create.data';

export const TIME_LOG_REPOSITORY = 'TIME_LOG_REPOSITORY';

export interface ProjectSummary {
  projectId: string;
  projectName?: string;
  totalMinutes: number;
}

export interface TimeLogRepository {
  create(data: TimeLogCreateData): Promise<TimeLog>;
  findByTaskId(taskId: string): Promise<TimeLog[]>;
  findByProjectId(
    projectId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeLog[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<TimeLog[]>;
  findByDate(date: Date): Promise<TimeLog[]>;
  getProjectSummary(
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProjectSummary[]>;
}
