import { Inject, Injectable } from '@nestjs/common';
import {
  ProjectSummary,
  TIME_LOG_REPOSITORY,
  type TimeLogRepository,
} from '../repository/time-log.repository';

@Injectable()
export class TimeLogGetProjectSummaryUseCase {
  constructor(
    @Inject(TIME_LOG_REPOSITORY)
    private readonly timeLogRepository: TimeLogRepository,
  ) {}

  async execute(
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProjectSummary[]> {
    return this.timeLogRepository.getProjectSummary(
      projectId,
      startDate,
      endDate,
    );
  }
}
