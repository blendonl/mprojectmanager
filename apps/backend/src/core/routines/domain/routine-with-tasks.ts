import { Routine, RoutineTask } from '@prisma/client';

export interface RoutineWithTasks {
  routine: Routine;
  tasks: RoutineTask[];
}
