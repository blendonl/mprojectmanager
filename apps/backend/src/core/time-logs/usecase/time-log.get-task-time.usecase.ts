import { Inject, Injectable } from '@nestjs/common';
import { TimeLog } from '@prisma/client';
import {
  TIME_LOG_REPOSITORY,
  type TimeLogRepository,
} from '../repository/time-log.repository';

@Injectable()
export class TimeLogGetTaskTimeUseCase {
  constructor(
    @Inject(TIME_LOG_REPOSITORY)
    private readonly timeLogRepository: TimeLogRepository,
  ) {}

  async execute(taskId: string): Promise<TimeLog[]> {
    return this.timeLogRepository.findByTaskId(taskId);
  }
}
