import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AgendaCoreService } from '../../agenda/service/agenda.core.service';
import { AgendaItemCoreService } from '../../agenda-item/service/agenda-item.core.service';

interface TimeBlock {
  start: Date;
  end: Date;
}

@Injectable()
export class RoutineAgendaPlanner {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agendaService: AgendaCoreService,
    private readonly agendaItemService: AgendaItemCoreService,
  ) {}

  async planForDate(date: Date = new Date()): Promise<void> {
    const agenda = await this.ensureAgenda(date);
    const routines = await this.prisma.routine.findMany({
      where: { status: 'ACTIVE' },
      include: { tasks: true },
    });

    if (routines.length === 0) {
      return;
    }

    const existingItems = await this.prisma.agendaItem.findMany({
      where: { agendaId: agenda.id },
    });

    const occupied = this.collectOccupied(existingItems);
    const existingRoutineTaskIds = new Set(
      existingItems
        .map((item) => item.routineTaskId)
        .filter((id): id is string => !!id),
    );

    for (const routine of routines) {
      if (!routine.tasks.length) {
        continue;
      }

      if (routine.type === 'SLEEP') {
        await this.scheduleSleepTasks(agenda.id, routine.tasks, occupied, date, existingRoutineTaskIds);
        continue;
      }

      if (routine.type === 'STEP') {
        await this.scheduleStepTasks(agenda.id, routine.tasks, occupied, date, existingRoutineTaskIds);
        continue;
      }

      await this.scheduleOtherTasks(agenda.id, routine.tasks, existingRoutineTaskIds);
    }
  }

  private async ensureAgenda(date: Date) {
    const existing = await this.agendaService.getAgendaByDate(date);
    if (existing) {
      return existing;
    }

    return this.agendaService.createAgenda({ date });
  }

  private collectOccupied(items: { startAt: Date | null; duration: number | null }[]): TimeBlock[] {
    return items
      .filter((item) => item.startAt)
      .map((item) => {
        const start = item.startAt as Date;
        const duration = item.duration ?? 0;
        const end = new Date(start.getTime() + duration * 60000);
        return { start, end };
      });
  }

  private async scheduleSleepTasks(
    agendaId: string,
    tasks: { id: string; target: string }[],
    occupied: TimeBlock[],
    date: Date,
    existingRoutineTaskIds: Set<string>,
  ): Promise<void> {
    for (const task of tasks) {
      if (existingRoutineTaskIds.has(task.id)) {
        continue;
      }

      const targetAt = this.timeOnDate(date, task.target);
      const available = targetAt ? this.isAvailable(targetAt, occupied) : false;

      await this.agendaItemService.createAgendaItem(agendaId, {
        taskId: null,
        routineTaskId: task.id,
        startAt: available ? targetAt : null,
        duration: null,
      });

      if (targetAt && available) {
        occupied.push({ start: targetAt, end: new Date(targetAt.getTime()) });
      }
    }
  }

  private async scheduleStepTasks(
    agendaId: string,
    tasks: { id: string }[],
    occupied: TimeBlock[],
    date: Date,
    existingRoutineTaskIds: Set<string>,
  ): Promise<void> {
    const windowStart = this.timeOnDate(date, '08:00');
    const windowEnd = this.timeOnDate(date, '20:00');
    if (!windowStart || !windowEnd) {
      return;
    }

    const interval = (windowEnd.getTime() - windowStart.getTime()) / tasks.length;

    for (let index = 0; index < tasks.length; index += 1) {
      const task = tasks[index];
      if (existingRoutineTaskIds.has(task.id)) {
        continue;
      }

      const targetAt = new Date(windowStart.getTime() + interval * index);
      const available = this.isAvailable(targetAt, occupied);

      await this.agendaItemService.createAgendaItem(agendaId, {
        taskId: null,
        routineTaskId: task.id,
        startAt: available ? targetAt : null,
        duration: null,
      });

      if (available) {
        occupied.push({ start: targetAt, end: new Date(targetAt.getTime()) });
      }
    }
  }

  private async scheduleOtherTasks(
    agendaId: string,
    tasks: { id: string }[],
    existingRoutineTaskIds: Set<string>,
  ): Promise<void> {
    for (const task of tasks) {
      if (existingRoutineTaskIds.has(task.id)) {
        continue;
      }

      await this.agendaItemService.createAgendaItem(agendaId, {
        taskId: null,
        routineTaskId: task.id,
        startAt: null,
        duration: null,
      });
    }
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

  private isAvailable(targetAt: Date, occupied: TimeBlock[]): boolean {
    return !occupied.some((block) => targetAt >= block.start && targetAt <= block.end);
  }
}
