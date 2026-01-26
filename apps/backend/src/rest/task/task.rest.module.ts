import { Module } from '@nestjs/common';
import { TasksController } from './controller/tasks.controller';
import { TasksCoreModule } from 'src/core/tasks/tasks.core.module';
import { TaskLogsCoreModule } from 'src/core/task-logs/task-logs.core.module';

@Module({
  imports: [TasksCoreModule, TaskLogsCoreModule],
  controllers: [TasksController],
})
export class TaskRestModule {}
