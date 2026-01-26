import { Injectable } from '@nestjs/common';
import { TimeLogCreateData } from '../data/time-log.create.data';
import { TimeLogCreateUseCase } from '../usecase/time-log.create.usecase';
import { TimeLogGetDailyUseCase } from '../usecase/time-log.get-daily.usecase';
import { TimeLogGetProjectSummaryUseCase } from '../usecase/time-log.get-project-summary.usecase';
import { TimeLogGetTaskTimeUseCase } from '../usecase/time-log.get-task-time.usecase';

@Injectable()
export class TimeLogsCoreService {
  constructor(
    private readonly timeLogCreateUseCase: TimeLogCreateUseCase,
    private readonly timeLogGetProjectSummaryUseCase: TimeLogGetProjectSummaryUseCase,
    private readonly timeLogGetDailyUseCase: TimeLogGetDailyUseCase,
    private readonly timeLogGetTaskTimeUseCase: TimeLogGetTaskTimeUseCase,
  ) {}

  async logTime(data: TimeLogCreateData) {
    return this.timeLogCreateUseCase.execute(data);
  }

  async getProjectSummary(
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.timeLogGetProjectSummaryUseCase.execute(
      projectId,
      startDate,
      endDate,
    );
  }

  async getDailySummary(date: Date) {
    return this.timeLogGetDailyUseCase.execute(date);
  }

  async getTaskWorkTime(taskId: string) {
    return this.timeLogGetTaskTimeUseCase.execute(taskId);
  }

  async getOverallSummary(startDate?: Date, endDate?: Date) {
    return this.timeLogGetProjectSummaryUseCase.execute(
      undefined,
      startDate,
      endDate,
    );
  }
}
