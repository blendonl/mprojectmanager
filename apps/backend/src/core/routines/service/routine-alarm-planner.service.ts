import { Inject, Injectable } from '@nestjs/common';
import {
  AlarmPlanStatus,
  AlarmPlanType,
  Routine,
  RoutineStatus,
  RoutineTask,
  RoutineType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../../alarms/repository/alarm-plan.repository';

@Injectable()
export class RoutineAlarmPlanner {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
  ) {}

  async planForActiveRoutines(now: Date = new Date()): Promise<void> {
    const routines = await this.prisma.routine.findMany({
      where: { status: RoutineStatus.ACTIVE },
      include: { tasks: true },
    });

    for (const routine of routines) {
      if (routine.type === RoutineType.SLEEP) {
        await this.planSleepRoutine(routine, now);
        continue;
      }

      if (routine.type === RoutineType.STEP) {
        await this.planStepRoutine(routine, now);
      }
    }
  }

  private async planSleepRoutine(
    routine: Routine & { tasks: RoutineTask[] },
    now: Date,
  ): Promise<void> {
    const dayStart = this.startOfDay(now);
    const dayEnd = this.endOfDay(now);

    for (const task of routine.tasks) {
      const targetAt = this.timeOnDate(now, task.target);
      if (!targetAt) {
        continue;
      }

      const existing = await this.prisma.alarmPlan.findFirst({
        where: {
          routineTaskId: task.id,
          type: task.name.toLowerCase().includes('sleep')
            ? AlarmPlanType.SLEEP
            : AlarmPlanType.WAKE,
          targetAt: { gte: dayStart, lte: dayEnd },
        },
      });

      if (existing) {
        continue;
      }

      await this.alarmPlanRepository.create({
        routineTaskId: task.id,
        type: task.name.toLowerCase().includes('sleep')
          ? AlarmPlanType.SLEEP
          : AlarmPlanType.WAKE,
        targetAt,
        repeatIntervalMinutes: routine.repeatIntervalMinutes,
        metadata: {
          routineId: routine.id,
          routineType: routine.type,
        },
      });
    }
  }

  private async planStepRoutine(
    routine: Routine & { tasks: RoutineTask[] },
    now: Date,
  ): Promise<void> {
    const tasks = routine.tasks;
    if (!tasks.length) {
      return;
    }

    const totalTarget = tasks.reduce(
      (sum, task) => sum + Number(task.target || 0),
      0,
    );
    if (!Number.isFinite(totalTarget) || totalTarget <= 0) {
      return;
    }

    const dayStart = this.startOfDay(now);
    const minutesElapsed = Math.max(0, (now.getTime() - dayStart.getTime()) / 60000);
    const expected = Math.floor((totalTarget * minutesElapsed) / 1440);

    const logs = await this.prisma.routineTaskLog.findMany({
      where: {
        routineTaskId: { in: tasks.map((task) => task.id) },
        createdAt: { gte: dayStart, lte: now },
      },
    });

    const actual = logs.reduce((sum, log) => {
      const value = Number(log.value ?? 0);
      if (!Number.isFinite(value)) {
        return sum;
      }
      return sum + value;
    }, 0);
    if (actual >= expected) {
      return;
    }

    const latestPlan = await this.prisma.alarmPlan.findFirst({
      where: {
        routineTaskId: tasks[0].id,
        type: AlarmPlanType.STEP,
        status: { in: [AlarmPlanStatus.PENDING, AlarmPlanStatus.ACTIVE] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestPlan) {
      const lastCreatedAt = latestPlan.createdAt.getTime();
      if (now.getTime() - lastCreatedAt < 30 * 60 * 1000) {
        return;
      }

      const lastActual = Number((latestPlan.metadata as any)?.actual ?? 0);
      if (actual > lastActual) {
        return;
      }
    }

    await this.alarmPlanRepository.create({
      routineTaskId: tasks[0].id,
      type: AlarmPlanType.STEP,
      targetAt: now,
      repeatIntervalMinutes: routine.repeatIntervalMinutes,
      metadata: {
        routineId: routine.id,
        expected,
        actual,
      },
    });
  }

  private startOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private endOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private timeOnDate(date: Date, time: string): Date | null {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    const target = new Date(date);
    target.setHours(hours, minutes, 0, 0);
    return target;
  }
}
