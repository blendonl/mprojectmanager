import { Inject, Injectable } from '@nestjs/common';
import { RoutineTaskLog } from '@prisma/client';
import { RoutineTaskLogCreateData } from '../data/routine-task-log.create.data';
import {
  ROUTINE_TASK_LOG_REPOSITORY,
  type RoutineTaskLogRepository,
} from '../repository/routine-task-log.repository';
import { RoutineAlarmPlanner } from '../service/routine-alarm-planner.service';

@Injectable()
export class RoutineTaskLogCreateUseCase {
  constructor(
    @Inject(ROUTINE_TASK_LOG_REPOSITORY)
    private readonly routineTaskLogRepository: RoutineTaskLogRepository,
    private readonly routineAlarmPlanner: RoutineAlarmPlanner,
  ) {}

  async execute(data: RoutineTaskLogCreateData): Promise<RoutineTaskLog> {
    const created = await this.routineTaskLogRepository.create(data);
    await this.routineAlarmPlanner.planForActiveRoutines();
    return created;
  }
}
