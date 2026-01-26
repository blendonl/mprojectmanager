import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AlarmsCoreModule } from '../alarms/alarms.core.module';
import { AgendaCoreModule } from '../agenda/agenda.core.module';
import { AgendaItemCoreModule } from '../agenda-item/agenda-item.core.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';
import { RoutinesCoreService } from './service/routines.core.service';
import {
  ROUTINE_REPOSITORY,
} from './repository/routine.repository';
import {
  ROUTINE_TASK_REPOSITORY,
} from './repository/routine-task.repository';
import {
  ROUTINE_TASK_LOG_REPOSITORY,
} from './repository/routine-task-log.repository';
import { RoutinePrismaRepository } from './repository/routine.prisma.repository';
import { RoutineTaskPrismaRepository } from './repository/routine-task.prisma.repository';
import { RoutineTaskLogPrismaRepository } from './repository/routine-task-log.prisma.repository';
import { RoutineCreateUseCase } from './usecase/routine.create.usecase';
import { RoutineDeleteUseCase } from './usecase/routine.delete.usecase';
import { RoutineGetAllUseCase } from './usecase/routine.get-all.usecase';
import { RoutineGetOneUseCase } from './usecase/routine.get-one.usecase';
import { RoutineUpdateUseCase } from './usecase/routine.update.usecase';
import { RoutineTaskLogCreateUseCase } from './usecase/routine-task-log.create.usecase';
import { RoutineAlarmPlanner } from './service/routine-alarm-planner.service';
import { RoutineAgendaPlanner } from './service/routine-agenda-planner.service';

@Module({
  imports: [PrismaModule, AlarmsCoreModule, AgendaCoreModule, AgendaItemCoreModule],
  providers: [
    {
      provide: ROUTINE_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new RoutinePrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'routine', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    {
      provide: ROUTINE_TASK_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new RoutineTaskPrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'routine-task', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    {
      provide: ROUTINE_TASK_LOG_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new RoutineTaskLogPrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'routine-task-log', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    RoutineCreateUseCase,
    RoutineGetAllUseCase,
    RoutineGetOneUseCase,
    RoutineUpdateUseCase,
    RoutineDeleteUseCase,
    RoutineTaskLogCreateUseCase,
    RoutineAlarmPlanner,
    RoutineAgendaPlanner,
    RoutinesCoreService,
  ],
  exports: [
    ROUTINE_REPOSITORY,
    ROUTINE_TASK_REPOSITORY,
    ROUTINE_TASK_LOG_REPOSITORY,
    RoutineAlarmPlanner,
    RoutineAgendaPlanner,
    RoutinesCoreService,
  ],
})
export class RoutinesCoreModule {}
