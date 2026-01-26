import { Inject, Injectable } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import { AlarmPlanUpdateData } from '../data/alarm-plan.update.data';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../repository/alarm-plan.repository';

@Injectable()
export class AlarmPlanUpdateUseCase {
  constructor(
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
  ) {}

  async execute(id: string, data: AlarmPlanUpdateData): Promise<AlarmPlan> {
    return this.alarmPlanRepository.update(id, data);
  }
}
