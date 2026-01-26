import { AlarmPlanStatus } from '@prisma/client';

export interface AlarmPlanUpdateData {
  status?: AlarmPlanStatus;
}
