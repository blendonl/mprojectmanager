import { Inject, Injectable } from '@nestjs/common';
import { RoutineWithTasks } from '../domain/routine-with-tasks';
import {
  ROUTINE_REPOSITORY,
  type RoutineRepository,
} from '../repository/routine.repository';
import {
  ROUTINE_TASK_REPOSITORY,
  type RoutineTaskRepository,
} from '../repository/routine-task.repository';

@Injectable()
export class RoutineGetAllUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    @Inject(ROUTINE_TASK_REPOSITORY)
    private readonly routineTaskRepository: RoutineTaskRepository,
  ) {}

  async execute(): Promise<RoutineWithTasks[]> {
    const routines = await this.routineRepository.findAll();
    const results: RoutineWithTasks[] = [];

    for (const routine of routines) {
      const tasks = await this.routineTaskRepository.findByRoutineId(
        routine.id,
      );
      results.push({ routine, tasks });
    }

    return results;
  }
}
