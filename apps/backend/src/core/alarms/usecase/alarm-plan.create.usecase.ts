import { Inject, Injectable } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import { AlarmPlanCreateData } from '../data/alarm-plan.create.data';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../repository/alarm-plan.repository';

@Injectable()
export class AlarmPlanCreateUseCase {
  constructor(
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
  ) {}

  async execute(data: AlarmPlanCreateData): Promise<AlarmPlan> {
    return this.alarmPlanRepository.create(data);
  }
}
