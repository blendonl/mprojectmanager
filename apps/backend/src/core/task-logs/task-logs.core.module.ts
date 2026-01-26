import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TASK_LOG_REPOSITORY } from './repository/task-log.repository';
import { TaskLogPrismaRepository } from './repository/task-log.prisma.repository';
import { TaskLogsCoreService } from './service/task-logs.core.service';
import { TaskLogCreateUseCase } from './usecase/task-log.create.usecase';
import { TaskLogGetByTaskUseCase } from './usecase/task-log.get-by-task.usecase';
import { TaskLogGetWorkDurationUseCase } from './usecase/task-log.get-work-duration.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TASK_LOG_REPOSITORY,
      useClass: TaskLogPrismaRepository,
    },
    TaskLogCreateUseCase,
    TaskLogGetByTaskUseCase,
    TaskLogGetWorkDurationUseCase,
    TaskLogsCoreService,
  ],
  exports: [TaskLogsCoreService],
})
export class TaskLogsCoreModule {}
