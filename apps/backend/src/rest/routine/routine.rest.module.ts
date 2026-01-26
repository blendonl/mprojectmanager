import { Module } from '@nestjs/common';
import { RoutinesCoreModule } from 'src/core/routines/routines.core.module';
import { RoutineController } from './controller/routine.controller';
import { RoutineTaskLogController } from './controller/routine-task-log.controller';

@Module({
  imports: [RoutinesCoreModule],
  controllers: [RoutineController, RoutineTaskLogController],
})
export class RoutineRestModule {}
