import { Inject, Injectable } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../repository/alarm-plan.repository';

@Injectable()
export class AlarmPlanGetByRoutineTaskUseCase {
  constructor(
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
  ) {}

  async execute(routineTaskId: string): Promise<AlarmPlan[]> {
    return this.alarmPlanRepository.findByRoutineTaskId(routineTaskId);
  }
}
