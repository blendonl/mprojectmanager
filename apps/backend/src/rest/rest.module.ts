import { Module } from '@nestjs/common';
import { ProjectsRestModule } from './projects/projects.rest.module';
import { BoardsRestModule } from './boards/boards.rest.module';
import { TaskRestModule } from './task/task.rest.module';
import { ColumnRestModule } from './column/column.rest.module';
import { WebSocketRestModule } from './websocket/websocket.rest.module';

@Module({
  imports: [
    ProjectsRestModule,
    BoardsRestModule,
    TaskRestModule,
    ColumnRestModule,
    WebSocketRestModule,
  ],
})
export class RestModule {}
