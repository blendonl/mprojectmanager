import { AlarmPlan } from '@prisma/client';
import { AlarmPlanCreateData } from '../data/alarm-plan.create.data';
import { AlarmPlanUpdateData } from '../data/alarm-plan.update.data';

export const ALARM_PLAN_REPOSITORY = 'ALARM_PLAN_REPOSITORY';

export interface AlarmPlanRepository {
  findById(id: string): Promise<AlarmPlan | null>;
  findByRoutineTaskId(routineTaskId: string): Promise<AlarmPlan[]>;
  findLatestByRoutineTaskId(
    routineTaskId: string,
  ): Promise<AlarmPlan | null>;
  findActiveByRoutineTaskId(
    routineTaskId: string,
  ): Promise<AlarmPlan | null>;
  create(data: AlarmPlanCreateData): Promise<AlarmPlan>;
  update(id: string, data: AlarmPlanUpdateData): Promise<AlarmPlan>;
}
