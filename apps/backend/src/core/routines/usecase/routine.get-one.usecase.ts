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
export class RoutineGetOneUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    @Inject(ROUTINE_TASK_REPOSITORY)
    private readonly routineTaskRepository: RoutineTaskRepository,
  ) {}

  async execute(id: string): Promise<RoutineWithTasks | null> {
    const routine = await this.routineRepository.findById(id);
    if (!routine) {
      return null;
    }

    const tasks = await this.routineTaskRepository.findByRoutineId(id);
    return { routine, tasks };
  }
}
