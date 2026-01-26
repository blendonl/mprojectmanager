import { RoutineType } from '@prisma/client';

export interface RoutineCreateData {
  name: string;
  type: RoutineType;
  target: string;
  separateInto?: number;
  repeatIntervalMinutes: number;
  activeDays?: string[];
}
