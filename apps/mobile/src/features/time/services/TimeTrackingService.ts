import { injectable, inject } from 'tsyringe';
import { TimeLog, WeeklySummary, MonthlySummary } from '../domain/entities/TimeLog';
import { TimeLogRepository } from '../domain/repositories/TimeLogRepository';
import { ProjectId } from '@core/types';
import { TIME_LOG_REPOSITORY } from '@core/di/tokens';

@injectable()
export class TimeTrackingService {
  constructor(@inject(TIME_LOG_REPOSITORY) private repository: TimeLogRepository) {}

  async getAllTimeLogs(): Promise<TimeLog[]> {
    return this.repository.loadAllTimeLogs();
  }

  async getTimeLogsForProject(projectId: ProjectId): Promise<TimeLog[]> {
    return this.repository.loadTimeLogsForProject(projectId);
  }

  async getTimeLogForDate(projectId: ProjectId, date: string): Promise<TimeLog | null> {
    return this.repository.loadTimeLogForDate(projectId, date);
  }

  async getTimeLogsForDateRange(
    projectId: ProjectId,
    startDate: string,
    endDate: string
  ): Promise<TimeLog[]> {
    return this.repository.loadTimeLogsForDateRange(projectId, startDate, endDate);
  }

  async getWeeklySummary(projectId: ProjectId, weekStartDate: string): Promise<WeeklySummary> {
    return this.repository.getWeeklySummary(projectId, weekStartDate);
  }

  async getMonthlySummary(projectId: ProjectId, yearMonth: string): Promise<MonthlySummary> {
    return this.repository.getMonthlySummary(projectId, yearMonth);
  }

  async logTime(data: {
    projectId?: string;
    taskId?: string;
    date: Date;
    durationMinutes: number;
    source: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return (this.repository as any).logTime(data);
  }

  async getProjectSummary(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    return (this.repository as any).getProjectSummary(projectId, startDate, endDate);
  }

  async getDailySummary(date: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const allLogs = await this.repository.loadAllTimeLogs();
    const todayLogs = allLogs.filter(log => log.date === today);

    return {
      date,
      totalMinutes: todayLogs.reduce((sum, log) => sum + log.total_minutes, 0),
      logs: todayLogs,
    };
  }
}
