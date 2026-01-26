import { Inject, Injectable } from '@nestjs/common';
import { TimeLog } from '@prisma/client';
import { TimeLogCreateData } from '../data/time-log.create.data';
import {
  TIME_LOG_REPOSITORY,
  type TimeLogRepository,
} from '../repository/time-log.repository';

@Injectable()
export class TimeLogCreateUseCase {
  constructor(
    @Inject(TIME_LOG_REPOSITORY)
    private readonly timeLogRepository: TimeLogRepository,
  ) {}

  async execute(data: TimeLogCreateData): Promise<TimeLog> {
    return this.timeLogRepository.create(data);
  }
}
