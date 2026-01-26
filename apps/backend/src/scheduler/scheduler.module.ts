import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { AgendaExpiryScheduler } from './agenda-expiry.scheduler';
import { AgendaItemCoreModule } from '../core/agenda-item/agenda-item.core.module';
import { RoutinesCoreModule } from '../core/routines/routines.core.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { RoutineAlarmScheduler } from './routine-alarm.scheduler';
import { RoutineAgendaScheduler } from './routine-agenda.scheduler';

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    AgendaItemCoreModule,
    RoutinesCoreModule,
    WebSocketModule,
  ],
  providers: [AgendaExpiryScheduler, RoutineAlarmScheduler, RoutineAgendaScheduler],
})
export class SchedulerModule {}
