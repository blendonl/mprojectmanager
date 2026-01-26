import { RoutineTaskLog } from '@prisma/client';
import { RoutineTaskLogCreateData } from '../data/routine-task-log.create.data';

export const ROUTINE_TASK_LOG_REPOSITORY = 'ROUTINE_TASK_LOG_REPOSITORY';

export interface RoutineTaskLogRepository {
  create(data: RoutineTaskLogCreateData): Promise<RoutineTaskLog>;
}
