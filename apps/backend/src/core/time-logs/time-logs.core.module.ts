import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TIME_LOG_REPOSITORY } from './repository/time-log.repository';
import { TimeLogPrismaRepository } from './repository/time-log.prisma.repository';
import { TimeLogsCoreService } from './service/time-logs.core.service';
import { TimeLogCreateUseCase } from './usecase/time-log.create.usecase';
import { TimeLogGetDailyUseCase } from './usecase/time-log.get-daily.usecase';
import { TimeLogGetProjectSummaryUseCase } from './usecase/time-log.get-project-summary.usecase';
import { TimeLogGetTaskTimeUseCase } from './usecase/time-log.get-task-time.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TIME_LOG_REPOSITORY,
      useClass: TimeLogPrismaRepository,
    },
    TimeLogCreateUseCase,
    TimeLogGetProjectSummaryUseCase,
    TimeLogGetDailyUseCase,
    TimeLogGetTaskTimeUseCase,
    TimeLogsCoreService,
  ],
  exports: [TimeLogsCoreService],
})
export class TimeLogsCoreModule {}
