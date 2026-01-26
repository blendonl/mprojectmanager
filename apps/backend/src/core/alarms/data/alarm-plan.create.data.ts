import { AlarmPlanType } from '@prisma/client';

export interface AlarmPlanCreateData {
  routineTaskId: string;
  type: AlarmPlanType;
  targetAt: Date;
  repeatIntervalMinutes: number;
  metadata?: Record<string, any> | null;
}
