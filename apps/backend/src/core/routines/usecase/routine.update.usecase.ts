import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Routine } from '@prisma/client';
import { RoutineUpdateData } from '../data/routine.update.data';
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
export class RoutineUpdateUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    @Inject(ROUTINE_TASK_REPOSITORY)
    private readonly routineTaskRepository: RoutineTaskRepository,
    private readonly routineAgendaPlanner: RoutineAgendaPlanner,
  ) {}

  async execute(id: string, data: RoutineUpdateData): Promise<Routine> {
    if (data.separateInto !== undefined && data.separateInto < 1) {
      throw new BadRequestException('separateInto must be at least 1');
    }

    const updated = await this.routineRepository.update(id, data);

    if (this.shouldRegenerateTasks(data)) {
      await this.routineTaskRepository.deleteByRoutineId(updated.id);
      const tasks = RoutineTaskBuilder.build(updated);
      await this.routineTaskRepository.createMany(tasks);
      await this.routineAgendaPlanner.planForDate();
    }

    return updated;
  }

  private shouldRegenerateTasks(data: RoutineUpdateData): boolean {
    return (
      data.type !== undefined ||
      data.target !== undefined ||
      data.separateInto !== undefined ||
      data.name !== undefined
    );
  }
}
