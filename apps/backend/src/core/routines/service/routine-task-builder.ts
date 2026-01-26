import { BadRequestException } from '@nestjs/common';
import { Routine, RoutineType } from '@prisma/client';
import { RoutineTaskCreateData } from '../data/routine-task.create.data';

export class RoutineTaskBuilder {
  static build(routine: Routine): RoutineTaskCreateData[] {
    switch (routine.type) {
      case RoutineType.STEP:
        return this.buildStepTasks(routine);
      case RoutineType.SLEEP:
        return this.buildSleepTasks(routine);
      case RoutineType.OTHER:
      default:
        return this.buildSingleTask(routine);
    }
  }

  private static buildStepTasks(routine: Routine): RoutineTaskCreateData[] {
    const total = Number(routine.target);
    if (!Number.isFinite(total) || total <= 0) {
      throw new BadRequestException('Invalid step target');
    }

    const parts = routine.separateInto || 1;
    const base = Math.floor(total / parts);
    const remainder = total - base * parts;

    return Array.from({ length: parts }, (_, index) => {
      const chunk = base + (index < remainder ? 1 : 0);
      return {
        routineId: routine.id,
        name: `Steps segment ${index + 1}`,
        target: chunk.toString(),
      };
    });
  }

  private static buildSleepTasks(routine: Routine): RoutineTaskCreateData[] {
    const parts = routine.target.split('-').map((value) => value.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new BadRequestException('Sleep target must be in HH:MM-HH:MM format');
    }

    const [wakeTime, sleepTime] = parts;
    return [
      {
        routineId: routine.id,
        name: 'Wake up time',
        target: wakeTime,
      },
      {
        routineId: routine.id,
        name: 'Sleep time',
        target: sleepTime,
      },
    ];
  }

  private static buildSingleTask(routine: Routine): RoutineTaskCreateData[] {
    return [
      {
        routineId: routine.id,
        name: routine.name,
        target: routine.target,
      },
    ];
  }
}
