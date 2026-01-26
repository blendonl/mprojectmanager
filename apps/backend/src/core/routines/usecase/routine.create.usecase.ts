import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RoutineCreateData } from '../data/routine.create.data';
import { RoutineWithTasks } from '../domain/routine-with-tasks';
import {
  ROUTINE_REPOSITORY,
  type RoutineRepository,
} from '../repository/routine.repository';
import {
  ROUTINE_TASK_REPOSITORY,
  type RoutineTaskRepository,
} from '../repository/routine-task.repository';
import { RoutineTaskBuilder } from '../service/routine-task-builder';
import { RoutineAgendaPlanner } from '../service/routine-agenda-planner.service';

@Injectable()
export class RoutineCreateUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    @Inject(ROUTINE_TASK_REPOSITORY)
    private readonly routineTaskRepository: RoutineTaskRepository,
    private readonly routineAgendaPlanner: RoutineAgendaPlanner,
  ) {}

  async execute(data: RoutineCreateData): Promise<RoutineWithTasks> {
    if (data.separateInto !== undefined && data.separateInto < 1) {
      throw new BadRequestException('separateInto must be at least 1');
    }

    const routine = await this.routineRepository.create(data);
    const tasks = RoutineTaskBuilder.build(routine);
    const createdTasks = await this.routineTaskRepository.createMany(tasks);
    await this.routineAgendaPlanner.planForDate();

    return { routine, tasks: createdTasks };
  }
}
