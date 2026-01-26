import { Module } from '@nestjs/common';
import { TasksCoreService } from './service/tasks.core.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TaskCreateUseCase } from './usecase/task.create.usecase';
import { TaskDeleteUseCase } from './usecase/task.delete.usecase';
import { TaskGetAllUseCase } from './usecase/task.get-all.usecase';
import { TaskGetOneUseCase } from './usecase/task.get-one.usecase';
import { TaskUpdateUseCase } from './usecase/task.update.usecase';
import { TaskMoveUseCase } from './usecase/task.move.usecase';
import { TaskPrismaRepository } from './repository/task.prisma.repository';
import { TASK_REPOSITORY } from './repository/task.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';
import { TaskLogsCoreModule } from '../task-logs/task-logs.core.module';
import { ColumnsCoreModule } from '../columns/columns.core.module';

@Module({
  imports: [PrismaModule, TaskLogsCoreModule, ColumnsCoreModule],
  controllers: [],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new TaskPrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'task', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    TaskCreateUseCase,
    TaskGetAllUseCase,
    TaskGetOneUseCase,
    TaskUpdateUseCase,
    TaskDeleteUseCase,
    TaskMoveUseCase,
    TasksCoreService,
  ],
  exports: [TasksCoreService],
})
export class TasksCoreModule {}
