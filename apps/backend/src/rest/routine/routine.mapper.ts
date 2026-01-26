import { RoutineWithTasks } from 'src/core/routines/domain/routine-with-tasks';
import { RoutineDetailDto } from 'shared-types';

export class RoutineMapper {
  static toResponse(data: RoutineWithTasks): RoutineDetailDto {
    const { routine, tasks } = data;
    return {
      id: routine.id,
      name: routine.name,
      description: null,
      routineType: routine.type as any,
      target: routine.target ? parseInt(routine.target as string) : null,
      color: '#000000',
      isActive: routine.status === 'ACTIVE',
      createdAt: routine.createdAt.toISOString(),
      updatedAt: routine.updatedAt.toISOString(),
      tasks: tasks.map((task) => ({
        id: task.id,
        routineId: task.routineId,
        name: task.name,
        description: null,
        duration: null,
        position: 0,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
  }
}
