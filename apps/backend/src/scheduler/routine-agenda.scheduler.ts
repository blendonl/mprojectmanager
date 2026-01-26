import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RoutineAgendaPlanner } from '../core/routines/service/routine-agenda-planner.service';

@Injectable()
export class RoutineAgendaScheduler {
  private readonly logger = new Logger(RoutineAgendaScheduler.name);

  constructor(private readonly routineAgendaPlanner: RoutineAgendaPlanner) {}

  @Cron('5 0 * * *')
  async handleAgendaPlanning(): Promise<void> {
    this.logger.debug('Running routine agenda planning');
    await this.routineAgendaPlanner.planForDate();
  }
}
