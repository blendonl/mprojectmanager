import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RoutineAlarmPlanner } from '../core/routines/service/routine-alarm-planner.service';

@Injectable()
export class RoutineAlarmScheduler {
  private readonly logger = new Logger(RoutineAlarmScheduler.name);

  constructor(private readonly routineAlarmPlanner: RoutineAlarmPlanner) {}

  @Cron('*/15 * * * *')
  async handleAlarmPlanning(): Promise<void> {
    this.logger.debug('Running routine alarm planning');
    await this.routineAlarmPlanner.planForActiveRoutines();
  }
}
