import { Injectable } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import { AlarmPlanCreateData } from '../data/alarm-plan.create.data';
import { AlarmPlanUpdateData } from '../data/alarm-plan.update.data';
import { AlarmPlanCreateUseCase } from '../usecase/alarm-plan.create.usecase';
import { AlarmPlanGetByRoutineTaskUseCase } from '../usecase/alarm-plan.get-by-routine-task.usecase';
import { AlarmPlanGetOneUseCase } from '../usecase/alarm-plan.get-one.usecase';
import { AlarmPlanUpdateUseCase } from '../usecase/alarm-plan.update.usecase';

@Injectable()
export class AlarmCoreService {
  constructor(
    private readonly alarmPlanCreateUseCase: AlarmPlanCreateUseCase,
    private readonly alarmPlanGetByRoutineTaskUseCase: AlarmPlanGetByRoutineTaskUseCase,
    private readonly alarmPlanGetOneUseCase: AlarmPlanGetOneUseCase,
    private readonly alarmPlanUpdateUseCase: AlarmPlanUpdateUseCase,
  ) {}

  async createPlan(data: AlarmPlanCreateData): Promise<AlarmPlan> {
    return this.alarmPlanCreateUseCase.execute(data);
  }

  async getPlan(id: string): Promise<AlarmPlan | null> {
    return this.alarmPlanGetOneUseCase.execute(id);
  }

  async getPlansByRoutineTask(routineTaskId: string): Promise<AlarmPlan[]> {
    return this.alarmPlanGetByRoutineTaskUseCase.execute(routineTaskId);
  }

  async updatePlan(id: string, data: AlarmPlanUpdateData): Promise<AlarmPlan> {
    return this.alarmPlanUpdateUseCase.execute(id, data);
  }
}
