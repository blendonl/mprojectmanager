import { Module } from '@nestjs/common';
import { ProjectsCoreModule } from './projects/projects.core.module';
import { BoardsCoreModule } from './boards/boards.core.module';
import { ColumnsCoreModule } from './columns/columns.core.module';
import { TasksCoreModule } from './tasks/tasks.core.module';
import { EventsCoreModule } from './events/events.core.module';
import { AgendaCoreModule } from './agenda/agenda.core.module';
import { AgendaItemCoreModule } from './agenda-item/agenda-item.core.module';
import { RoutinesCoreModule } from './routines/routines.core.module';
import { AlarmsCoreModule } from './alarms/alarms.core.module';

@Module({
  imports: [
    EventsCoreModule,
    ProjectsCoreModule,
    BoardsCoreModule,
    ColumnsCoreModule,
    TasksCoreModule,
    AgendaCoreModule,
    AgendaItemCoreModule,
    RoutinesCoreModule,
    AlarmsCoreModule,
  ],
})
export class CoreModule {}
