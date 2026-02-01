import { RoutineWithTasks } from 'src/core/routines/domain/routine-with-tasks';
import { RoutineDetailDto } from 'shared-types';

export class RoutineMapper {
  static toResponse(data: RoutineWithTasks): RoutineDetailDto {
    const { routine, tasks } = data;
    const target = routine.target as unknown as RoutineDetailDto['target'];

    return {
      id: routine.id,
      name: routine.name,
      description: null,
      type: routine.type as any,
      target,
      separateInto: routine.separateInto,
      repeatIntervalMinutes: routine.repeatIntervalMinutes,
      activeDays: routine.activeDays as string[] | null,
      status: routine.status as any,
      isActive: routine.status === 'ACTIVE',
      color: '#000000',
      createdAt: routine.createdAt.toISOString(),
      updatedAt: routine.updatedAt.toISOString(),
      tasks: tasks.map((task) => ({
        id: task.id,
        routineId: task.routineId,
        name: task.name,
        description: null,
        target: task.target,
        duration: null,
        position: 0,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
  }
}
