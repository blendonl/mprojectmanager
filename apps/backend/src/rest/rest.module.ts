import { Module } from '@nestjs/common';
import { ProjectsRestModule } from './projects/projects.rest.module';
import { BoardsRestModule } from './boards/boards.rest.module';
import { TaskRestModule } from './task/task.rest.module';
import { ColumnRestModule } from './column/column.rest.module';
import { WebSocketRestModule } from './websocket/websocket.rest.module';
import { AgendaRestModule } from './agenda/agenda.rest.module';
import { AgendaItemRestModule } from './agenda-item/agenda-item.rest.module';
import { RoutineRestModule } from './routine/routine.rest.module';
import { AlarmRestModule } from './alarm/alarm.rest.module';
import { GoalRestModule } from './goal/goal.rest.module';

@Module({
  imports: [
    ProjectsRestModule,
    BoardsRestModule,
    TaskRestModule,
    ColumnRestModule,
    WebSocketRestModule,
    AgendaRestModule,
    AgendaItemRestModule,
    RoutineRestModule,
    AlarmRestModule,
    GoalRestModule,
  ],
})
export class RestModule {}
