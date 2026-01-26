import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';
import { AgendaItemCoreService } from './service/agenda-item.core.service';
import { AGENDA_ITEM_REPOSITORY } from './repository/agenda-item.repository';
import { AgendaItemPrismaRepository } from './repository/agenda-item.prisma.repository';
import { AgendaItemCreateUseCase } from './usecase/agenda-item.create.usecase';
import { AgendaItemGetAllUseCase } from './usecase/agenda-item.get-all.usecase';
import { AgendaItemGetOneUseCase } from './usecase/agenda-item.get-one.usecase';
import { AgendaItemUpdateUseCase } from './usecase/agenda-item.update.usecase';
import { AgendaItemDeleteUseCase } from './usecase/agenda-item.delete.usecase';
import { AgendaItemGetOrphanedUseCase } from './usecase/agenda-item.get-orphaned.usecase';
import { AgendaItemGetOverdueUseCase } from './usecase/agenda-item.get-overdue.usecase';
import { AgendaItemGetUpcomingUseCase } from './usecase/agenda-item.get-upcoming.usecase';
import { AgendaItemGetUnfinishedUseCase } from './usecase/agenda-item.get-unfinished.usecase';
import { AgendaItemCompleteUseCase } from './usecase/agenda-item.complete.usecase';
import { AgendaItemRescheduleUseCase } from './usecase/agenda-item.reschedule.usecase';
import { AgendaItemMarkUnfinishedUseCase } from './usecase/agenda-item.mark-unfinished.usecase';
import { AgendaItemMarkExpiredUnfinishedUseCase } from './usecase/agenda-item.mark-expired-unfinished.usecase';
import { AgendaCoreModule } from '../agenda/agenda.core.module';

@Module({
  imports: [PrismaModule, AgendaCoreModule],
  providers: [
    {
      provide: AGENDA_ITEM_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new AgendaItemPrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'agenda-item', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    AgendaItemCreateUseCase,
    AgendaItemGetAllUseCase,
    AgendaItemGetOneUseCase,
    AgendaItemUpdateUseCase,
    AgendaItemDeleteUseCase,
    AgendaItemGetOrphanedUseCase,
    AgendaItemGetOverdueUseCase,
    AgendaItemGetUpcomingUseCase,
    AgendaItemGetUnfinishedUseCase,
    AgendaItemCompleteUseCase,
    AgendaItemRescheduleUseCase,
    AgendaItemMarkUnfinishedUseCase,
    AgendaItemMarkExpiredUnfinishedUseCase,
    AgendaItemCoreService,
  ],
  exports: [AgendaItemCoreService, AgendaItemMarkExpiredUnfinishedUseCase],
})
export class AgendaItemCoreModule {}
