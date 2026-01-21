import { Module } from '@nestjs/common';
import { TasksController } from './controller/tasks.controller';
import { TasksCoreModule } from 'src/core/tasks/tasks.core.module';

@Module({
  imports: [TasksCoreModule],
  controllers: [TasksController],
})
export class TaskRestModule {}
