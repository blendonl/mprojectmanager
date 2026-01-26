import { Inject, Injectable } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../repository/alarm-plan.repository';

@Injectable()
export class AlarmPlanGetOneUseCase {
  constructor(
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
  ) {}

  async execute(id: string): Promise<AlarmPlan | null> {
    return this.alarmPlanRepository.findById(id);
  }
}
