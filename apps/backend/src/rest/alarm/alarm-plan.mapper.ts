import { AlarmPlan } from '@prisma/client';
import { AlarmPlanResponse } from './dto/alarm-plan.response';

export class AlarmPlanMapper {
  static toResponse(plan: AlarmPlan): AlarmPlanResponse {
    return {
      id: plan.id,
      routineTaskId: plan.routineTaskId,
      status: plan.status,
      type: plan.type,
      targetAt: plan.targetAt.toISOString(),
      repeatIntervalMinutes: plan.repeatIntervalMinutes,
      metadata: (plan.metadata as Record<string, any>) ?? null,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}
