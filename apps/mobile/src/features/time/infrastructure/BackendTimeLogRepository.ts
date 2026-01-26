import { injectable, inject } from "tsyringe";
import {
  TimeLog,
  TimeEntry,
  WeeklySummary,
  MonthlySummary,
} from "@features/time/domain/entities/TimeLog";
import { TimeLogRepository } from "@features/time/domain/repositories/TimeLogRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { ProjectId } from "@core/types";
import { TimeLogDto, TimeLogSummaryDto } from "shared-types";

@injectable()
export class BackendTimeLogRepository implements TimeLogRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadTimeLogsForProject(projectId: ProjectId): Promise<TimeLog[]> {
    console.warn(
      "BackendTimeLogRepository: loadTimeLogsForProject not fully implemented",
    );
    return [];
  }

  async loadTimeLogForDate(
    projectId: ProjectId,
    date: string,
  ): Promise<TimeLog | null> {
    const logs = await this.apiClient.request<TimeLogDto[]>(
      `/time-logs/daily/${date}`,
    );

    const projectLogs = logs.filter((log) => log.projectId === projectId);

    if (projectLogs.length === 0) {
      return null;
    }

    const entries: TimeEntry[] = projectLogs.map((log) => ({
      id: log.id,
      source: 'manual' as any,
      start_time: log.startTime,
      duration_minutes: log.duration || 0,
      task_id: log.taskId || undefined,
      metadata: undefined,
    }));

    return new TimeLog({
      project_id: projectId,
      date: date,
      entries: entries,
    });
  }

  async loadTimeLogsForDateRange(
    projectId: ProjectId,
    startDate: string,
    endDate: string,
  ): Promise<TimeLog[]> {
    console.warn(
      "BackendTimeLogRepository: loadTimeLogsForDateRange not fully implemented",
    );
    return [];
  }

  async loadTimeLogsForMonth(
    projectId: ProjectId,
    yearMonth: string,
  ): Promise<TimeLog[]> {
    console.warn(
      "BackendTimeLogRepository: loadTimeLogsForMonth not fully implemented",
    );
    return [];
  }

  async loadAllTimeLogs(): Promise<TimeLog[]> {
    console.warn(
      "BackendTimeLogRepository: loadAllTimeLogs not fully implemented",
    );
    return [];
  }

  async getWeeklySummary(
    projectId: ProjectId,
    weekStartDate: string,
  ): Promise<WeeklySummary> {
    console.warn(
      "BackendTimeLogRepository: getWeeklySummary not fully implemented",
    );
    return {
      week_start: weekStartDate,
      week_end: weekStartDate,
      total_minutes: 0,
      daily_totals: {},
      by_source: { manual: 0, git: 0, tmux: 0, calendar: 0 },
      by_project: {},
    };
  }

  async getMonthlySummary(
    projectId: ProjectId,
    yearMonth: string,
  ): Promise<MonthlySummary> {
    console.warn(
      "BackendTimeLogRepository: getMonthlySummary not fully implemented",
    );
    return {
      month: yearMonth,
      total_minutes: 0,
      weekly_totals: [],
      by_source: { manual: 0, git: 0, tmux: 0, calendar: 0 },
      by_project: {},
      average_daily_minutes: 0,
    };
  }

  async logTime(data: {
    projectId?: string;
    taskId?: string;
    date: Date;
    durationMinutes: number;
    source: string;
    metadata?: Record<string, any>;
  }): Promise<TimeLogDto> {
    const payload = {
      project_id: data.projectId,
      task_id: data.taskId,
      date: data.date.toISOString(),
      duration_minutes: data.durationMinutes,
      source: data.source,
      metadata: data.metadata,
    };

    return this.apiClient.request<TimeLogDto>("/time-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async getProjectSummary(
    projectId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeLogSummaryDto[]> {
    let url = `/time-logs/summary/${projectId}`;
    const params: string[] = [];
    if (startDate) params.push(`start_date=${startDate.toISOString()}`);
    if (endDate) params.push(`end_date=${endDate.toISOString()}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    return this.apiClient.request<TimeLogSummaryDto[]>(url);
  }
}
