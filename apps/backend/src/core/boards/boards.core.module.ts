import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoardCreateUseCase } from './usecases/board.create.usecase';
import { BoardDeleteUseCase } from './usecases/board.delete.usecase';
import { BoardGetAllUseCase } from './usecases/board.get-all.usecase';
import { BoardGetOneUseCase } from './usecases/board.get-one.usecase';
import { BoardUpdateUseCase } from './usecases/board.update.usecase';
import { BOARD_REPOSITORY } from './repositories/board.repository';
import { PrismaBoardRepository } from './repositories/prisma-board.repository';
import { BoardsCoreService } from './service/boards.core.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: BOARD_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new PrismaBoardRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'board', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    BoardCreateUseCase,
    BoardGetAllUseCase,
    BoardGetOneUseCase,
    BoardUpdateUseCase,
    BoardDeleteUseCase,
    BoardsCoreService,
  ],
  exports: [BoardsCoreService],
})
export class BoardsCoreModule {}
