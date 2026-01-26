import { Module } from '@nestjs/common';
import { PrismaProjectRepository } from './repositories/prisma-project.repository';
import { ProjectCreateUseCase } from './usecases/project.create.usecase';
import { ProjectGetAllUseCase } from './usecases/project.get-all.usecase';
import { ProjectGetOneUseCase } from './usecases/project.get-one.usecase';
import { ProjectGetOneWithDetailsUseCase } from './usecases/project.get-one-with-details.usecase';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PROJECT_REPOSITORY } from './repositories/project.repository';
import { ProjectsCoreService } from './service/projects.core.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new PrismaProjectRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'project', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    ProjectCreateUseCase,
    ProjectGetAllUseCase,
    ProjectGetOneUseCase,
    ProjectGetOneWithDetailsUseCase,
    ProjectsCoreService,
  ],

  exports: [ProjectsCoreService],
})
export class ProjectsCoreModule {}
