import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GOAL_REPOSITORY } from './repository/goal.repository';
import { GoalPrismaRepository } from './repository/goal.prisma.repository';
import { GoalsCoreService } from './service/goals.core.service';
import { GoalCreateUseCase } from './usecase/goal.create.usecase';
import { GoalDeleteUseCase } from './usecase/goal.delete.usecase';
import { GoalGetAllUseCase } from './usecase/goal.get-all.usecase';
import { GoalGetOneUseCase } from './usecase/goal.get-one.usecase';
import { GoalUpdateUseCase } from './usecase/goal.update.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: GOAL_REPOSITORY,
      useClass: GoalPrismaRepository,
    },
    GoalCreateUseCase,
    GoalGetAllUseCase,
    GoalGetOneUseCase,
    GoalUpdateUseCase,
    GoalDeleteUseCase,
    GoalsCoreService,
  ],
  exports: [GoalsCoreService],
})
export class GoalsCoreModule {}
