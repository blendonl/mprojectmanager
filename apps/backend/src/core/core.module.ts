import { Module } from '@nestjs/common';
import { ProjectsCoreModule } from './projects/projects.core.module';
import { BoardsCoreModule } from './boards/boards.core.module';
import { ColumnsCoreModule } from './columns/columns.core.module';
import { TasksCoreModule } from './tasks/tasks.core.module';
import { EventsCoreModule } from './events/events.core.module';

@Module({
  imports: [
    EventsCoreModule,
    ProjectsCoreModule,
    BoardsCoreModule,
    ColumnsCoreModule,
    TasksCoreModule,
  ],
})
export class CoreModule {}
