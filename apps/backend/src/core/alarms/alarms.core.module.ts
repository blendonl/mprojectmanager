import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';
import { AlarmCoreService } from './service/alarm.core.service';
import {
  ALARM_PLAN_REPOSITORY,
} from './repository/alarm-plan.repository';
import { AlarmPlanPrismaRepository } from './repository/alarm-plan.prisma.repository';
import { AlarmPlanCreateUseCase } from './usecase/alarm-plan.create.usecase';
import { AlarmPlanGetByRoutineTaskUseCase } from './usecase/alarm-plan.get-by-routine-task.usecase';
import { AlarmPlanGetOneUseCase } from './usecase/alarm-plan.get-one.usecase';
import { AlarmPlanUpdateUseCase } from './usecase/alarm-plan.update.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ALARM_PLAN_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new AlarmPlanPrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'alarm-plan', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    AlarmPlanCreateUseCase,
    AlarmPlanGetByRoutineTaskUseCase,
    AlarmPlanGetOneUseCase,
    AlarmPlanUpdateUseCase,
    AlarmCoreService,
  ],
  exports: [ALARM_PLAN_REPOSITORY, AlarmCoreService],
})
export class AlarmsCoreModule {}
