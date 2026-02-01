import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';
import { AgendaCoreService } from './service/agenda.core.service';
import { AGENDA_REPOSITORY } from './repository/agenda.repository';
import { AgendaPrismaRepository } from './repository/agenda.prisma.repository';
import { AgendaCreateUseCase } from './usecase/agenda.create.usecase';
import { AgendaGetAllUseCase } from './usecase/agenda.get-all.usecase';
import { AgendaGetOneUseCase } from './usecase/agenda.get-one.usecase';
import { AgendaGetByDateUseCase } from './usecase/agenda.get-by-date.usecase';
import { AgendaUpdateUseCase } from './usecase/agenda.update.usecase';
import { AgendaDeleteUseCase } from './usecase/agenda.delete.usecase';
import { AgendaGetDateRangeUseCase } from './usecase/agenda.get-date-range.usecase';
import { AgendaGetRangeSummaryUseCase } from './usecase/agenda.get-range-summary.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: AGENDA_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new AgendaPrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'agenda', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    AgendaCreateUseCase,
    AgendaGetAllUseCase,
    AgendaGetOneUseCase,
    AgendaGetByDateUseCase,
    AgendaUpdateUseCase,
    AgendaDeleteUseCase,
    AgendaGetDateRangeUseCase,
    AgendaGetRangeSummaryUseCase,
    AgendaCoreService,
  ],
  exports: [AgendaCoreService, AGENDA_REPOSITORY],
})
export class AgendaCoreModule {}
