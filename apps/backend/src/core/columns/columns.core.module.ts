import { Module } from '@nestjs/common';
import { ColumnCreateUseCase } from './usecase/column.create.usecase';
import { ColumnDeleteUseCase } from './usecase/column.delete.usecase';
import { ColumnGetAllUseCase } from './usecase/column.get-all.usecase';
import { ColumnGetOneUseCase } from './usecase/column.get-one.usecase';
import { ColumnUpdateUseCase } from './usecase/column.update.usecase';
import { ColumnsCoreService } from './service/columns.core.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { COLUMN_REPOSITORY } from './repository/column.repository';
import { ColumnsPrismaRepository } from './repository/column.prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: COLUMN_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new ColumnsPrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'column', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    ColumnCreateUseCase,
    ColumnGetAllUseCase,
    ColumnGetOneUseCase,
    ColumnUpdateUseCase,
    ColumnDeleteUseCase,
    ColumnsCoreService,
  ],
  exports: [ColumnsCoreService, COLUMN_REPOSITORY],
})
export class ColumnsCoreModule {}
