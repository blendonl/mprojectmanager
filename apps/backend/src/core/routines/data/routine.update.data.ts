import { RoutineStatus, RoutineType } from '@prisma/client';

export interface RoutineUpdateData {
  name?: string;
  status?: RoutineStatus;
  type?: RoutineType;
  target?: string;
  separateInto?: number;
  repeatIntervalMinutes?: number;
  activeDays?: string[] | null;
}
