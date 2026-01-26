import { AlarmPlanStatus, AlarmPlanType } from '@prisma/client';

export interface AlarmPlanResponse {
  id: string;
  routineTaskId: string;
  status: AlarmPlanStatus;
  type: AlarmPlanType;
  targetAt: string;
  repeatIntervalMinutes: number;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}
