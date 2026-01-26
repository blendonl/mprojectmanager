import { RoutineTask } from '@prisma/client';
import { RoutineTaskCreateData } from '../data/routine-task.create.data';

export const ROUTINE_TASK_REPOSITORY = 'ROUTINE_TASK_REPOSITORY';

export interface RoutineTaskRepository {
  findByRoutineId(routineId: string): Promise<RoutineTask[]>;
  createMany(tasks: RoutineTaskCreateData[]): Promise<RoutineTask[]>;
  deleteByRoutineId(routineId: string): Promise<void>;
}
